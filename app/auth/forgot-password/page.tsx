'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle, Rocket } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <main className="w-full max-w-md p-6 relative z-10">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        {/* Logo */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                                <Rocket className="h-8 w-8 text-white transform -rotate-45" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                            Recuperar Cuenta
                        </h1>
                        <p className="text-zinc-400 text-sm leading-relaxed px-4">
                            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                    </div>

                    {!message ? (
                        <form onSubmit={handleResetPassword} className="space-y-4">
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

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loading ? 'Enviando...' : 'Enviar Enlace'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <p className="text-zinc-300 mb-6">{message}</p>
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center gap-2 text-white hover:underline"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    )}

                    {!message && (
                        <div className="mt-8 text-center text-sm">
                            <Link href="/auth/login" className="text-zinc-500 hover:text-white flex items-center justify-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Volver al Login
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
