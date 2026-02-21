import { NextResponse } from 'next/server';
import { sendWhatsAppOtp } from '@/lib/whatsapp-cloud';
import { createClient } from '@supabase/supabase-js'; // Admin client for checking existence
import { createClient as createServerClient } from '@/lib/supabase/server'; // Auth client

export async function POST(request: Request) {
    try {
        const { newPhone } = await request.json();

        if (!newPhone) {
            return NextResponse.json({ error: 'New phone number is required' }, { status: 400 });
        }

        const cleanPhone = newPhone.replace(/\D/g, '');

        if (cleanPhone.length < 10) {
            return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
        }

        // 1. Authenticate Request
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check if phone is already taken (Admin Check)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Check auth.users
        const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
        // Note: listUsers is not efficient for large scale but for MVP/Start it works. 
        // Better: Query public.users if it's synced.

        // Let's check public.users first as it is indexed and faster query
        const { data: publicUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('phone_number', cleanPhone)
            .maybeSingle();

        if (publicUser && publicUser.id !== user.id) {
            return NextResponse.json({ error: 'This phone number is already associated with another account.' }, { status: 400 });
        }

        // 3. Generate & Store Code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const { error: dbError } = await supabaseAdmin
            .from('verification_codes')
            .insert({
                phone: cleanPhone,
                code: code,
                expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 mins
            });

        if (dbError) {
            console.error('DB Error:', dbError);
            return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
        }

        // 4. Send via WhatsApp
        const result = await sendWhatsAppOtp(cleanPhone, code);

        if (!result.success) {
            return NextResponse.json({ error: typeof result.error === 'string' ? result.error : 'Failed to send WhatsApp message' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Verification code sent' });

    } catch (error: any) {
        console.error('Change Phone Send OTP Error:', error);
        return NextResponse.json({
            error: `Internal Error: ${error.message}`
        }, { status: 500 });
    }
}
