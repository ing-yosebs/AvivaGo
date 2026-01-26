
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

        const { sessionId } = await req.json();

        if (!sessionId) {
            return new NextResponse('Missing sessionId', { status: 400 });
        }

        // 1. Retrieve the session from Stripe to verify it's paid and valid
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return new NextResponse('Session not paid', { status: 400 });
        }

        // 2. Validate user owns this session
        if (session.metadata?.user_id !== user.id) {
            return new NextResponse('User mismatch', { status: 403 });
        }

        const driverProfileId = session.metadata?.driver_profile_id;
        const amountPaid = session.metadata?.amount_paid;

        if (!driverProfileId) {
            return new NextResponse('Invalid metadata', { status: 400 });
        }

        // 3. Check if we already have the unlock record
        const { data: existing } = await supabase
            .from('unlocks')
            .select('id')
            .eq('user_id', user.id)
            .eq('driver_profile_id', driverProfileId)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ success: true, message: 'Already unlocked' });
        }

        // 4. Create the record (Manual Fallback)
        // We use supabase client here. Assuming user has permission to insert or we use admin if needed.
        // Usually, 'unlocks' table should have a policy for users to see their own. 
        // We'll use the regular client to respect RLS or just let it fail if permissions are tight.
        // Actually, to be safe and since it's verified by Stripe, we use the admin client logic if available
        // but here we'll stick to the regular client for simplicity in this flow.

        const { error: insertError } = await supabase
            .from('unlocks')
            .insert({
                user_id: user.id,
                driver_profile_id: driverProfileId,
                amount_paid: amountPaid,
            });

        if (insertError) {
            console.error('Error inserting unlock:', insertError);
            return new NextResponse('Database Sync Error: ' + insertError.message, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Unlock verified and stored' });

    } catch (error: any) {
        console.error('[VERIFY_PAYMENT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
