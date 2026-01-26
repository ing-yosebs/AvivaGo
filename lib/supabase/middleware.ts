import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: Object) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: Object) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 0. Fetch Profile Data (Roles & Ban Status)
    let profile = null
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('roles, is_banned')
            .eq('id', user.id)
            .single()
        profile = data
    }

    // 0.5 Global Ban Check (Modified for Transactional Block)
    if (user && profile?.is_banned) {
        // Enforce redirect ONLY for critical/write paths
        // This matches the client-side BanGuard logic to prevent bypass
        const restrictedStrictPaths = ['/checkout', '/payment', '/driver/onboarding', '/profile/edit']

        const isRestricted = restrictedStrictPaths.some(p => path.startsWith(p))

        if (isRestricted) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // If they are on /suspended, redirect them back to home/profile so they can see the banner
        // (Optional, cleans up legacy state)
        if (path === '/suspended') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }
    // Legacy redirect removed:
    // if (!path.startsWith('/suspended') && !path.startsWith('/auth/')) { ... }

    // 1. Admin Protection
    if (path.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // Check if roles contains 'admin' in the text[] array or jsonb
        // Assuming Postgrest returns array for text[]
        const roles = profile?.roles || []
        const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin'

        if (!isAdmin) {
            // Redirect unauthorized users to home
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 2. Driver Dashboard Protection (Allow public profiles)
    // Matches /driver/some-id
    const isPublicProfile = /^\/driver\/[a-zA-Z0-9-]+$/.test(path);
    // If it starts with /driver, is NOT a public profile, and user is not logged in -> Redirect
    if (path.startsWith('/driver') && !isPublicProfile && !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // 3. Auth Redirection (Users already logged in should not see login/register)
    if (path.startsWith('/auth') && user) {
        // Check for Admin Role to redirect to Admin Panel
        // Profile already fetched above
        const roles = profile?.roles || []
        const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin'

        if (isAdmin) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}
