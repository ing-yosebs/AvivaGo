'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'

function RegisterForm() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [referralCode, setReferralCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        const ref = searchParams.get('ref')
        if (ref) {
            setReferralCode(ref)
        }
    }, [searchParams])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validation for Name
        const trimmedName = fullName.trim()

        if (trimmedName.length < 3) {
            setError('El nombre debe tener al menos 3 caracteres.')
            setLoading(false)
            return
        }

        const nameRegex = /^[a-zA-Z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\s]+$/
        if (!nameRegex.test(trimmedName)) {
            setError('El nombre solo puede contener letras y espacios.')
            setLoading(false)
            return
        }

        if (/(.)\1{3,}/.test(trimmedName)) {
            setError('El nombre no parece válido (demasiados caracteres repetidos).')
            setLoading(false)
            return
        }

        // Optional: Check if name is generic
        if (/^(test|prueba|usuario|nombre|name)$/i.test(trimmedName)) {
            setError('Por favor ingresa tu nombre real.')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: trimmedName, // Send trimmed name
                    referral_code: referralCode || undefined,
                },
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Check if user became an admin via trigger
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('roles')
                    .eq('id', user.id)
                    .single()

                const roles = profile?.roles || []
                // If admin, redirect to dashboard. Else, onboarding.
                if (Array.isArray(roles) && roles.includes('admin')) {
                    router.refresh()
                    router.push('/admin')
                    return
                }
            }

            router.refresh()
            router.push('/driver/onboarding')
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Crea tu cuenta en AvivaGo
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <input
                                type="text"
                                required
                                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Nombre Completo"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                required
                                className="relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="text-[10px] text-gray-500 px-1 mt-1">
                                Mínimo 6 caracteres.
                            </p>
                        </div>
                        <div>
                            <input
                                type="text"
                                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Código de Invitación (Opcional)"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Cargando...' : 'Registrarme como Pasajero'}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                            ¿Ya tienes cuenta? Entra
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
            <RegisterForm />
        </Suspense>
    )
}
