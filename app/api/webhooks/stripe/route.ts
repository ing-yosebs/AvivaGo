
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET not set');
        }
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error: any) {
        console.error('Webhook signature verification failed:', error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.metadata?.type === 'unlock') {
                const driverProfileId = session.metadata.driver_profile_id;
                const userId = session.metadata.user_id;
                const amountPaid = session.metadata.amount_paid;

                console.log(`Webhook: Processing Unlock for Driver ${driverProfileId}`);

                // Insert into unlocks table
                const { error } = await supabaseAdmin
                    .from('unlocks')
                    .insert({
                        user_id: userId,
                        driver_profile_id: driverProfileId,
                        amount_paid: amountPaid,
                        created_at: new Date().toISOString()
                    });

                if (error) {
                    console.error('Error recording unlock:', error);
                    return new NextResponse('Database Error', { status: 500 });
                }
                return new NextResponse('Unlock Recorded', { status: 200 });
            }

            // Existing Membership Logic
            const driverProfileId = session.metadata?.driver_profile_id;
            const userId = session.metadata?.user_id;

            if (!driverProfileId) {
                console.error('No driver_profile_id in metadata');
                return new NextResponse('Metadata Error', { status: 400 });
            }

            // Upsert driver_membership
            // We assume subscription mode.
            const subscriptionId = session.subscription as string;

            // Get subscription details to find expiry
            const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
            const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

            // Perform upsert via SQL or direct table manipulation if RLS allows service role (it should)
            const { error } = await supabaseAdmin
                .from('driver_memberships')
                .upsert({
                    driver_profile_id: driverProfileId,
                    origin: 'paid',
                    status: 'active',
                    stripe_subscription_id: subscriptionId,
                    expires_at: expiresAt,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'driver_profile_id' });

            if (error) {
                console.error('Error updating membership:', error);
                return new NextResponse('Database Error', { status: 500 });
            }
        }

        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object as any;
            const subscriptionId = invoice.subscription as string;

            if (!subscriptionId) return new NextResponse('No subscription ID', { status: 200 });

            // Retrieve updated subscription expiry
            const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
            const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

            // Update expiry in DB
            const { error } = await supabaseAdmin
                .from('driver_memberships')
                .update({
                    expires_at: expiresAt,
                    status: 'active', // Ensure it's active
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', subscriptionId);

            if (error) {
                console.error('Error extending membership:', error);
                return new NextResponse('Database Error', { status: 500 });
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            const subscriptionId = subscription.id;

            // Mark as expired or canceled
            const { error } = await supabaseAdmin
                .from('driver_memberships')
                .update({
                    status: 'expired',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', subscriptionId);

            if (error) console.error('Error expiring membership:', error);
        }

        return new NextResponse('OK', { status: 200 });
    } catch (error: any) {
        console.error('Internal Webhook Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
