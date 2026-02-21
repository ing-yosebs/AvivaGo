'use client'

import { useState, Suspense, useEffect } from 'react'
import { User, Lock, CheckCircle, Loader2, Eye, EyeOff, X, AlertCircle, Phone, ArrowRight, Car } from 'lucide-react'
import AvivaLogo from '@/app/components/AvivaLogo'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

function RegisterForm() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2>(1) // 1: Info, 2: OTP
    const [isDriver, setIsDriver] = useState(false)
    const [pending, setPending] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    // Form State
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [otpCode, setOtpCode] = useState('')

    // Referral
    const searchParams = useSearchParams()
    const redirectUrl = searchParams.get('redirect')
    const forcedRole = searchParams.get('role') === 'driver'
    const forcedPassenger = searchParams.get('role') === 'passenger'
    const isRoleForced = forcedRole || forcedPassenger
    const [invitationCode, setInvitationCode] = useState('')
    const [termsAccepted, setTermsAccepted] = useState(false)

    // Pre-fill invitation code from URL
    useEffect(() => {
        const ref = searchParams.get('ref')
        if (ref) setInvitationCode(ref)
    }, [searchParams])

    // Force role mode if specified in URL
    useEffect(() => {
        if (forcedRole) setIsDriver(true)
        if (forcedPassenger) setIsDriver(false)
    }, [forcedRole, forcedPassenger])

    async function handleSendCode(e: React.FormEvent) {
        e.preventDefault()
        setPending(true)
        setError(null)
        setMessage(null)

        // Validation
        if (fullName.trim().length < 3) {
            setError('El nombre debe tener al menos 3 caracteres.')
            setPending(false)
            return
        }
        if (phone.length < 10) {
            setError('Por favor ingresa un número de teléfono válido.')
            setPending(false)
            return
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.')
            setPending(false)
            return
        }
        if (!termsAccepted) {
            setError('Debes aceptar los términos y condiciones.')
            setPending(false)
            return
        }

        try {
            const res = await fetch('/api/auth/whatsapp/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Error al enviar código')

            setMessage('Código enviado a tu WhatsApp')
            setStep(2) // Move to OTP step
        } catch (err: any) {
            setError(err.message)
        } finally {
            setPending(false)
        }
    }

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault()
        setPending(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/whatsapp/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    code: otpCode,
                    fullName,
                    invitationCode,
                    password
                })
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Código incorrecto')

            // If verification successful, update profile with Name and Role
            // We need a separate action or API to update metadata after login?
            // Actually, verify-otp logs them in. Now we might need to update the profile.
            // Since we don't have a secure way to pass metadata to verify-otp simply (unless we add it to the body),
            // let's do it here if possible or just rely on them updating it later?
            // BETTER: The verify-otp route creates the user with "Usuario Nuevo". 
            // We should probably pass the name to verify-otp to update it during creation.
            // BUT for now let's just redirect. The user can update profile later.
            // OR we can call an update profile action now that we are logged in.

            // Redirect
            window.location.href = redirectUrl || (isDriver ? '/panel/perfil' : '/dashboard')

        } catch (err: any) {
            setError(err.message)
            setPending(false)
        }
    }

    return (
        <main className="w-full max-w-md p-6 relative z-10">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                {/* Close Button */}
                <Link
                    href={redirectUrl || '/'}
                    className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                >
                    <X className="h-4 w-4" />
                </Link>

                <div className="text-center mb-8">
                    <div className="flex justify-center mb-1">
                        <AvivaLogo className="h-16 w-auto" showText={false} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                        AvivaGo
                    </h1>
                    <h2 className="text-xl font-semibold text-white/90">
                        {step === 1 ? 'Crear Cuenta' : 'Verificar WhatsApp'}
                    </h2>

                    {step === 1 && invitationCode && (
                        <div className="mt-3 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-2 inline-flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-purple-200">
                                Invitado por: <span className="font-mono font-bold">{invitationCode}</span>
                            </span>
                        </div>
                    )}
                </div>

                {step === 1 && (
                    <>
                        {!isRoleForced && (
                            <div className="flex bg-white/5 p-1 rounded-xl mb-6 relative border border-white/5">
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

                        <form onSubmit={handleSendCode} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                    <input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        type="text"
                                        placeholder="Nombre Completo"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div className="space-y-2">
                                <div className="relative">
                                    <div className="absolute left-3 top-3 z-10">
                                        <Phone className="h-5 w-5 text-zinc-500" />
                                    </div>
                                    <div className="pl-10">
                                        <PhoneInput
                                            country={'mx'}
                                            value={phone}
                                            onChange={setPhone}
                                            inputClass="!w-full !bg-black/20 !border !border-white/10 !rounded-xl !py-3 !text-white !h-[46px] !pl-[48px] focus:!border-purple-500/50 focus:!ring-1 focus:!ring-purple-500/50 transition-all placeholder:!text-zinc-600"
                                            buttonClass="!bg-transparent !border-none !left-0"
                                            dropdownClass="!bg-zinc-900 !text-white !border-white/10"
                                            preferredCountries={['mx', 'us', 'co']}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Invitation Code */}
                            <div className="space-y-2">
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                    <input
                                        value={invitationCode}
                                        onChange={(e) => setInvitationCode(e.target.value)}
                                        type="text"
                                        placeholder="Código de Invitación (Opcional)"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="space-y-2 px-1">
                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        required
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-white/10 bg-black/20 text-purple-600 focus:ring-purple-500/50"
                                    />
                                    <label htmlFor="terms" className="text-sm text-zinc-400 select-none cursor-pointer leading-tight">
                                        He leído y acepto los <Link href="/legales/terminos-y-condiciones" className="text-white hover:underline">Términos y Condiciones</Link> y el <Link href="/legales/aviso-de-privacidad" className="text-white hover:underline">Aviso de Privacidad</Link>.
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={pending || !termsAccepted}
                                className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {pending ? 'Enviando...' : 'Continuar con WhatsApp'}
                                {!pending && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerify} className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <p className="text-zinc-400 mb-4">
                                Hemos enviado un código de verificación a tu WhatsApp
                                <br />
                                <span className="text-white font-mono">{phone}</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <input
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                type="text"
                                placeholder="Código de 6 dígitos"
                                required
                                maxLength={6}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={pending || otpCode.length !== 6}
                            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Verificar y Crear Cuenta
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-zinc-500 text-sm hover:text-white transition-colors"
                        >
                            Cambiar número de teléfono
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-sm text-zinc-500">
                    ¿Ya tienes cuenta?{' '}
                    <Link href={`/auth/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} className="text-white hover:underline">
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
