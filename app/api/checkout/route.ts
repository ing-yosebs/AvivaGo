
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
                success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/perfil?tab=payments&success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/perfil?tab=payments&canceled=true`,
                payment_method_types: ['card'],
                mode: 'subscription',
                billing_address_collection: 'auto',
                customer_email: user.email,
                line_items: [{ price: priceId, quantity: 1 }],
                metadata: {
                    type: 'membership',
                    user_id: user.id,
                    driver_profile_id: driverProfile.id,
                },
            });
            return NextResponse.json({ url: session.url });
        }

        // --- TYPE: UNLOCK (One-time Payment) ---
        if (type === 'unlock') {
            if (!driverId || !amount) return new NextResponse('Missing driverId or amount', { status: 400 });

            // Validate amount (Stripe expects integers in cents if using currency, OR price_data)
            // We'll use ad-hoc price_data construction
            // Amount comes from frontend as float (e.g. 15.00), Stripe needs cents (1500)
            const amountInCents = Math.round(Number(amount) * 100);

            console.log(`Creating Unlock Session: User ${user.email} -> Driver ${driverId} ($${amount})`);

            const session = await stripe.checkout.sessions.create({
                success_url: `${process.env.NEXT_PUBLIC_BASE_URL}${returnPath || '/'}?unlocked=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}${returnPath || '/'}?canceled=true`,
                payment_method_types: ['card'],
                mode: 'payment',
                customer_email: user.email,
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
