'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDriverProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    // 1. Check if profile already exists
    const { data: existing } = await supabase
        .from('driver_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (existing) {
        return { message: 'Ya tienes un perfil de conductor' }
    }

    // 2. Create the profile
    const { error: insertError } = await supabase
        .from('driver_profiles')
        .insert({
            user_id: user.id,
            status: 'draft', // Pendiente de revisión
            is_visible: false,
            // Default values
            bio: 'Nuevo conductor',
            city: 'Por Definir',
            whatsapp_number: '0000000000',
            profile_photo_url: user.user_metadata?.avatar_url || 'https://via.placeholder.com/150',
        })

    if (insertError) {
        return { error: insertError.message }
    }

    // 3. Update User Roles to include 'driver' if not present
    // Note: In some systems roles are managed by triggers. 
    // We'll update it here to be safe and immediate.
    const { data: userData } = await supabase
        .from('users')
        .select('roles')
        .eq('id', user.id)
        .single()

    let currentRoles = userData?.roles || []
    if (typeof currentRoles === 'string') currentRoles = [currentRoles] // Handle legacy single string

    if (!currentRoles.includes('driver')) {
        const newRoles = [...currentRoles, 'driver']
        await supabase
            .from('users')
            .update({ roles: newRoles })
            .eq('id', user.id)
    }

    revalidatePath('/perfil')
    revalidatePath('/dashboard')

    return { success: true }
}
