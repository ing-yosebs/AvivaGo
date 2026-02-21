
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { phone, code, fullName, invitationCode, password, role } = await request.json();
        console.log('[Verify OTP] Attempting verification for:', phone);

        if (!phone || !code) {
            return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, '');

        // Use provided password or generate random if missing (should not happen in normal flow)
        const finalPassword = password || `Pwd_${Math.random().toString(36).slice(-8)}_${Date.now()}`;
        let userId: string | undefined;

        // Admin client for DB operations (verification_codes & users)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Standard client for signing in (setting cookies)
        const supabase = await createServerClient();

        // Verify code
        const { data: records, error: dbError } = await supabaseAdmin
            .from('verification_codes')
            .select('*')
            .eq('phone', cleanPhone)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (dbError || !records || records.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
        }

        console.log('[Verify OTP] Code valid. Proceeding to user sync.');

        // 1. Try creating user in Auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            phone: cleanPhone,
            password: finalPassword,
            email_confirm: true,
            phone_confirm: true,
            user_metadata: {
                full_name: fullName || 'Usuario Nuevo',
                invitation_code: invitationCode || null,
                referral_code: invitationCode || null,
                role: role || 'client'
            }
        });

        let publicUser: any = null;

        if (createError) {
            console.log('[Verify OTP] Create User Error:', createError.message);

            // 2. If exists, we MUST find the existing ID to update password and sync public
            // Strategy: Check public.users first (fastest)
            const { data: existingUser } = await supabaseAdmin.from('users').select('id, roles').eq('phone_number', cleanPhone).single();
            publicUser = existingUser;

            if (publicUser) {
                userId = publicUser.id;
            } else {
                // Fallback: Scan Auth (slower but necessary if public record missing)
                const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

                // Try finding by Phone OR Email (since we enforce a specific dummy email format)
                const authUser = userList?.users.find(u =>
                    u.phone === cleanPhone ||
                    u.phone === `+${cleanPhone}`
                );

                if (authUser) {
                    userId = authUser.id;
                } else {
                    // Critical failure: Exists according to createError, but can't find it.
                    console.error('CRITICAL: User creation failed and cannot find existing user.');
                    return NextResponse.json({
                        error: `Account sync error: ${createError.message}. Please contact support.`
                    }, { status: 500 });
                }
            }

            // Update credentials so we can log them in
            if (userId) {
                await supabaseAdmin.auth.admin.updateUserById(userId, {
                    password: finalPassword,
                    user_metadata: {
                        full_name: fullName || 'Usuario Nuevo',
                        invitation_code: invitationCode || null,
                        referral_code: invitationCode || null,
                        role: role || 'client'
                    },
                    email_confirm: true,
                    phone_confirm: true
                });
            }
        } else {
            userId = newUser.user.id;
        }

        // 3. Force Sync to public.users (Upsert)
        // This ensures public.users ALWAYS has the record, fixing the "Zombie" issue.
        if (userId) {
            let currentRoles = publicUser?.roles || [];
            if (role === 'driver' && !currentRoles.includes('driver')) {
                currentRoles = [...currentRoles, 'driver'];
            }
            if (currentRoles.length === 0) {
                currentRoles = ['client'];
            }

            const { error: upsertError } = await supabaseAdmin
                .from('users')
                .upsert({
                    id: userId,
                    phone_number: cleanPhone,
                    full_name: fullName || 'Usuario Nuevo',
                    roles: currentRoles,
                }, { onConflict: 'id' });

            if (upsertError) {
                console.error('[Verify OTP] Public Sync Error:', upsertError);
            }

            // If user requested driver, ensure driver_profiles is initialized
            if (role === 'driver') {
                const { data: driverProfile } = await supabaseAdmin.from('driver_profiles').select('id').eq('user_id', userId).single();
                if (!driverProfile) {
                    await supabaseAdmin.from('driver_profiles').insert({
                        user_id: userId,
                        status: 'incomplete'
                    });
                }
            }
        }

        // 4. Sign In
        const { error: signInError } = await supabase.auth.signInWithPassword({
            phone: cleanPhone,
            password: finalPassword
        });

        if (signInError) {
            console.error('[Verify OTP] Sign In Error:', signInError);
            return NextResponse.json({
                error: `Login failed: ${signInError.message}`
            }, { status: 500 });
        }

        // Cleanup
        await supabaseAdmin.from('verification_codes').delete().eq('phone', cleanPhone);

        return NextResponse.json({ success: true, message: 'Verified' });

    } catch (error: any) {
        console.error('[Verify OTP] UNHANDLED EXCEPTION:', error);
        return NextResponse.json({
            error: `Error interno: ${error.message || JSON.stringify(error)}`
        }, { status: 500 });
    }
}
