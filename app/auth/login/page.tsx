'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle, X } from 'lucide-react'
import AvivaLogo from '@/app/components/AvivaLogo'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams.get('redirect')
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.log("Login error:", error.message)
            if (error.message.includes('Email not confirmed')) {
                setError('Correo no verificado.')
            } else {
                setError(error.message)
            }
            setLoading(false)
        } else {
            // Priority Redirect
            if (redirectUrl) {
                router.push(redirectUrl)
                return
            }

            // Check for Admin Role
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('roles')
                    .eq('id', user.id)
                    .single()

                const roles = profile?.roles || []
                if (Array.isArray(roles) && roles.includes('admin')) {
                    router.push('/admin')
                    return
                }
            }
            // Default User
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <main className="w-full max-w-md p-6 relative z-10">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                    {/* Close Button */}
                    <Link
                        href="/"
                        className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                    >
                        <X className="h-4 w-4" />
                    </Link>
                    <div className="text-center mb-8">
                        {/* Logo */}
                        <div className="flex justify-center mb-1">
                            <AvivaLogo className="h-16 w-auto" showText={false} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                            AvivaGo
                        </h1>
                        <p className="text-zinc-400 text-sm leading-relaxed px-4">
                            Bienvenido. Inicia sesión para que puedas interactuar en nuestra comunidad.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Correo Electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-zinc-500 hover:text-white transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className={`p-3 border rounded-lg text-sm text-center flex flex-col items-center justify-center gap-2 ${error === 'Correo no verificado.' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className={`h-4 w-4 ${error === 'Correo no verificado.' ? 'text-yellow-500' : 'rotate-45'}`} />
                                    {error}
                                </div>
                                {error === 'Correo no verificado.' && (
                                    <Link href={`/auth/verify-otp?email=${encodeURIComponent(email)}`} className="underline font-semibold hover:text-white">
                                        Verificar ahora
                                    </Link>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? 'Entrando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-zinc-500">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-white hover:underline">
                            Regístrate
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
