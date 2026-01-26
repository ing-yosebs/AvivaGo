'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'
import { z } from 'zod'

const signUpSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['client', 'driver']).default('client'),
})

export async function signUp(formData: FormData) {
    const origin = (await headers()).get('origin')
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as 'client' | 'driver'

    const referralCode = formData.get('referralCode') as string

    const validatedFields = signUpSchema.safeParse({
        fullName,
        email,
        password,
        role,
    })

    if (!validatedFields.success) {
        return { error: 'Invalid input fields' }
    }

    // Check if user already exists
    const supabaseAdmin = createAdminClient()
    const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

    if (existingUser) {
        return { error: 'Ya existe una cuenta con este correo electrónico', code: 'USER_EXISTS' }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: fullName,
                role: role,
                referral_code: referralCode // Metadata used by triggers
            },
        },
    })

    if (error) {
        console.error(error)
        return { error: error.message }
    }

    // Send a separate welcome email (optional, but requested)
    await sendWelcomeEmail(email, fullName)

    return {
        success: true,
        message: '¡Excelente! Hemos enviado un código de 6 dígitos a tu correo.',
        email: email
    }
}

export async function resendOtp(email: string) {
    const supabase = await createClient()
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Código reenviado correctamente.' }
}
