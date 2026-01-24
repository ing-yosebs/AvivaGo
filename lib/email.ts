import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendWelcomeEmail(email: string, name: string) {
    if (!resend) {
        console.warn('RESEND_API_KEY is missing. Welcome email was not sent.');
        return { success: true, warning: 'Email service not configured' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'AvivaGo <noreply@app.avivago.mx>',
            to: [email],
            subject: 'Bienvenido a AvivaGo',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a AvivaGo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #09090b; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 40px 0; background: linear-gradient(to right, #09090b, #18181b); border-bottom: 1px solid #27272a;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                                AvivaGo
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">
                                ¡Bienvenido a bordo, ${name}!
                            </h2>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                                Gracias por unirte a la comunidad más confiable de transporte privado.
                            </p>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                                En AvivaGo conectamos pasajeros exigentes con conductores profesionales verificados. Tu seguridad y comodidad son nuestra prioridad número uno.
                            </p>
                            
                            <!-- Button Container -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://avivago.mx'}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block;">
                                            Ir a mi Panel
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #a1a1aa; font-size: 14px; line-height: 20px; margin: 0; border-top: 1px solid #27272a; padding-top: 20px;">
                                Si tienes alguna pregunta o necesitas asistencia, nuestro equipo de soporte está listo para ayudarte.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #18181b; padding: 20px;">
                            <p style="color: #52525b; font-size: 12px; margin: 0;">
                                © ${new Date().getFullYear()} AvivaGo. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Error sending welcome email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Exception sending welcome email:', error);
        return { success: false, error };
    }
}
