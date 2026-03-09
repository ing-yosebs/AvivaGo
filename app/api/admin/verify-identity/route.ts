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
        // Verify caller is admin
        const { data: adminUser } = await supabaseAdmin
            .from('users')
            .select('roles')
            .eq('id', user.id)
            .single();

        if (!adminUser?.roles?.includes('admin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { targetUserId, action, extractedData } = await request.json();

        if (!targetUserId || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const { data: identityRecord } = await supabaseAdmin
            .from('identity_verifications')
            .select('*')
            .eq('user_id', targetUserId)
            .single();

        if (!identityRecord) {
            return NextResponse.json({ error: 'No verification record found' }, { status: 404 });
        }

        if (action === 'approve') {
            if (!extractedData || !extractedData.fullName || !extractedData.documentNumber) {
                return NextResponse.json({ error: 'Data is required to approve manual verification.' }, { status: 400 });
            }

            // Update identity_verifications
            const { error: updateVerifError } = await supabaseAdmin
                .from('identity_verifications')
                .update({
                    status: 'approved',
                    full_name: extractedData.fullName,
                    document_number: extractedData.documentNumber,
                    birth_date: extractedData.birthDate || null,
                    nationality: extractedData.nationality || null
                })
                .eq('user_id', targetUserId);

            if (updateVerifError) throw updateVerifError;

            // Update user profile
            const { error: updateUserError } = await supabaseAdmin
                .from('users')
                .update({
                    full_name: extractedData.fullName,
                    birthday: extractedData.birthDate || undefined,
                    nationality: extractedData.nationality || undefined,
                    curp: extractedData.documentNumber || undefined,
                    id_document_url: identityRecord.front_image_url || undefined,
                    id_document_back_url: identityRecord.back_image_url || undefined,
                    avatar_url: identityRecord.selfie_url || undefined
                })
                .eq('id', targetUserId);

            if (updateUserError) console.error('Error updating user on manual review', updateUserError);

            // Activate Driver Profile if applicable
            const { data: driverData } = await supabaseAdmin
                .from('driver_profiles')
                .select('id')
                .eq('user_id', targetUserId)
                .single();

            if (driverData) {
                await supabaseAdmin
                    .from('driver_profiles')
                    .update({
                        status: 'active',
                        verified_at: new Date().toISOString(),
                        rejection_reason: null
                    })
                    .eq('user_id', targetUserId);
            }

            return NextResponse.json({ success: true, message: 'Identidad aprobada manualmente.' });

        } else if (action === 'reject') {

            const { error: updateVerifError } = await supabaseAdmin
                .from('identity_verifications')
                .update({ status: 'rejected' })
                .eq('user_id', targetUserId);

            if (updateVerifError) throw updateVerifError;

            // Reject driver profile
            const { data: driverData } = await supabaseAdmin
                .from('driver_profiles')
                .select('id')
                .eq('user_id', targetUserId)
                .single();

            if (driverData) {
                await supabaseAdmin
                    .from('driver_profiles')
                    .update({
                        status: 'rejected',
                        rejection_reason: 'Foto de identificación borrosa, no coincide o información inválida.'
                    })
                    .eq('user_id', targetUserId);
            }

            return NextResponse.json({ success: true, message: 'Identidad rechazada manualmente.' });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('SERVER ERROR in admin identity review:', error);
        return NextResponse.json({
            error: 'Error setting up manual verification',
            details: error.message
        }, { status: 500 });
    }
}
