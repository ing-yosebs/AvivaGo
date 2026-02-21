import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { newEmail, code } = await req.json();

        if (!newEmail || !code) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify Code
        const { data: records, error: dbError } = await supabaseAdmin
            .from('email_verification_codes')
            .select('*')
            .eq('email', newEmail)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (dbError || !records || records.length === 0) {
            return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });
        }

        const oldEmail = user.email;

        // Update Auth User
        const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            email: newEmail,
            email_confirm: true // Auto confirm since we verified via OTP
        });

        if (updateAuthError) {
            console.error('Error updating auth user:', updateAuthError);
            return NextResponse.json({ error: 'Error al actualizar el usuario (Auth)' }, { status: 500 });
        }

        // Update Public User
        const { error: updatePublicError } = await supabaseAdmin
            .from('users')
            .update({ email: newEmail })
            .eq('id', user.id);

        if (updatePublicError) {
            console.error('Error updating public user:', updatePublicError);
            // Critical failure but Auth is updated. Could retry or alert.
        }

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        await supabaseAdmin.from('email_change_logs').insert({
            user_id: user.id,
            old_email: oldEmail || null,
            new_email: newEmail,
            ip_address: ip,
            user_agent: userAgent
        });

        // Cleanup codes
        await supabaseAdmin.from('email_verification_codes').delete().eq('email', newEmail);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error in change-email/verify:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
