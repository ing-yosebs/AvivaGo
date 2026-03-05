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
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    // Form State
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [countdown, setCountdown] = useState(25) // Redirigir después de 25 segundos

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

    const [userCountry, setUserCountry] = useState('mx')

    // Detect user country by IP
    useEffect(() => {
        const detectCountry = async () => {
            try {
                // Using a more reliable way to fetch with a timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.country_code) {
                        setUserCountry(data.country_code.toLowerCase());
                    }
                }
            } catch (err) {
                // Silently fall back to 'mx' if anything fails (CORS, network, timeout)
                console.warn('Silent fallback: Country detection failed.', err);
            }
        };
        detectCountry();
    }, []);

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
                    password,
                    role: isDriver ? 'driver' : 'client'
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

            // Show success modal instead of redirecting immediately
            setShowSuccessModal(true)

        } catch (err: any) {
            setError(err.message)
            setPending(false)
        }
    }

    // Manejar la redirección automática después del registro
    useEffect(() => {
        if (showSuccessModal && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1)
            }, 1000)
            return () => clearTimeout(timer)
        } else if (showSuccessModal && countdown === 0) {
            handleFinalRedirect()
        }
    }, [showSuccessModal, countdown])

    const handleFinalRedirect = () => {
        const isLandingRedirect = redirectUrl === '/conductores' || redirectUrl === '/pasajeros' || redirectUrl === '/';
        window.location.href = (redirectUrl && !isLandingRedirect) ? redirectUrl : (isDriver ? '/perfil?tab=driver_dashboard' : '/dashboard');
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
                                    Pasajero
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
                                    <div
                                        className="pl-10"
                                        onClick={(e) => {
                                            const target = e.target as HTMLElement;

                                            // Si se hace clic en el dropdown de banderas o en la bandera seleccionada
                                            // pero NO en el campo de búsqueda directamente
                                            if ((target.closest('.flag-dropdown') || target.closest('.selected-flag')) && !target.closest('.search-box')) {
                                                // Usamos un pequeño timeout para contrarrestar el auto-focus automático de la librería
                                                setTimeout(() => {
                                                    const searchInput = document.querySelector('.search-box') as HTMLElement;
                                                    if (searchInput) {
                                                        searchInput.blur();
                                                    }
                                                    if (document.activeElement instanceof HTMLElement) {
                                                        document.activeElement.blur();
                                                    }
                                                }, 50);
                                            }
                                        }}
                                    >
                                        <PhoneInput
                                            country={userCountry}
                                            value={phone}
                                            onChange={setPhone}
                                            inputClass="!w-full !bg-black/20 !border !border-white/10 !rounded-xl !py-3 !text-white !h-[46px] !pl-[48px] focus:!border-purple-500/50 focus:!ring-1 focus:!ring-purple-500/50 transition-all placeholder:!text-zinc-600"
                                            buttonClass="!bg-transparent !border-none !left-0"
                                            dropdownClass="!bg-zinc-900 !text-white !border-white/10"
                                            preferredCountries={['mx', 'us', 'co', 'pe']}
                                            countryCodeEditable={false}
                                            enableSearch
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

                            {/* Invitation Code (Hidden to avoid confusion, but still functional via URL) */}
                            <div className="space-y-2 hidden">
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
                            <div className="space-y-4 px-1 pt-2">
                                <label className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                                    <div className="flex items-center h-6">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            required
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="w-6 h-6 rounded-lg border-white/20 bg-black/40 text-purple-600 focus:ring-purple-500/50 cursor-pointer transition-all transform active:scale-95"
                                        />
                                    </div>
                                    <div className="text-[14px] text-zinc-400 select-none leading-relaxed">
                                        He leído y acepto los <Link href="/legales/terminos-y-condiciones" onClick={(e) => e.stopPropagation()} className="text-white font-medium hover:underline decoration-purple-500/50 underline-offset-4">Términos y Condiciones</Link> y el <Link href="/legales/aviso-de-privacidad" onClick={(e) => e.stopPropagation()} className="text-white font-medium hover:underline decoration-purple-500/50 underline-offset-4">Aviso de Privacidad</Link>.
                                    </div>
                                </label>
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
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                    setOtpCode(text);
                                }}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                autoComplete="one-time-code"
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

            {/* Success Modal - Welcome Screen */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { }} />
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl z-10 w-full max-w-md text-center animate-in zoom-in-95 duration-500 overflow-hidden relative">
                        {/* Decorative Background for the modal */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />


                        <h3 className="text-3xl font-bold text-white mb-2">
                            ¡Bienvenido, {fullName.split(' ')[0]}!
                        </h3>
                        <p className="text-zinc-400 mb-8">
                            Tu cuenta ha sido creada exitosamente.
                        </p>

                        {/* Login Reminder Box */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-8 text-left space-y-3 relative overflow-hidden">
                            {/* Watermark Icon - Restricted to this section */}
                            <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none z-0">
                                <CheckCircle className="w-32 h-32 text-emerald-500 rotate-12" />
                            </div>
                            <p className="text-xs font-bold uppercase text-zinc-500 tracking-widest mb-1">Tu Acceso Futuro</p>

                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <ArrowRight className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-sm">
                                    Ingresa a: <a href="https://avivago.mx" target="_blank" rel="noopener noreferrer" className="text-white hover:underline decoration-blue-500/50 underline-offset-4 font-medium transition-all">https://avivago.mx</a>
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Phone className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-sm">
                                    Usa tu número: <span className="text-white font-medium">+{phone}</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Lock className="w-4 h-4 text-purple-400" />
                                </div>
                                <span className="text-sm">La contraseña que acabas de crear</span>
                            </div>
                        </div>



                        {/* WhatsApp Community CTA - High Persuasion */}
                        <div className="relative group mb-8">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 transition-all duration-300">
                                <h4 className="text-emerald-400 font-bold mb-2 flex items-center justify-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    ¡BONO ADICIONAL!
                                </h4>
                                <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                                    Únete a nuestra comunidad para recibir soporte técnico y consejos exclusivos para maximizar tus ingresos con las herramientas de <span className="text-white font-semibold">AvivaGo</span>.
                                </p>
                                <a
                                    href="https://chat.whatsapp.com/LZL7Ql57Wdl7ZMyr6YjKMG"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Unirme a la Comunidad WhatsApp <ArrowRight className="w-4 h-4" />
                                </a>
                                <p className="text-[10px] text-zinc-500 mt-3 text-center">
                                    *Cupos limitados disponibles para nuevos miembros registrados hoy
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleFinalRedirect}
                            className="w-full text-zinc-400 hover:text-white font-medium py-2 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            Ir a mi panel personal (Redirigiendo en {countdown}s) <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
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
