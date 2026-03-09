import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { documentType, frontImage, backImage, selfieImage, matchScore } = await request.json();

        // 1. Upload Images
        const uploadImage = async (base64Data: string, bucket: string, path: string) => {
            try {
                const base64Content = base64Data.split(',')[1] || base64Data;
                const buffer = Buffer.from(base64Content, 'base64');
                const { error } = await supabase.storage
                    .from(bucket)
                    .upload(path, buffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
                return publicUrl;
            } catch (e) {
                console.error(`Error uploading to ${bucket}:`, e);
                return null;
            }
        };

        let idUrl = null;
        let idBackUrl = null;
        let selfieUrl = null;

        if (frontImage) {
            const fileName = `id_front_manual_${Date.now()}.jpg`;
            idUrl = await uploadImage(frontImage, 'documents', `${user.id}/${fileName}`);
        }

        if (backImage) {
            const fileName = `id_back_manual_${Date.now()}.jpg`;
            idBackUrl = await uploadImage(backImage, 'documents', `${user.id}/${fileName}`);
        }

        if (selfieImage) {
            const fileName = `verification_selfie_manual_${Date.now()}.jpg`;
            selfieUrl = await uploadImage(selfieImage, 'avatars', `${user.id}/${fileName}`);
        }

        // 2. Insert into identity_verifications with 'manual_review' status
        const identityData = {
            user_id: user.id,
            document_type: documentType,
            front_image_url: idUrl,
            back_image_url: idBackUrl,
            selfie_url: selfieUrl,
            match_score: matchScore || null,
            status: 'manual_review'
        };

        const { error: identityError } = await supabaseAdmin
            .from('identity_verifications')
            .upsert(identityData, { onConflict: 'user_id' });

        if (identityError) {
            console.error('Identity Manual Review Error:', identityError);
            if (identityError.code === '23505') {
                return NextResponse.json({ error: 'Documento duplicado' }, { status: 409 });
            }
            throw new Error(identityError.message);
        }

        // 3. Update driver profile status to pending_approval if driver
        const { data: userData } = await supabaseAdmin.from('users').select('roles').eq('id', user.id).single();
        if (userData?.roles?.includes('driver')) {
            await supabaseAdmin
                .from('driver_profiles')
                .update({ status: 'pending_approval' })
                .eq('user_id', user.id);
        }

        return NextResponse.json({ success: true, message: 'Enviado a revisión manual exitosamente.' });

    } catch (error: any) {
        console.error('SERVER ERROR in manual verify:', error);
        return NextResponse.json({
            error: 'Error setting up manual verification',
            details: error.message
        }, { status: 500 });
    }
}
