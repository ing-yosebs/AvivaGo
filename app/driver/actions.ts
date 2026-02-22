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
                status: 'active', // Modelo Autogestión (Free)
                is_visible: true // Visible para links directos (QR). El buscador premium los bloquea.
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
        // Membership check specific to Premium features is removed for general profile updates,
        // allowing Free drivers to update their information and trigger re-verification if needed.

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

const quoteRequestSchema = z.object({
    driverId: z.string().uuid(),
    scheduledDate: z.string().refine((date) => new Date(date) > new Date(), {
        message: "La fecha debe ser futura",
    }),
    details: z.string().min(10, "Por favor incluye más detalles sobre tu viaje"),
    contactPhone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
});

export async function submitQuoteRequest(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Debes iniciar sesión para solicitar una cotización.' }
    }

    const driverId = formData.get('driverId') as string
    const scheduledDate = formData.get('scheduledDate') as string
    const details = formData.get('details') as string
    const contactPhone = formData.get('contactPhone') as string

    const validated = quoteRequestSchema.safeParse({
        driverId,
        scheduledDate,
        details,
        contactPhone
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    try {
        const { data, error } = await supabase
            .from('quote_requests')
            .insert({
                passenger_id: user.id,
                driver_id: driverId,
                scheduled_date: new Date(scheduledDate).toISOString(),
                details,
                contact_phone: contactPhone,
                status: 'pending'
            })
            .select('id') // Return the ID for logging
            .single()

        if (error) throw error

        // AUDIT LOG: Create
        await supabase.from('quote_audit_logs').insert({
            quote_id: data.id,
            actor_id: user.id,
            action: 'created',
            details: {
                scheduled_date: scheduledDate,
                driver_id: driverId
            }
        });

        return { success: true }
    } catch (err: any) {
        console.error('Quote request error:', err)
        return { error: err.message || 'Error al enviar la solicitud' }
    }
}

export async function updateQuoteStatus(quoteId: string, status: 'accepted' | 'rejected') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        const { error } = await supabase
            .from('quote_requests')
            .update({ status })
            .eq('id', quoteId)

        if (error) throw error

        // AUDIT LOG: Status Change
        await supabase.from('quote_audit_logs').insert({
            quote_id: quoteId,
            actor_id: user.id,
            action: 'status_changed',
            details: { new_status: status }
        });

        return { success: true }
    } catch (err: any) {
        console.error('Update quote status error:', err)
        return { error: err.message || 'Error al actualizar el estado' }
    }
}


export async function logQuoteInteraction(quoteId: string, action: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    try {
        await supabase.from('quote_audit_logs').insert({
            quote_id: quoteId,
            actor_id: user.id,
            action: action,
            details: {}
        });
        return { success: true }
    } catch (err: any) {
        console.error('Log interaction error:', err)
        return { error: err.message }
    }
}

const reportSchema = z.object({
    driverProfileId: z.string().uuid(),
    reason: z.string().min(5, "Por favor describe el motivo del reporte con más detalle"),
});

export async function submitReport(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Debes iniciar sesión para enviar un reporte.' }
    }

    const driverProfileId = formData.get('driverProfileId') as string
    const reason = formData.get('reason') as string

    const validated = reportSchema.safeParse({
        driverProfileId,
        reason
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    try {
        // 1. Insert report
        const { error } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                reported_driver_profile_id: driverProfileId,
                reason: reason,
                status: 'pending'
            })

        if (error) throw error

        // 2. Log Action (File logger) - Optional but good practice
        await logDriverAction(
            { id: user.id },
            'driver_reported',
            {
                reportedDriverId: driverProfileId,
                reason: reason
            }
        );

        return { success: true }
    } catch (err: any) {
        console.error('Report error:', err)
        return { error: err.message || 'Error al enviar el reporte' }
    }
}
