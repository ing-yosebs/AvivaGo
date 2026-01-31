'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { logDriverAction } from '@/lib/logger'

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

export async function requestReview(driverProfileId: string, reason?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No authenticated user found' }
    }

    try {
        // Double check requirements
        // 1. Check Membership
        const { data: membership } = await supabase
            .from('driver_memberships')
            .select('status, expires_at')
            .eq('driver_profile_id', driverProfileId)
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .single()

        if (!membership) {
            return { error: 'Debes tener una membresía activa para solicitar revisión.' }
        }

        // 1.5 Get Previous Status
        const { data: currentProfile } = await supabase
            .from('driver_profiles')
            .select('status')
            .eq('id', driverProfileId)
            .single()

        const previousStatus = currentProfile?.status || 'unknown'

        // 2. Prepare Update Data
        const updateData: any = { status: 'pending_approval' }
        if (reason) {
            updateData.request_reason = reason
        }

        // 3. Update Status to pending_approval (En Revisión)
        const { error } = await supabase
            .from('driver_profiles')
            .update(updateData)
            .eq('id', driverProfileId)
            .eq('user_id', user.id) // Security check

        if (error) throw error

        // 4. Log Action (File logger)
        await logDriverAction(
            { id: user.id },
            'driver_review_request',
            {
                driverId: driverProfileId,
                previousStatus: previousStatus,
                newStatus: 'pending_approval',
                reason: reason
            }
        );

        return { success: true }
    } catch (err: any) {
        console.error('Request review error:', err)
        return { error: err.message || 'Error al solicitar revisión' }
    }
}

export async function recordPaymentConsent(consentText: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        const supabaseAdmin = createAdminClient()
        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for') || 'unknown'
        const userAgent = headersList.get('user-agent') || 'unknown'

        await supabaseAdmin.from('user_consents').insert({
            user_id: user.id,
            privacy_notice_version: 'payment_flow_v1',
            terms_version: 'payment_flow_v1',
            acceptance_method: 'checkbox_web_payment_flow',
            consent_text: consentText,
            user_agent: userAgent,
            ip_address: ip
        })

        return { success: true }
    } catch (err: any) {
        console.error('Consent recording error:', err)
        // Non-blocking error for payment flow, but logged
        return { error: err.message }
    }
}
