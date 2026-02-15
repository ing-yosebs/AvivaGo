'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type MarketingRequestStatus = 'pending_quote' | 'quote_sent' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface MarketingRequest {
    id: string;
    driver_profile_id: string;
    status: MarketingRequestStatus;
    shipping_address: string;
    shipping_cost: number;
    currency: string;
    admin_notes: string | null;
    driver_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface AdminMarketingRequest extends MarketingRequest {
    driver_profiles: {
        id: string;
        users: {
            full_name: string;
            email: string;
            phone_number: string;
        }
    }
}

export async function createMarketingRequest(driverProfileId: string, address: string, driverNotes?: string) {
    const supabase = await createClient()

    // 1. Verify user owns the profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
        .from('driver_profiles')
        .select('user_id')
        .eq('id', driverProfileId)
        .single()

    if (!profile || profile.user_id !== user.id) {
        return { success: false, error: 'No autorizado para este perfil' }
    }

    // 2. Check if there is already a pending request to avoid duplicates
    const { data: existing } = await supabase
        .from('marketing_kit_requests')
        .select('id, status')
        .eq('driver_profile_id', driverProfileId)
        .not('status', 'in', '("delivered","cancelled")') // Allow new request only if previous is done or cancelled
        .maybeSingle()

    if (existing) {
        return { success: false, error: 'Ya tienes una solicitud activa. Espera a que finalice para crear otra.' }
    }

    // 3. Create request
    const { error } = await supabase
        .from('marketing_kit_requests')
        .insert({
            driver_profile_id: driverProfileId,
            shipping_address: address,
            driver_notes: driverNotes,
            status: 'pending_quote'
        })

    if (error) {
        console.error('Error creating marketing request:', error)
        return { success: false, error: 'Error al guardar la solicitud' }
    }

    revalidatePath('/perfil?tab=visibility')
    return { success: true }
}

export async function getMarketingRequest(driverProfileId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('marketing_kit_requests')
        .select('*')
        .eq('driver_profile_id', driverProfileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('Error fetching marketing request:', error)
        return null
    }

    return data as MarketingRequest
}

export async function updateMarketingRequestStatus(requestId: string, status: MarketingRequestStatus, cost?: number, adminNotes?: string) {
    const supabase = await createClient()

    // 1. Verify Admin Role (This should be robust, typically checking public.users role or similar)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Simple check: is user admin?
    // In a real app, use a middleware or robust RLS. Here we trust the RLS policy "Admins manage marketing requests"
    // but explicit check is good.
    const { data: userData } = await supabase.from('users').select('roles').eq('id', user.id).single()
    const isAdmin = userData?.roles?.includes('admin')

    if (!isAdmin) {
        return { success: false, error: 'No autorizado' }
    }

    const updates: any = { status, updated_at: new Date().toISOString() }
    if (cost !== undefined) updates.shipping_cost = cost
    if (adminNotes !== undefined) updates.admin_notes = adminNotes

    const { error } = await supabase
        .from('marketing_kit_requests')
        .update(updates)
        .eq('id', requestId)

    if (error) {
        return { success: false, error: 'Error al actualizar' }
    }

    revalidatePath('/admin/marketing-requests')
    return { success: true }
}
