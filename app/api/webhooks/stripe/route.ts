
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set');
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseServiceKey) {
        console.error('MISSING SUPABASE_SERVICE_ROLE_KEY');
        return new NextResponse('Internal Config Error', { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        switch (event.type) {
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                const subscriptionId = invoice.subscription as string;

                // Verify if this is a subscription renewal
                if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
                    console.log(`[WEBHOOK] Renewing subscription: ${subscriptionId}`);

                    // Find membership by subscription ID
                    const { data: membership } = await supabase
                        .from('driver_memberships')
                        .select('id, expires_at')
                        .eq('stripe_subscription_id', subscriptionId)
                        .single();

                    if (membership) {
                        // Extend expiration by 1 year from current expiry or now
                        const currentExpiry = new Date(membership.expires_at);
                        const now = new Date();
                        // If expired, start from now. If active, add to current expiry.
                        const baseDate = currentExpiry > now ? currentExpiry : now;
                        baseDate.setFullYear(baseDate.getFullYear() + 1);

                        await supabase
                            .from('driver_memberships')
                            .update({
                                status: 'active',
                                expires_at: baseDate.toISOString(),
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', membership.id);

                        console.log(`[WEBHOOK] Membership extended until: ${baseDate.toISOString()}`);
                    } else {
                        console.warn(`[WEBHOOK] Subscription ${subscriptionId} not found in DB`);
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                const subscriptionId = invoice.subscription as string;

                if (subscriptionId) {
                    console.log(`[WEBHOOK] Payment failed for subsidy: ${subscriptionId}`);
                    await supabase
                        .from('driver_memberships')
                        .update({ status: 'past_due', updated_at: new Date().toISOString() })
                        .eq('stripe_subscription_id', subscriptionId);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log(`[WEBHOOK] Subscription canceled: ${subscription.id}`);
                await supabase
                    .from('driver_memberships')
                    .update({ status: 'canceled', updated_at: new Date().toISOString() })
                    .eq('stripe_subscription_id', subscription.id);
                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const { type, driver_profile_id, user_id } = session.metadata || {};

                if (session.payment_status === 'paid') {
                    console.log(`[WEBHOOK] Payment record for: ${type}`);

                    if (type === 'membership') {
                        const expiresAt = new Date();
                        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

                        await supabase
                            .from('driver_memberships')
                            .upsert({
                                driver_profile_id,
                                origin: 'paid',
                                status: 'active',
                                stripe_subscription_id: session.subscription as string,
                                expires_at: expiresAt.toISOString(),
                                updated_at: new Date().toISOString()
                            }, { onConflict: 'driver_profile_id' });
                    }

                    if (type === 'unlock') {
                        await supabase
                            .from('unlocks')
                            .insert({
                                user_id: user_id,
                                driver_profile_id: driver_profile_id,
                                amount_paid: session.amount_total ? session.amount_total / 100 : 0,
                                currency: session.currency || 'mxn',
                                payment_provider_id: session.id,
                                status: 'completed'
                            });
                    }

                    // Mark pending payment as completed
                    await supabase
                        .from('pending_payments')
                        .update({ status: 'completed', updated_at: new Date().toISOString() })
                        .eq('stripe_session_id', session.id);
                }
                break;
            }
        }
    } catch (error: any) {
        console.error(`[WEBHOOK] Handler Error: ${error.message}`);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }

    return NextResponse.json({ received: true });
}
