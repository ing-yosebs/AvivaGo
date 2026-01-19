'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const onboardingSchema = z.object({
    fullName: z.string().min(2),
    phone: z.string().min(8),
    vehicleInfo: z.string().min(2),
    bio: z.string().min(10),
    city: z.string().min(2).default('Santa Tecla'), // Default for now
})

export async function submitOnboarding(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No authenticated user found' }
    }

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const vehicleInfo = formData.get('vehicleInfo') as string
    const bio = formData.get('bio') as string

    const validated = onboardingSchema.safeParse({
        fullName,
        phone,
        vehicleInfo,
        bio
    })

    if (!validated.success) {
        return { error: 'Por favor llena todos los campos correctamente.' }
    }

    try {
        // 1. Update public.users
        const { error: userError } = await supabase
            .from('users')
            .update({
                full_name: fullName,
                phone_number: phone,
                roles: ['driver'] // Ensure driver role is set
            })
            .eq('id', user.id)

        if (userError) throw userError

        // 2. Create or Update driver_profile
        const { data: profile, error: profileError } = await supabase
            .from('driver_profiles')
            .upsert({
                user_id: user.id,
                bio,
                whatsapp_number: phone,
                city: validated.data.city,
                profile_photo_url: user.user_metadata.avatar_url || 'https://via.placeholder.com/150',
                status: 'active',
                is_visible: true
            })
            .select()
            .single()

        if (profileError) throw profileError

        // 3. Create vehicle entry
        const [brand, ...rest] = vehicleInfo.split(' ')
        const model = rest.join(' ') || brand

        const { error: vehicleError } = await supabase
            .from('vehicles')
            .insert({
                driver_profile_id: profile.id,
                brand: brand,
                model: model,
                year: 2024, // Simplified
                color: 'Desconocido'
            })

        if (vehicleError) throw vehicleError

        return { success: true }
    } catch (err: any) {
        console.error('Onboarding error:', err)
        return { error: err.message || 'Error al guardar el perfil' }
    }
}
