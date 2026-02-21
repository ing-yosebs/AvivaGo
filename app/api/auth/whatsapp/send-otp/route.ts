
import { NextResponse } from 'next/server';
import { sendWhatsAppOtp } from '@/lib/whatsapp-cloud';

// Use Service Role to write to verification_codes to avoid exposing RLS public write access
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    console.log('[Send OTP] Request received');
    try {
        const { phone } = await request.json();
        console.log('[Send OTP] Payload:', phone);

        if (!phone) {
            return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
        }

        // Clean phone number
        const cleanPhone = phone.replace(/\D/g, '');

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error: dbError } = await supabaseAdmin
            .from('verification_codes')
            .insert({
                phone: cleanPhone,
                code: code,
                expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 mins
            });

        if (dbError) {
            console.error('DB Error:', dbError);
            if (dbError.code === '42P01') { // undefined_table
                return NextResponse.json({ error: 'System Error: Verification table missing. Please run migration.' }, { status: 500 });
            }
            return NextResponse.json({ error: 'Failed to store code' }, { status: 500 });
        }

        // Send via WhatsApp
        const result = await sendWhatsAppOtp(cleanPhone, code);

        if (!result.success) {
            // Return the specific error string from the library
            return NextResponse.json({ error: typeof result.error === 'string' ? result.error : 'Failed to send WhatsApp message' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Code sent' });

    } catch (error: any) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({
            error: `Error interno (send-otp): ${error.message || JSON.stringify(error)}`
        }, { status: 500 });
    }
}
