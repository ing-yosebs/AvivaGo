'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SubmitReviewParams = {
    driver_profile_id: string
    social_rating: number
    driving_rating: number
    assistance_rating: number
    comment: string
}

export async function submitReview(params: SubmitReviewParams) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'User not authenticated' }
    }

    // 1. Check if user unlocked the driver
    const { data: unlock, error: unlockError } = await supabase
        .from('unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('driver_profile_id', params.driver_profile_id)
        .single()

    if (unlockError || !unlock) {
        return { success: false, error: 'Debes desbloquear el contacto del conductor antes de calificar.' }
    }

    // 2. Check if already reviewed (optional depending on rules, assuming 1 per driver for now to prevent spam)
    const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq('driver_profile_id', params.driver_profile_id)
        .single()

    if (existing) {
        // Option: allow update or reject. Let's reject for now.
        return { success: false, error: 'Ya has calificado a este conductor.' }
    }

    // Calculate average rating
    const avgRating = Math.round((params.social_rating + params.driving_rating + params.assistance_rating) / 3)

    // 3. Insert Review
    const { error } = await supabase
        .from('reviews')
        .insert({
            reviewer_id: user.id,
            driver_profile_id: params.driver_profile_id,
            unlock_id: unlock.id,
            social_rating: params.social_rating,
            driving_rating: params.driving_rating,
            assistance_rating: params.assistance_rating,
            rating: avgRating, // Populate the legacy/main rating column
            comment: params.comment
        })

    if (error) {
        console.error('Submit review error:', error)
        return { success: false, error: 'Error al enviar la reseña' }
    }

    revalidatePath(`/driver/${params.driver_profile_id}`)
    revalidatePath('/panel/comunidad')
    revalidatePath('/perfil')
    return { success: true }
}

export async function replyToReview(reviewId: string, content: string, role: 'driver' | 'passenger') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Fetch review to check ownership and state
    const { data: review } = await supabase
        .from('reviews')
        .select(`
            *,
            driver_profiles!inner(user_id)
        `)
        .eq('id', reviewId)
        .single()

    if (!review) return { success: false, error: 'Review not found' }

    const updates: any = {}
    const now = new Date().toISOString()

    if (role === 'driver') {
        // Verify user is the driver
        if (review.driver_profiles.user_id !== user.id) {
            return { success: false, error: 'No tienes permiso para responder como conductor.' }
        }

        if (!review.driver_reply) {
            updates.driver_reply = content
            updates.driver_reply_at = now
        } else if (review.passenger_followup && !review.driver_final_reply) {
            updates.driver_final_reply = content
            updates.driver_final_reply_at = now
        } else {
            return { success: false, error: 'No puedes responder en este momento.' }
        }
    } else if (role === 'passenger') {
        // Verify user is the reviewer
        if (review.reviewer_id !== user.id) {
            return { success: false, error: 'No tienes permiso para responder.' }
        }

        if (review.driver_reply && !review.passenger_followup) {
            updates.passenger_followup = content
            updates.passenger_followup_at = now
        } else {
            return { success: false, error: 'No puedes responder en este momento.' }
        }
    }

    const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)

    if (error) return { success: false, error: 'Error al guardar respuesta' }

    revalidatePath(`/driver/${review.driver_profile_id}`)
    return { success: true }
}

export async function ratePassenger(reviewId: string, rating: number, agreement: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check ownership (must be driver)
    const { data: review } = await supabase
        .from('reviews')
        .select(`
            driver_profile_id,
            driver_profiles!inner (
                user_id
            )
        `)
        .eq('id', reviewId)
        .single()

    // @ts-ignore - Supabase type inference on joined single() can be tricky
    if (!review || review.driver_profiles.user_id !== user.id) {
        return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('reviews')
        .update({
            passenger_rating: rating,
            agreement_reached: agreement
        })
        .eq('id', reviewId)

    if (error) return { success: false, error: 'Error al calificar pasajero' }

    revalidatePath(`/driver/${review.driver_profile_id}`)
    return { success: true }
}

export async function toggleLike(reviewId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Inicia sesión para dar me gusta' }

    // Check if like exists
    const { data: existing } = await supabase
        .from('review_likes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single()

    if (existing) {
        // Remove like
        const { error } = await supabase
            .from('review_likes')
            .delete()
            .eq('id', existing.id)

        if (error) return { success: false, error: 'Error al quitar me gusta' }
    } else {
        // Add like
        const { error } = await supabase
            .from('review_likes')
            .insert({
                review_id: reviewId,
                user_id: user.id
            })

        if (error) return { success: false, error: 'Error al dar me gusta' }
    }

    revalidatePath('/comunidad')
    return { success: true }
}
