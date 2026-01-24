'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDriverStatus(driverProfileId: string, status: 'active' | 'pending_approval' | 'suspended' | 'draft' | 'hidden') {
    const supabase = await createClient()

    // 1. Verify admin permissions (Todo: Add robust RBAC check here)
    // For now, relying on Supabase RLS or simple auth check if needed.
    // Ideally: const { data: { user } } = await supabase.auth.getUser()
    // if (user.role !== 'admin') throw new Error('Unauthorized')

    const { error } = await supabase
        .from('driver_profiles')
        .update({ status })
        .eq('id', driverProfileId)

    if (error) {
        console.error('Error updating status:', error)
        return { success: false, error: 'No se pudo actualizar el estado.' }
    }

    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${driverProfileId}`) // Assuming detail page uses profile ID or redirection
    return { success: true, message: 'Estado actualizado correctamente.' }
}

export async function toggleDriverVisibility(driverProfileId: string, isVisible: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('driver_profiles')
        .update({ is_visible: isVisible })
        .eq('id', driverProfileId)

    if (error) {
        console.error('Error updating visibility:', error)
        return { success: false, error: 'No se pudo actualizar la visibilidad.' }
    }

    revalidatePath('/admin/users')
    return { success: true, message: `Perfil ahora ${isVisible ? 'visible' : 'oculto'}.` }
}
