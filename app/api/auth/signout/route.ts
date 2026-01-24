import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Sign out from Supabase (clears session in DB if persisted, and invalidates JWT)
    const { error } = await supabase.auth.signOut()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/', 'layout')

    // Return success. The client-side handler will then redirect window.location to /
    return NextResponse.json({ success: true }, { status: 200 })
}
