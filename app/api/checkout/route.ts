
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        
        // Use getUser for maximum security, but fallback to getSession for local state checks if needed
        let { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            // Descriptive error for debugging production session issues
            const { data: { session } } = await supabase.auth.getSession();
            user = session?.user || null;
            
            if (!user) {
                console.error('[STRIPE_CHECKOUT] No active session found');
                return new NextResponse('Error de Sesión: Por favor inicia sesión nuevamente.', { status: 401 });
            }
        }

        // Parse body carefully
        let body = {};
        const contentType = req.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                body = await req.json();
            } catch (e) {
                console.warn('[STRIPE_CHECKOUT] Failed to parse JSON body');
            }
        }

        const { type = 'membership', driverId, amount, returnPath } = body as any;

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

        // Verify if customer exists in Stripe (prevents "No such customer" error if DB is out of sync)
        if (stripeCustomerId) {
            try {
                const existingCustomer = await stripe.customers.retrieve(stripeCustomerId);
                if ((existingCustomer as any).deleted) {
                    stripeCustomerId = null;
                }
            } catch (e: any) {
                // If customer is not found in Stripe (e.g. switched from test to live mode)
                if (e.status === 404 || e.code === 'resource_missing') {
                    stripeCustomerId = null;
                } else {
                    throw e;
                }
            }
        }

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
                .select('id, country_code, zone_id')
                .eq('user_id', user.id)
                .single();

            if (!driverProfile) return new NextResponse('Driver Profile Not Found', { status: 404 });

            // Fetch Dynamic Price
            let zonePrice = null;

            // 1. Try Specific Zone
            if (driverProfile.zone_id) {
                const { data } = await supabase.from('zone_prices')
                    .select('*')
                    .eq('zone_id', driverProfile.zone_id)
                    .eq('type', 'membership')
                    .single();
                if (data) zonePrice = data;
            }

            // 2. Fallback to Country Default (Generic Zone)
            if (!zonePrice) {
                const countryCode = driverProfile.country_code || 'MX';
                // Find a zone for this country that has a membership price (Logic might need refinement if multiple zones exist)
                // For now, we assume one "General" zone per country or pick the first available.
                // Ideally we query zones by country, then prices.
                const { data: countriesZones } = await supabase
                    .from('zones')
                    .select('id, zone_prices!inner(*)')
                    .eq('country_code', countryCode)
                    .eq('zone_prices.type', 'membership')
                    .limit(1)

                if (countriesZones && countriesZones.length > 0) {
                    const prices = countriesZones[0].zone_prices;
                    zonePrice = Array.isArray(prices) ? prices[0] : prices;
                }
            }

            if (!zonePrice) {
                // 3. Fallback globally to Plan B pricing rules
                const countryCode = driverProfile.country_code || 'MX';
                if (countryCode !== 'MX') {
                    zonePrice = { amount: 3000, currency: 'USD' };
                } else {
                    zonePrice = { amount: 52400, currency: 'MXN' };
                }
                console.log(`No explicit zone found for ${driverProfile.country_code}, applying global default: ${zonePrice.amount} ${zonePrice.currency}`);
            }

            if (!zonePrice) {
                return new NextResponse('No se pudo determinar el precio para tu región. Contacta a soporte.', { status: 400 });
            }

            const { amount: unitAmount, currency } = zonePrice;

            console.log(`Creating Membership Session for ${user.email}. Price: ${unitAmount} ${currency}`);

            const isMXN = currency.toUpperCase() === 'MXN';
            
            const session = await stripe.checkout.sessions.create({
                success_url: `${baseUrl}/checkout/callback?status=success&type=membership&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/checkout/callback?status=canceled&type=membership`,
                customer: stripeCustomerId,
                payment_method_types: isMXN ? ['card', 'oxxo', 'customer_balance'] : ['card'],
                payment_method_options: isMXN ? {
                    card: {
                        installments: {
                            enabled: true,
                        },
                    },
                    customer_balance: {
                        funding_type: 'bank_transfer',
                        bank_transfer: {
                            type: 'mx_bank_transfer',
                        },
                    },
                } : {
                    card: {
                        installments: {
                            enabled: false,
                        },
                    },
                },
                mode: 'payment',
                line_items: [{
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: 'Membresía Anual Driver Premium',
                            description: `Acceso por 1 año a la plataforma AvivaGo (${currency.toUpperCase()})`,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1
                }],
                automatic_tax: { enabled: false },
                customer_update: {
                    address: 'auto',
                },
                metadata: {
                    type: 'membership',
                    user_id: user.id,
                    driver_profile_id: driverProfile.id,
                    country_code: driverProfile.country_code,
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


        return new NextResponse('Invalid payment type', { status: 400 });

    } catch (error: any) {
        console.error('[STRIPE_CHECKOUT]', error);
        return new NextResponse('Internal Error: ' + error.message, { status: 500 });
    }
}
