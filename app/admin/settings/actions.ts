'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteAdmin(formData: FormData) {
    const email = formData.get('email') as string
    const name = formData.get('name') as string

    if (!email || !name) {
        return { success: false, error: 'Email y nombre son requeridos.' }
    }

    const supabase = await createClient()

    // 1. Check if user exists in public.users (means they have signed up)
    const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, roles')
        .eq('email', email)
        .single()

    if (userError && userError.code !== 'PGRST116') {
        return { success: false, error: 'Error verificando usuario.' }
    }

    if (existingUser) {
        // User exists, update role
        const currentRoles = Array.isArray(existingUser.roles) ? existingUser.roles : []
        if (currentRoles.includes('admin')) {
            return { success: false, error: 'Este usuario ya es administrador.' }
        }

        const newRoles = [...currentRoles, 'admin']

        const { error: updateError } = await supabase
            .from('users')
            .update({ roles: newRoles })
            .eq('id', existingUser.id)

        if (updateError) {
            return { success: false, error: 'Error actualizando rol de usuario.' }
        }

        revalidatePath('/admin/settings/admins')
        return { success: true, message: 'Usuario promovido a Administrador exitosamente.' }
    } else {
        // User does not exist.
        // In a real app, we would use supabase.auth.admin.inviteUserByEmail(email)
        // But that requires SERVICE_ROLE_KEY which is risky to use in client/action unless strictly server-side.
        // Since we are in an experimental mode with 'supabase-js' on server, we might not have admin auth api initialized freely.
        // BEST PRACTICE:
        // We will insert a "pre-authorized" record into public.users or a separate "invites" table.
        // For MVP simplicity: We will tell the admin to ask the user to sign up first.
        return { success: false, error: 'El usuario no existe. Pídele que se registre primero en la plataforma y luego agrégalo aquí.' }
    }
}

export async function removeAdminRole(userId: string) {
    const supabase = await createClient()

    // Get current roles
    const { data: user } = await supabase.from('users').select('roles').eq('id', userId).single()
    const currentRoles = user?.roles || []

    // Filter out admin
    const newRoles = currentRoles.filter((r: string) => r !== 'admin')

    const { error } = await supabase.from('users').update({ roles: newRoles }).eq('id', userId)

    if (error) {
        return { success: false, message: 'Error al remover permisos.' }
    }

    revalidatePath('/admin/settings/admins')
    return { success: true, message: 'Permisos de administrador revocados.' }
}
