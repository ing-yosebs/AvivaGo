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

    // Auto-adjust visibility and rejection reason based on status
    if (status === 'active') {
        updateData.is_visible = true; // Auto-publish on approval
        updateData.rejection_reason = null; // Clear old rejection reasons
    } else if (status === 'rejected' || status === 'suspended') {
        updateData.is_visible = false; // Auto-hide on suspension/rejection
        if (reason) updateData.rejection_reason = reason;
    } else if (status === 'draft') {
        updateData.is_visible = false; // Security default
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

export async function extendDriverMembership(driverProfileId: string, days: number, notes?: string) {
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

    const isAdmin = Array.isArray(userData?.roles)
        ? userData.roles.includes('admin')
        : userData?.roles === 'admin'

    if (!isAdmin) return { success: false, error: 'No tienes permisos de administrador.' }

    // 3. Calculate New Expiry
    // We need to fetch current expiry first to add days to it, OR (simpler for now) just add to NOW() if expired?
    // The policy says: "extend". Usually means from current expiry if active, or from now if expired.
    // Let's look at the SQL function `admin_extend_membership` again. It takes `new_expiry`.

    // Fetch current membership to know base date
    const { data: membership } = await supabase
        .from('driver_memberships')
        .select('expires_at, status')
        .eq('driver_profile_id', driverProfileId)
        .single()

    const now = new Date();
    let baseDate = now;

    if (membership?.expires_at) {
        const currentExpiry = new Date(membership.expires_at);
        // If currently valid, extend from that date. If expired, extend from now.
        if (currentExpiry > now) {
            baseDate = currentExpiry;
        }
    }

    const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    // 4. Call RPC
    // We use the standard client because the RPC is SECURITY DEFINER (runs as admin)
    // but relies on auth.uid() to verify the caller is an admin and to record who granted it.
    // Using service_role key would result in a different/null auth.uid(), failing the check.

    let updateError = null;
    const { error } = await supabase.rpc('admin_extend_membership', {
        target_profile_id: driverProfileId,
        new_expiry: newExpiry.toISOString(),
        admin_notes: notes || `Extensión manual por administrador (${days} días)`
    })
    updateError = error

    if (updateError) {
        console.error('Error extending membership:', updateError)
        return { success: false, error: 'No se pudo extender la membresía: ' + updateError.message }
    }

    // 5. Log Action
    await logDriverAction(
        { id: user.id },
        'admin_extend_membership',
        {
            driverId: driverProfileId,
            daysAdded: days,
            newExpiry: newExpiry.toISOString()
        }
    );

    revalidatePath('/admin/users')
    try {
        revalidatePath(`/admin/users/${driverProfileId}`)
    } catch (e) { }

    return { success: true, message: `Membresía extendida correctamente hasta ${newExpiry.toLocaleDateString()}.` }
}

export async function deleteUser(userId: string) {
    console.log(`[deleteUser] Iniciando acción de borrado para userId=${userId}`);
    const supabase = await createClient()

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('[deleteUser] No autenticado');
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
        console.error('[deleteUser] Usuario no es admin:', user.id);
        return { success: false, error: 'No tienes permisos de administrador.' }
    }

    // 3. Perform Deletion using Service Role Key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[deleteUser] SUPABASE_SERVICE_ROLE_KEY no configurada');
        return { success: false, error: 'Configuración de servidor incompleta.' }
    }

    const adminClient = createSupabaseClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) {
        console.error('[deleteUser] Error borrando usuario:', error)
        return { success: false, error: 'No se pudo eliminar el usuario: ' + error.message }
    }

    console.log('[deleteUser] Borrado exitoso. Revalidando paths...');
    revalidatePath('/admin/users')

    return { success: true, message: 'Usuario eliminado permanentemente.' }
}
