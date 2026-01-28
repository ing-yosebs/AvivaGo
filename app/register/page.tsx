'use client'

import { useState, Suspense, useEffect } from 'react'
import { signUp } from '@/app/auth/actions'
import { User, Mail, Lock, CheckCircle, Loader2, Eye, EyeOff, X, AlertCircle, Users, Car } from 'lucide-react'
import AvivaLogo from '@/app/components/AvivaLogo'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function RegisterForm() {
    const [isDriver, setIsDriver] = useState(false)
    const [pending, setPending] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const [showExistsModal, setShowExistsModal] = useState(false)
    const [existingEmail, setExistingEmail] = useState('')

    const searchParams = useSearchParams()
    const forcedRole = searchParams.get('role') === 'driver'
    const [invitationCode, setInvitationCode] = useState('')
    const [referralName, setReferralName] = useState<string | null>(null)

    // Pre-fill invitation code from URL
    useEffect(() => {
        const ref = searchParams.get('ref')
        if (ref) {
            setInvitationCode(ref)
        }
    }, [searchParams])

    // Force driver mode if specified in URL
    useState(() => {
        if (forcedRole) setIsDriver(true)
    })

    async function handleSubmit(formData: FormData) {
        setPending(true)
        setError(null)
        setMessage(null)

        const email = formData.get('email') as string
        const confirmEmail = formData.get('confirmEmail') as string
        const terms = formData.get('terms')

        if (email !== confirmEmail) {
            setError('Los correos electrónicos no coinciden')
            setPending(false)
            return
        }

        if (!terms) {
            setError('Debes aceptar los términos y condiciones')
            setPending(false)
            return
        }

        // Add role process
        formData.append('role', isDriver ? 'driver' : 'client')
        if (invitationCode) {
            formData.append('referralCode', invitationCode)
        }

        const res = await signUp(formData)

        if (res?.error) {
            if (res.code === 'USER_EXISTS') {
                setExistingEmail(email)
                setShowExistsModal(true)
            } else {
                setError(res.error)
            }
        } else if (res?.success) {
            // Redirect to verify-otp page
            window.location.href = `/auth/verify-otp?email=${encodeURIComponent(email)}`
            return
        }
        setPending(false)
    }

    return (
        <main className="w-full max-w-md p-6 relative z-10">
            {/* User Exists Modal */}
            {showExistsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#18181b] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowExistsModal(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-yellow-500/20">
                                <AlertCircle className="h-8 w-8 text-yellow-500" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">Cuenta ya registrada</h3>

                            <p className="text-zinc-400 text-sm mb-6">
                                El correo <span className="text-white font-medium">{existingEmail}</span> ya tiene una cuenta asociada en AvivaGo.
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <Link
                                    href="/auth/forgot-password"
                                    className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors text-center"
                                >
                                    Recuperar Contraseña
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowExistsModal(false)
                                        // Optional: Clear email input or focus it
                                    }}
                                    className="w-full bg-white/5 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    Intentar con otro correo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                    <h2 className="text-xl font-semibold text-white/90">
                        Crear Cuenta
                    </h2>

                    {invitationCode && (
                        <div className="mt-3 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-2 inline-flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-purple-200">
                                Invitado por: <span className="font-mono font-bold">{invitationCode}</span>
                            </span>
                        </div>
                    )}

                    <p className="text-zinc-400 mt-2 text-sm">
                        Únete a la comunidad exclusiva de AvivaGo
                    </p>
                </div>

                {!forcedRole && (
                    <div className="flex bg-white/5 p-1 rounded-xl mb-8 relative border border-white/5">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-spring ${isDriver
                                ? 'translate-x-[100%] bg-purple-500/20 border border-purple-500/30'
                                : 'translate-x-0 bg-blue-500/20 border border-blue-500/30'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setIsDriver(false)}
                            className={`flex-1 py-3 text-sm font-medium z-10 transition-all flex items-center justify-center gap-2 ${!isDriver ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <User className={`h-4 w-4 ${!isDriver ? 'animate-pulse' : ''}`} />
                            Usuario
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDriver(true)}
                            className={`flex-1 py-3 text-sm font-medium z-10 transition-all flex items-center justify-center gap-2 ${isDriver ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Car className={`h-4 w-4 ${isDriver ? 'animate-pulse' : ''}`} />
                            Conductor
                        </button>
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                name="fullName"
                                type="text"
                                placeholder="Nombre Completo"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                name="email"
                                type="email"
                                placeholder="Correo Electrónico"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                name="confirmEmail"
                                type="email"
                                placeholder="Confirmar Correo Electrónico"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                required
                                minLength={6}
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
                        <p className="text-[10px] text-zinc-500 px-1 mt-1">
                            La contraseña debe tener al menos 6 caracteres.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                name="invitationCode"
                                type="text"
                                placeholder="Código de Invitación (Opcional)"
                                value={invitationCode}
                                onChange={(e) => setInvitationCode(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <input
                            type="checkbox"
                            name="terms"
                            id="terms"
                            required
                            className="w-4 h-4 rounded border-white/10 bg-black/20 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-0"
                        />
                        <label htmlFor="terms" className="text-sm text-zinc-400 select-none cursor-pointer">
                            Acepto los <Link href="/terms" className="text-white hover:underline">términos y condiciones</Link>
                        </label>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isDriver ? 'Aplicar como Conductor' : 'Registrarme como Pasajero'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-zinc-500">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/auth/login" className="text-white hover:underline">
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <Suspense fallback={
                <div className="w-full max-w-md p-6 relative z-10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white/20" />
                </div>
            }>
                <RegisterForm />
            </Suspense>
        </div>
    )
}
