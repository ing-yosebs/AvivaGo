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
        const { data, documentType, matchScore, frontImage, backImage, selfieImage } = await request.json();

        if (!data) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        // Helper to upload base64 image
        const uploadImage = async (base64Data: string, bucket: string, path: string) => {
            try {
                // Remove header data:image/jpeg;base64,
                const base64Content = base64Data.split(',')[1] || base64Data;
                const buffer = Buffer.from(base64Content, 'base64');
                const { data: uploadData, error } = await supabase.storage
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

        // Upload Images
        let idUrl = null;
        let idBackUrl = null;
        let selfieUrl = null;

        if (frontImage) {
            // Use consistent naming or random to avoid cache issues, but overwritten if same user
            const fileName = `id_front_${Date.now()}.jpg`;
            idUrl = await uploadImage(frontImage, 'documents', `${user.id}/${fileName}`);
        }

        if (backImage) {
            const fileName = `id_back_${Date.now()}.jpg`;
            idBackUrl = await uploadImage(backImage, 'documents', `${user.id}/${fileName}`);
        }

        if (selfieImage) {
            const fileName = `verification_selfie_${Date.now()}.jpg`;
            selfieUrl = await uploadImage(selfieImage, 'avatars', `${user.id}/${fileName}`);
        }

        // --- NEW: Identity Verification Persistence with Deduplication ---

        const identityData: any = {
            user_id: user.id,
            document_type: documentType,
            document_number: data.curp || data.passportNumber,
            secondary_id: data.claveElector,
            mrz_raw: data.mrz,

            full_name: data.name,
            birth_date: data.birthDate || null,
            expiration_date: data.expirationDate || null,
            nationality: data.nationality,

            front_image_url: idUrl,
            back_image_url: idBackUrl,
            selfie_url: selfieUrl,

            match_score: matchScore,
            ocr_data: data
        };

        // Clean undefined
        Object.keys(identityData).forEach(key => identityData[key] === undefined && delete identityData[key]);

        // 1. Insert/Upsert into identity_verifications
        // Usage of 'identity_verifications' ensures we check for duplicates via database constraints

        const { error: identityError } = await supabaseAdmin
            .from('identity_verifications')
            .upsert(identityData, { onConflict: 'user_id' });

        if (identityError) {
            console.error('Identity Persistence Error:', identityError);

            // Check for Unique Violation (Postgres Code 23505)
            if (identityError.code === '23505') {
                return NextResponse.json({
                    error: 'Este documento de identidad ya está registrado en otra cuenta. Por favor contacta a soporte.',
                    code: 'DUPLICATE_IDENTITY'
                }, { status: 409 });
            }

            return NextResponse.json({
                error: identityError.message || 'Error al guardar verificación de identidad.',
                details: identityError.details,
                code: identityError.code
            }, { status: 400 });
        }

        // 2. Update public.users (Legacy/UI compatibility)
        const updateData: any = {
            full_name: data.name,
            address_text: data.address,
            curp: data.curp, // Keep syncing for now
            birthday: data.birthDate,
            nationality: data.nationality
        };

        if (idUrl) updateData.id_document_url = idUrl;
        if (idBackUrl) updateData.id_document_back_url = idBackUrl;
        if (selfieUrl) updateData.avatar_url = selfieUrl;

        const { error: userUpdateError } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', user.id);

        if (userUpdateError) {
            console.error('Error updating user record:', userUpdateError);
        }

        // 3. Update Driver Profile (Status)
        const { data: profile } = await supabaseAdmin
            .from('driver_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (profile) {
            await supabaseAdmin
                .from('driver_profiles')
                .update({
                    verified_at: new Date().toISOString(),
                    status: 'active'
                })
                .eq('user_id', user.id);
        }

        return NextResponse.json({
            success: true,
            message: 'Identidad verificada y guardada correctamente'
        });

    } catch (error: any) {
        console.error('Error in save-id persistence:', error);
        return NextResponse.json({
            error: error.message || 'Error al guardar la verificación',
            details: error.details
        }, { status: 500 });
    }
}
