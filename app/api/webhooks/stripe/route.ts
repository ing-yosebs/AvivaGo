
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';



export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

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

    const supabase = await createClient();

    try {
        switch (event.type) {
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
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
                const invoice = event.data.object as Stripe.Invoice;
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
        }
    } catch (error: any) {
        console.error(`[WEBHOOK] Handler Error: ${error.message}`);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }

    return NextResponse.json({ received: true });
}
