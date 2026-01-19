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
            from: 'AvivaGo <onboarding@resend.dev>', // Update this with your verified domain in prod
            to: [email],
            subject: 'Bienvenido a AvivaGo',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>¡Bienvenido a AvivaGo, ${name}!</h1>
          <p>Estamos emocionados de tenerte con nosotros.</p>
          <p>En AvivaGo conectamos pasajeros con los mejores conductores de confianza.</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <br/>
          <p>El equipo de AvivaGo</p>
        </div>
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
