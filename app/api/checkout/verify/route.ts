import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Helper to get user in a background-friendly way
async function getAuthUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function POST(req: Request) {
    try {
        // We need both for verification and admin write
        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const user = await getAuthUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) return new NextResponse('Missing sessionId', { status: 400 });

        // 1. Retrieve the session from Stripe to verify it's paid and valid
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return new NextResponse('Session not paid', { status: 400 });
        }

        // 2. Validate user owns this session OR it's a valid session for this user
        const metadataUserId = session.metadata?.user_id;

        // Log mismatch for debugging but allow if IDs look equivalent or we trust the session retrieve
        if (metadataUserId && metadataUserId !== user.id) {
            console.warn(`User mismatch in verification: session.user=${metadataUserId}, current.user=${user.id}`);
            // We'll proceed if we trust Stripe's retrieval, but usually we want them to match.
            // For now, let's keep it strict but more descriptive in logs.
            return new NextResponse('User mismatch. Please ensure you are logged into the correct account.', { status: 403 });
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

        // 4. Create the record using Admin Client
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error: insertError } = await supabaseAdmin
            .from('unlocks')
            .insert({
                user_id: user.id,
                driver_profile_id: driverProfileId,
                amount_paid: amountPaid ? parseFloat(amountPaid) : 18.00,
                status: 'completed'
            });

        if (insertError) {
            console.error('Error inserting unlock:', insertError);
            return new NextResponse(`Database Sync Error: ${insertError.message}`, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[VERIFY_PAYMENT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
