import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Determines the correct dashboard path for a user based on their roles and profile status.
 * @param supabase The Supabase client
 * @param userId The user's ID
 * @returns {Promise<string>} The path to redirect to
 */
export async function getDashboardRedirectPath(supabase: SupabaseClient, userId: string): Promise<string> {
    const { data: profile } = await supabase
        .from('users')
        .select('roles')
        .eq('id', userId)
        .single()

    const roles = profile?.roles || []

    // Check for Admin (Priority)
    if (Array.isArray(roles) && roles.includes('admin')) {
        return '/admin'
    }

    // Check for Driver
    if (Array.isArray(roles) && roles.includes('driver')) {
        return '/perfil?tab=driver_dashboard'
    }

    // Default path for Passengers (client role) or others
    return '/dashboard'
}
