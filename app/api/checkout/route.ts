
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Parse body to determine payment type
        let body;
        try {
            body = await req.json();
        } catch (e) {
            body = {}; // Fallback for existing membership calls if they don't send body
        }

        const { type = 'membership', driverId, amount, returnPath } = body;

        // Determine base URL dynamically if env var is missing
        const origin = new URL(req.url).origin;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin;

        // Retrieve extra user info (name) for Stripe Customer creation if needed
        const { data: userProfile } = await supabase
            .from('users')
            .select('full_name, phone_number, stripe_customer_id')
            .eq('id', user.id)
            .single();

        let stripeCustomerId = userProfile?.stripe_customer_id;

        if (!stripeCustomerId) {
            // Create a new Stripe Customer
            const customer = await stripe.customers.create({
                email: user.email,
                name: userProfile?.full_name || user.email,
                phone: userProfile?.phone_number || undefined,
                metadata: {
                    user_id: user.id,
                }
            });
            stripeCustomerId = customer.id;

            // Save it to the database so we don't create duplicates
            await supabase
                .from('users')
                .update({ stripe_customer_id: stripeCustomerId })
                .eq('id', user.id);
        }

        // --- TYPE: MEMBERSHIP (Subscription) ---
        if (type === 'membership') {
            const { data: driverProfile } = await supabase
                .from('driver_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!driverProfile) return new NextResponse('Driver Profile Not Found', { status: 404 });

            const priceId = process.env.STRIPE_PRICE_ID;
            if (!priceId) return new NextResponse('Stripe Price ID not configured', { status: 500 });

            console.log("Creating Membership Session for", user.email);

            const session = await stripe.checkout.sessions.create({
                success_url: `${baseUrl}/checkout/callback?status=success&type=membership&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/checkout/callback?status=canceled&type=membership`,
                customer: stripeCustomerId,
                payment_method_types: ['card', 'oxxo', 'customer_balance'],
                payment_method_options: {
                    customer_balance: {
                        funding_type: 'bank_transfer',
                        bank_transfer: {
                            type: 'mx_bank_transfer',
                        },
                    },
                },
                mode: 'payment',
                // customer_email: user.email, // Cannot specify both customer and customer_email
                line_items: [{
                    price_data: {
                        currency: 'mxn',
                        product_data: {
                            name: 'Membresía Anual Driver Premium',
                            description: 'Acceso por 1 año a la plataforma AvivaGo',
                        },
                        unit_amount: 52400, // $524.00 MXN in cents
                    },
                    quantity: 1
                }],
                automatic_tax: { enabled: true },
                metadata: {
                    type: 'membership',
                    user_id: user.id,
                    driver_profile_id: driverProfile.id,
                },
            });

            // Store pending payment
            await supabase.from('pending_payments').insert({
                user_id: user.id,
                driver_profile_id: driverProfile.id,
                stripe_session_id: session.id,
                checkout_url: session.url,
                status: 'open',
                metadata: { type: 'membership' }
            });

            return NextResponse.json({ url: session.url });
        }

        // --- TYPE: UNLOCK (One-time Payment) ---
        if (type === 'unlock') {
            if (!driverId || !amount) return new NextResponse('Missing driverId or amount', { status: 400 });

            // Enforce Profile Completion (Validation)
            // We already fetched userProfile above, so check it here
            if (!userProfile?.full_name || !userProfile?.phone_number) {
                return NextResponse.json(
                    { error: 'Debes completar tu perfil (nombre y teléfono) antes de contactar conductores.' },
                    { status: 400 } // Or 403
                );
            }

            // Validate amount (Stripe expects integers in cents if using currency, OR price_data)
            // We'll use ad-hoc price_data construction
            // Amount comes from frontend as float (e.g. 15.00), Stripe needs cents (1500)
            const amountInCents = Math.round(Number(amount) * 100);

            console.log(`Creating Unlock Session: User ${user.email} -> Driver ${driverId} ($${amount})`);

            const session = await stripe.checkout.sessions.create({
                success_url: `${baseUrl}/checkout/callback?status=success&type=unlock&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/checkout/callback?status=canceled&type=unlock`,
                customer: stripeCustomerId,
                payment_method_types: ['card', 'oxxo', 'customer_balance'],
                payment_method_options: {
                    customer_balance: {
                        funding_type: 'bank_transfer',
                        bank_transfer: {
                            type: 'mx_bank_transfer',
                        },
                    },
                },
                mode: 'payment',
                // customer_email: user.email, // Cannot specify both customer and customer_email
                line_items: [{
                    price_data: {
                        currency: 'mxn',
                        product_data: {
                            name: 'Desbloqueo de Contacto',
                            description: 'Acceso a datos de contacto del conductor en AvivaGo',
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                }],
                automatic_tax: { enabled: true },
                metadata: {
                    type: 'unlock',
                    user_id: user.id,
                    driver_profile_id: driverId,
                    amount_paid: String(amount),
                },
            });
            return NextResponse.json({ url: session.url });
        }

        return new NextResponse('Invalid payment type', { status: 400 });

    } catch (error: any) {
        console.error('[STRIPE_CHECKOUT]', error);
        return new NextResponse('Internal Error: ' + error.message, { status: 500 });
    }
}
