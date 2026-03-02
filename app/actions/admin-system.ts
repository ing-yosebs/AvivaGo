'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SystemVersion = {
    id: string;
    version_tag: string;
    release_date: string;
    changes_description: string;
    type: 'feature' | 'bugfix' | 'hotfix';
    created_at: string;
}

export async function getSystemVersions() {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('system_versions')
            .select('*')
            .order('release_date', { ascending: false })

        if (error) {
            console.error("Error fetching system versions:", error)
            return []
        }

        return data as SystemVersion[]
    } catch (error) {
        console.error("Failed to fetch system versions", error)
        return []
    }
}

export async function createSystemVersion(formData: FormData) {
    const supabase = await createClient()

    // Check if admin (could use role checks, for now rely on RLS and session)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autorizado' }

    const version_tag = formData.get('version_tag') as string
    const changes_description = formData.get('changes_description') as string
    const type = formData.get('type') as 'feature' | 'bugfix' | 'hotfix'

    if (!version_tag || !changes_description || !type) {
        return { success: false, error: 'Faltan campos obligatorios' }
    }

    try {
        const { error } = await supabase.from('system_versions').insert({
            version_tag,
            changes_description,
            type
        })

        if (error) {
            console.error("Error creating version:", error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/system')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
