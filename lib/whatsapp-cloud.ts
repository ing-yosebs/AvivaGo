const META_TOKEN = process.env.META_WHATSAPP_TOKEN;
const META_PHONE_ID = process.env.META_WHATSAPP_PHONE_ID;
const API_VERSION = 'v20.0'; // Use v20.0 as it is widely supported

interface WhatsAppMessage {
    messaging_product: 'whatsapp';
    to: string;
    type: 'template';
    template: {
        name: string;
        language: { code: string };
        components?: any[];
    };
}

export async function sendWhatsAppOtp(phone: string, code: string) {
    if (!META_TOKEN || !META_PHONE_ID) {
        console.error('Meta WhatsApp credentials missing');
        return { success: false, error: 'Configuration Error: Credentials missing' };
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://graph.facebook.com/${API_VERSION}/${META_PHONE_ID}/messages`;

    // Production: Always use Template for OTP
    // Template Name: avivago_otp (Must be created in Meta Business Manager as 'Utility')
    // Body: "Tu código de verificación AvivaGo es: {{1}}"

    const templatePayload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
            name: 'avivago_auth',
            language: { code: 'es_MX' },
            components: [
                {
                    type: 'body',
                    parameters: [
                        {
                            type: 'text',
                            text: code
                        }
                    ]
                },
                {
                    type: 'button',
                    sub_type: 'url',
                    index: '0',
                    parameters: [
                        {
                            type: 'text',
                            text: code
                        }
                    ]
                }
            ]
        }
    };

    console.log(`[WhatsApp] Sending OTP Template (avivago_auth) to ${cleanPhone}...`);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(templatePayload),
        });

        const data = await res.json();
        console.log('[WhatsApp] Template Response:', JSON.stringify(data));

        if (res.ok) {
            return { success: true, data };
        }

        console.error('Meta API Template Error:', data);

        // Specific Error Handling
        if (data.error) {
            // Error 131030: Recipient not in allowed list (Test Number)
            if (data.error.code === 131030) {
                return {
                    success: false,
                    error: 'El número no está autorizado. En modo Producción, asegúrate de usar un Token Permanente y que la cuenta tenga métodos de pago (si aplica).'
                };
            }
            // Error 132000: Dynamic Templateparams invalid count
            if (data.error.code === 132000) {
                return { success: false, error: 'Meta Error: La plantilla no coincide con los parámetros enviados.' };
            }
            // Error 132001: Template does not exist
            if (data.error.code === 132001) {
                return { success: false, error: 'Meta Error: La plantilla "avivago_auth" no existe o no ha sido aprobada aún.' };
            }

            return { success: false, error: `Meta Error (${data.error.code}): ${data.error.message}` };
        }

        return { success: false, error: 'Unknown Meta API Error' };

    } catch (err: any) {
        console.error('WhatsApp Send Error:', err);
        return { success: false, error: `Network Error: ${err.message}` };
    }
}
