import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Only initialize Resend if API key is present, to avoid top-level crashes
const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    return new Resend(key);
};

export async function POST(req: Request) {
    try {
        const { newEmail } = await req.json();

        if (!newEmail || !newEmail.includes('@')) {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Admin client for checks
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Check if email is already taken
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', newEmail)
            .maybeSingle();

        if (existingUser && existingUser.id !== user.id) {
            return NextResponse.json({ error: 'Este correo ya está registrado en otra cuenta.' }, { status: 400 });
        }

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code
        const { error: dbError } = await supabaseAdmin
            .from('email_verification_codes')
            .insert({
                email: newEmail,
                code: code,
                expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 mins
            });

        if (dbError) {
            console.error('Error storing code:', dbError);
            return NextResponse.json({ error: 'Error al generar código' }, { status: 500 });
        }

        // Send Email via Resend
        const resend = getResend();
        if (!resend) {
            console.error('RESEND_API_KEY is missing in environment variables');
            return NextResponse.json({ error: 'El servicio de correo no está configurado (Falta API Key).' }, { status: 500 });
        }

        const { error: emailError } = await resend.emails.send({
            from: 'AvivaGo <security@app.avivago.mx>', // Using verified domain
            to: [newEmail],
            subject: 'Código de Verificación - Cambio de Correo',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Verificación de Cambio de Correo</h2>
                    <p>Has solicitado cambiar tu correo electrónico en AvivaGo.</p>
                    <p>Tu código de verificación es:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; background: #f4f4f5; padding: 20px; text-align: center; border-radius: 10px;">${code}</h1>
                    <p>Este código expira en 10 minutos.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                </div>
            `
        });

        if (emailError) {
            console.error('Error sending email:', emailError);
            return NextResponse.json({ error: 'Error al enviar el correo. Verifica que la dirección sea correcta.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error in change-email/send-otp:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
