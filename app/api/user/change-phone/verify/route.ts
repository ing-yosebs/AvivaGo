import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Admin client
import { createClient as createServerClient } from '@/lib/supabase/server'; // Auth client
import { headers } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { newPhone, code } = await request.json();

        if (!newPhone || !code) {
            return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
        }

        const cleanPhone = newPhone.replace(/\D/g, '');

        // 1. Authenticate Request
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. Verify Code
        const { data: records, error: dbError } = await supabaseAdmin
            .from('verification_codes')
            .select('*')
            .eq('phone', cleanPhone)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (dbError || !records || records.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
        }

        // 3. Update Auth User
        const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            phone: cleanPhone,
            phone_confirm: true // Auto confirm since we verified OTA
        });

        if (updateAuthError) {
            return NextResponse.json({ error: `Failed to update auth: ${updateAuthError.message}` }, { status: 500 });
        }

        // 4. Update Public User (Sync)
        const oldPhone = user.phone; // Capture old phone for logs

        const { error: updatePublicError } = await supabaseAdmin
            .from('users')
            .update({ phone_number: cleanPhone })
            .eq('id', user.id);

        if (updatePublicError) {
            console.error('Failed to update public user profile:', updatePublicError);
            // Non-critical if Auth updated, but messy.
        }

        // 5. Audit Log
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        await supabaseAdmin.from('phone_change_logs').insert({
            user_id: user.id,
            old_phone: oldPhone,
            new_phone: cleanPhone,
            ip_address: ip,
            user_agent: userAgent
        });

        // Cleanup Code
        await supabaseAdmin.from('verification_codes').delete().eq('phone', cleanPhone);

        return NextResponse.json({ success: true, message: 'Phone number updated successfully' });

    } catch (error: any) {
        console.error('Change Phone Verify Error:', error);
        return NextResponse.json({
            error: `Internal Error: ${error.message}`
        }, { status: 500 });
    }
}
