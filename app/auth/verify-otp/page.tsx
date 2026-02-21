'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Rocket, X, CheckCircle, AlertCircle, Phone } from 'lucide-react'
import Link from 'next/link'

function VerifyOTPForm() {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    const redirectUrl = searchParams.get('redirect')

    const identifier = email || phone
    const isPhone = !!phone

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!identifier) {
            setError('Falta el método de verificación (correo o teléfono)')
            return
        }
        setLoading(true)
        setError(null)

        if (isPhone) {
            // Verify via custom WhatsApp API
            try {
                const res = await fetch('/api/auth/whatsapp/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, code: otp })
                })
                const data = await res.json()

                if (!res.ok) {
                    setError(data.error || 'Código incorrecto')
                    setLoading(false)
                } else {
                    setSuccess(true)
                    setTimeout(() => {
                        router.push(redirectUrl || '/dashboard')
                    }, 2000)
                }
            } catch (err) {
                setError('Error de conexión')
                setLoading(false)
            }
        } else {
            // Verify via Supabase Email Auth
            const supabase = createClient()
            const { error } = await supabase.auth.verifyOtp({
                email: email!,
                token: otp,
                type: 'signup',
            })

            if (error) {
                setError(error.message === 'Token has expired' ? 'El código ha expirado' : 'Código inválido o ya utilizado')
                setLoading(false)
            } else {
                setSuccess(true)
                setTimeout(() => {
                    router.push(redirectUrl || '/dashboard')
                }, 2000)
            }
        }
    }

    return (
        <main className="w-full max-w-md p-6 relative z-10">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                <Link
                    href={isPhone ? "/register" : "/auth/login"}
                    className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                >
                    <X className="h-4 w-4" />
                </Link>

                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                            {isPhone ? <Phone className="h-8 w-8 text-white" /> : <Rocket className="h-8 w-8 text-white transform -rotate-45" />}
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Verifica tu Cuenta
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Hemos enviado un código de 6 dígitos a <br />
                        <span className="text-white font-medium">{identifier}</span>
                    </p>
                </div>

                {success ? (
                    <div className="text-center py-8 animate-in zoom-in duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-6 ring-8 ring-emerald-500/5">
                            <CheckCircle className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">¡Cuenta Verificada!</h3>
                        <p className="text-zinc-400">Redirigiéndote a tu panel...</p>
                    </div>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest block text-center">
                                Introduce el código
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-center text-4xl font-mono tracking-[15px] text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-800"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl"
                        >
                            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                            Verificar Código
                        </button>

                        <div className="text-center">
                            {!isPhone && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!email) return
                                        const { resendOtp } = await import('@/app/auth/actions')
                                        const res = await resendOtp(email)
                                        if (res.error) {
                                            setError(res.error)
                                        } else {
                                            alert('Nuevo código enviado. Por favor revisa tu correo.')
                                        }
                                    }}
                                    className="text-sm text-zinc-500 hover:text-white transition-colors underline"
                                >
                                    ¿No recibiste el código o expiró? Reenviar
                                </button>
                            )}
                            {isPhone && (
                                <p className="text-xs text-zinc-500">
                                    Si no recibiste el código, intenta registrarte nuevamente para solicitar uno nuevo.
                                </p>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </main>
    )
}

export default function VerifyOTPPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-white/20" />}>
                <VerifyOTPForm />
            </Suspense>
        </div>
    )
}
