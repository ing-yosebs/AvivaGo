
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { session_id } = body;

        if (!session_id) {
            return new NextResponse('Missing session_id', { status: 400 });
        }

        console.log('[CONFIRM] Verifying session:', session_id);

        // 1. Verify with Stripe that the session is actually paid
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            console.error('[CONFIRM] Session not paid:', session.payment_status);
            return new NextResponse('Payment not completed', { status: 400 });
        }

        // Initialize Supabase Admin Client to bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseServiceKey) {
            throw new Error('MISSING SUPABASE_SERVICE_ROLE_KEY');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { type, user_id, driver_profile_id } = session.metadata || {};

        if (!type || !user_id) {
            console.error('[CONFIRM] Missing metadata:', session.metadata);
            return new NextResponse('Invalid session metadata', { status: 400 });
        }

        // 2. Handle Membership Persistence
        if (type === 'membership') {
            if (!driver_profile_id) return new NextResponse('Missing driver profile ID', { status: 400 });

            // Calculate Expiry (1 Year)
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);

            // Insert or Update Membership
            const { error } = await supabase
                .from('driver_memberships')
                .upsert({
                    driver_profile_id,
                    origin: 'paid',
                    status: 'active',
                    stripe_subscription_id: session.subscription as string,
                    expires_at: expiresAt.toISOString(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'driver_profile_id' });

            if (error) {
                console.error('[CONFIRM] DB Error:', error);
                throw error;
            }

            // Also ensure we record the transaction in 'unlocks' for history (as a self-unlock/payment record)
            // This is optional but good for the "Historial" table in UI
            await supabase.from('unlocks').insert({
                user_id: user_id,
                driver_profile_id: driver_profile_id,
                amount_paid: session.amount_total ? session.amount_total / 100 : 524,
                status: 'completed',
                payment_provider_id: session_id
            });

            console.log('[CONFIRM] Membership activated for:', driver_profile_id);
            return NextResponse.json({ success: true });
        }

        // 3. Handle Unlock Persistence (Already done? Or need to do?)
        // Currently your system might rely on this too. Let's add it for safety.
        if (type === 'unlock') {
            if (!driver_profile_id) return new NextResponse('Missing driver profile ID', { status: 400 });

            const { error } = await supabase
                .from('unlocks')
                .insert({
                    user_id: user_id,
                    driver_profile_id: driver_profile_id,
                    amount_paid: session.amount_total ? session.amount_total / 100 : 0,
                    currency: session.currency || 'mxn',
                    payment_provider_id: session_id,
                    status: 'completed',
                    // valid_until: null (forever)
                });

            if (error) {
                // Ignore duplicate key error (if user double clicked)
                if (error.code !== '23505') {
                    console.error('[CONFIRM] DB Error Unlock:', error);
                    throw error;
                }
            }

            console.log('[CONFIRM] Unlock recorded for:', user_id, '->', driver_profile_id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[CHECKOUT_CONFIRM_ERROR]', error);
        return new NextResponse('Internal Error: ' + error.message, { status: 500 });
    }
}
