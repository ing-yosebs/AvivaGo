'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { logDriverAction } from '@/lib/logger'

export async function updateDriverStatus(driverProfileId: string, status: 'active' | 'pending_approval' | 'suspended' | 'draft' | 'hidden' | 'rejected', reason?: string) {
    const supabase = await createClient()

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // 2. Verify Admin Role
    const { data: userData } = await supabase
        .from('users')
        .select('roles')
        .eq('id', user.id)
        .single()

    // Check if roles contains 'admin' (handles string[] or simple string)
    const isAdmin = Array.isArray(userData?.roles)
        ? userData.roles.includes('admin')
        : userData?.roles === 'admin'

    if (!isAdmin) return { success: false, error: 'No tienes permisos de administrador.' }

    // 2.5 Fetch Previous Status
    const { data: currentProfile } = await supabase
        .from('driver_profiles')
        .select('status')
        .eq('id', driverProfileId)
        .single()

    const previousStatus = currentProfile?.status || 'unknown'

    // 3. Prepare Update Data
    const updateData: any = { status };
    if (status === 'rejected' || status === 'suspended') {
        if (reason) updateData.rejection_reason = reason;
    } else if (status === 'active') {
        // Clear rejection reason if activating
        updateData.rejection_reason = null;
    }

    // 4. Perform Update (Use Service Role if available to bypass RLS, otherwise fallback to session client)
    let updateError = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = createSupabaseClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )
        const { error } = await adminClient
            .from('driver_profiles')
            .update(updateData)
            .eq('id', driverProfileId)
        updateError = error

    } else {
        // Fallback to regular client (subject to RLS)
        const { error } = await supabase
            .from('driver_profiles')
            .update(updateData)
            .eq('id', driverProfileId)
        updateError = error
    }

    // 5. Log Action (File System)
    if (!updateError) {
        // Need to fetch user email (optional) or just use ID for now since userData fetch above didn't include email
        const actorEmail = (userData as any)?.email;

        await logDriverAction(
            { id: user.id, email: actorEmail },
            'admin_status_change',
            {
                driverId: driverProfileId,
                previousStatus,
                newStatus: status,
                reason: reason
            }
        );
    }

    if (updateError) {
        console.error('Error updating status:', updateError)
        return { success: false, error: 'No se pudo actualizar el estado: ' + updateError.message }
    }

    revalidatePath('/admin/users')
    try {
        revalidatePath(`/admin/users/${driverProfileId}`)
    } catch (e) { } // Ignore if path doesn't exist

    return { success: true, message: 'Estado actualizado correctamente.' }
}

export async function toggleDriverVisibility(driverProfileId: string, isVisible: boolean) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Check Admin (Simplified for second action, reusing logic ideally)
    const { data: userData } = await supabase.from('users').select('roles').eq('id', user.id).single()
    const isAdmin = Array.isArray(userData?.roles) ? userData.roles.includes('admin') : userData?.roles === 'admin'

    if (!isAdmin) return { success: false, error: 'No autorizado' }

    let updateError = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = createSupabaseClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )
        const { error } = await adminClient
            .from('driver_profiles')
            .update({ is_visible: isVisible })
            .eq('id', driverProfileId)
        updateError = error
    } else {
        const { error } = await supabase
            .from('driver_profiles')
            .update({ is_visible: isVisible })
            .eq('id', driverProfileId)
        updateError = error
    }

    if (updateError) {
        console.error('Error updating visibility:', updateError)
        return { success: false, error: 'No se pudo actualizar la visibilidad: ' + updateError.message }
    }

    revalidatePath('/admin/users')
    return { success: true, message: `Perfil ahora ${isVisible ? 'visible' : 'oculto'}.` }
}

export async function toggleUserBan(userId: string, isBanned: boolean) {
    console.log(`[toggleUserBan] Iniciando acción para userId=${userId}, isBanned=${isBanned}`);
    const supabase = await createClient()

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('[toggleUserBan] No autenticado');
        return { success: false, error: 'No autenticado' }
    }

    // 2. Verify Admin Role
    const { data: adminUser } = await supabase
        .from('users')
        .select('roles')
        .eq('id', user.id)
        .single()

    const isAdmin = Array.isArray(adminUser?.roles)
        ? adminUser.roles.includes('admin')
        : adminUser?.roles === 'admin'

    if (!isAdmin) {
        console.error('[toggleUserBan] Usuario no es admin:', user.id);
        return { success: false, error: 'No tienes permisos de administrador.' }
    }

    // 3. Update User Ban Status
    let updateError = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('[toggleUserBan] Usando Service Role Key para bypass de RLS');
        const adminClient = createSupabaseClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )
        const { error } = await adminClient
            .from('users')
            .update({ is_banned: isBanned })
            .eq('id', userId)
        updateError = error
    } else {
        console.log('[toggleUserBan] ADVERTENCIA: Usando cliente estándar (puede fallar por RLS)');
        const { error } = await supabase
            .from('users')
            .update({ is_banned: isBanned })
            .eq('id', userId)
        updateError = error
    }

    if (updateError) {
        console.error('[toggleUserBan] Error updating ban status:', updateError)
        return { success: false, error: 'No se pudo actualizar el estado: ' + updateError.message }
    }

    console.log('[toggleUserBan] Actualización exitosa. Revalidando paths...');
    revalidatePath('/admin/users')
    try {
        revalidatePath(`/admin/users/${userId}`)
    } catch (e) { }

    return {
        success: true,
        message: isBanned ? 'Usuario suspendido correctamente.' : 'Usuario reactivado correctamente.'
    }
}
