'use client'

import { useState, useEffect } from 'react'
import { BadgeCheck, Calendar, CreditCard, Loader2, CheckCircle, Shield, Info, Star, Clock, AlertTriangle, Car } from 'lucide-react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import ReviewModal from '../../../components/ReviewModal'
import { requestReview } from '@/app/driver/actions'

interface PaymentsSectionProps {
    isDriver: boolean
    hasMembership: boolean
    driverStatus?: string
    driverProfileId?: string
    onPurchaseSuccess: () => void
    profile: any
    vehicles: any[]
    services: any
    pendingPayment?: any
}

export default function PaymentsSection({ isDriver, hasMembership, driverStatus, driverProfileId, onPurchaseSuccess, profile, vehicles, services, pendingPayment }: PaymentsSectionProps) {
    const supabase = createClient()
    const [unlocks, setUnlocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [reviewModal, setReviewModal] = useState<{ open: boolean, driverId: string, driverName: string } | null>(null)
    const [purchasing, setPurchasing] = useState(false)

    // Appeal Modal State
    const [appealModalOpen, setAppealModalOpen] = useState(false)
    const [appealReason, setAppealReason] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const fetchHistory = async () => {
            // ... existing fetch logic ...
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Fetch Membership (Mock for now, checking if there are membership payments)
            if (isDriver) {
                const { data: membershipData } = await supabase
                    .from('unlocks') // Using unlocks for now as per project structure, but filtering by type if exists or amount
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('amount_paid', 524) // Our membership price
                    .limit(1)

                if (membershipData && membershipData.length > 0) {
                    onPurchaseSuccess()
                }
            }

            // 1. Fetch Unlocks
            const { data: unlocksData, error: unlockError } = await supabase
                .from('unlocks')
                .select(`
                    id,
                    amount_paid,
                    created_at,
                    driver_profile_id,
                    driver_profiles (
                        users (full_name)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (unlockError) {
                console.error('Error fetching unlocks:', unlockError)
                setLoading(false)
                return
            }

            // 2. Fetch Reviews for these unlocks
            const unlockIds = (unlocksData || []).map(u => u.id)
            const { data: reviewsData, error: reviewError } = await supabase
                .from('reviews')
                .select('id, rating, passenger_rating, unlock_id')
                .in('unlock_id', unlockIds)

            // 3. Merge them
            const merged = (unlocksData || []).map(unlock => ({
                ...unlock,
                reviews: (reviewsData || []).filter(r => r.unlock_id === unlock.id)
            }))

            setUnlocks(merged)
            setLoading(false)
        }
        fetchHistory()
    }, [isDriver, reviewModal, hasMembership, supabase, onPurchaseSuccess])

    const searchParams = useSearchParams()
    const router = useRouter()

    // ... existing openStripeCheckout ...
    const openStripeCheckout = (url: string) => {
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            url,
            'StripeCheckout',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
        );

        if (!popup) {
            alert('Por favor habilita las ventanas emergentes para continuar con el pago.');
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.source === 'avivago-payment') {
                if (event.data.status === 'success') {
                    onPurchaseSuccess();
                    // Alert removed for cleaner UX
                } else {
                    alert('El pago fue cancelado o no se pudo procesar.');
                }
                window.removeEventListener('message', handleMessage);
            }
        };

        window.addEventListener('message', handleMessage);

        const timer = setInterval(() => {
            if (popup.closed) {
                clearInterval(timer);
                window.removeEventListener('message', handleMessage);
            }
        }, 1000);
    };

    const handlePurchase = async () => {
        setPurchasing(true)
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(text)
            }

            const { url } = await response.json()
            openStripeCheckout(url)
        } catch (error: any) {
            alert('Error al procesar el pago: ' + error.message)
            console.error('Purchase error:', error)
        } finally {
            setPurchasing(false)
        }
    }

    const validateProfile = () => {
        if (!profile) return ['No hay datos de perfil']

        const errors = []
        // Personal Data
        if (!profile.full_name) errors.push('Nombre completo')
        if (!profile.phone_number) errors.push('Teléfono')
        if (!profile.nationality) errors.push('Nacionalidad')
        if (!profile.curp) errors.push('CURP')
        if (!profile.address_street) errors.push('Calle')
        if (!profile.address_number_ext) errors.push('Número exterior')
        if (!profile.address_suburb) errors.push('Colonia/Municipio')
        if (!profile.address_postal_code) errors.push('Código postal')
        if (!profile.address_state) errors.push('Estado')
        if (!profile.address_country) errors.push('País')
        if (!profile.id_document_url) errors.push('Identificación oficial o pasaporte (foto)')
        if (!profile.address_proof_url) errors.push('Comprobante de domicilio (foto)')

        // Vehicles Validation
        if (!vehicles || vehicles.length === 0) {
            errors.push('Registrar al menos un vehículo')
        }

        // Services Validation
        if (!services) {
            errors.push('Configuración de servicios')
        } else {
            if (!services.preferred_zones || services.preferred_zones.length === 0) {
                errors.push('Seleccionar tus zonas de cobertura (Mis Servicios)')
            }
            // Optional: Check questionnaire completion if deemed critical
            // if (!services.professional_questionnaire || Object.keys(services.professional_questionnaire).length === 0) {
            //     errors.push('Completar el Cuestionario Profesional (Mis Servicios)')
            // }
        }

        return errors
    }

    const handleRequestReview = async () => {
        if (!driverProfileId) return

        const errors = validateProfile()
        if (errors.length > 0) {
            alert('No podemos proceder con tu solicitud porque faltan los siguientes datos obligatorios:\n\n- ' + errors.join('\n- '))
            return
        }

        // Open modal instead of instant confirm
        setAppealReason('')
        setAppealModalOpen(true)
    }

    const confirmRequestReview = async () => {
        if (!driverProfileId) return

        setAppealModalOpen(false)
        setPurchasing(true) // Reuse loading state

        try {
            const result = await requestReview(driverProfileId, appealReason)
            if (result.error) throw new Error(result.error)
            alert('Solicitud enviada con éxito. Tu perfil está ahora en revisión.')
            window.location.reload() // Reload to refresh status
        } catch (error: any) {
            alert(error.message)
        } finally {
            setPurchasing(false)
        }
    }

    if (loading) return <div className="animate-pulse h-40 bg-white/5 rounded-3xl" />

    return (
        <div className="space-y-8">
            {/* ... rest of the render code ... */}

            {/* Appeal Modal */}
            {appealModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Solicitar Nueva Revisión
                        </h3>
                        <p className="text-zinc-400 text-sm mb-4">
                            Por favor explica brevemente tus correcciones o apelación para ayudar a nuestro staff a revisar tu perfil más rápido.
                        </p>

                        <textarea
                            value={appealReason}
                            onChange={(e) => setAppealReason(e.target.value)}
                            placeholder="Ej: He actualizado mi comprobante de domicilio y corregido mi nombre..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-zinc-500 min-h-[120px] focus:outline-none focus:border-white/20 transition-colors mb-6 resize-none"
                            autoFocus
                        />

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setAppealModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmRequestReview}
                                className="px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors font-bold text-sm shadow-lg"
                            >
                                Enviar Solicitud
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {isDriver ? (
                // ... rest of the code ... (Use existing code, just return it)
                // ...

                hasMembership ? (
                    <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <BadgeCheck className="h-32 w-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg text-white">Membresía Activa</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Plan Driver Premium</h3>
                            <p className="text-zinc-400 text-sm mb-6 max-w-md">Tu suscripción anual te permite aparecer en los resultados de búsqueda y recibir contactos directos de pasajeros.</p>

                            <div className="flex items-center gap-4 text-sm font-medium">
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <Calendar className="h-4 w-4 text-indigo-400" />
                                    <span>Próximo cobro: {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Status / Review Section */}
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-indigo-400" />
                                    Estado de Verificación
                                </h4>

                                {driverStatus === 'active' ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
                                        <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                                            <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-400">Cuenta Validada</p>
                                            <p className="text-xs text-emerald-400/70">Ya puedes recibir solicitudes de pasajeros.</p>
                                        </div>
                                    </div>
                                ) : driverStatus === 'pending_approval' ? (
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3">
                                        <div className="h-10 w-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-orange-400">En Revisión</p>
                                            <p className="text-xs text-orange-400/70">Estamos validando tu información. Te notificaremos pronto.</p>
                                        </div>
                                    </div>
                                ) : driverStatus === 'rejected' ? (
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                                                <Info className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-orange-500">Solicitud Rechazada</p>
                                                <p className="text-xs text-orange-400/80 mt-1 mb-3">
                                                    Tu perfil no cumple con algunos requisitos. Por favor revisa la razón a continuación y corrige tu información.
                                                </p>

                                                {profile?.driver_profile?.rejection_reason && (
                                                    <div className="bg-black/30 p-3 rounded-lg border border-orange-500/20 mb-2">
                                                        <p className="text-[10px] font-bold text-orange-500 uppercase mb-1 tracking-wider">Motivo del staff:</p>
                                                        <p className="text-sm text-white italic">"{profile.driver_profile.rejection_reason}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleRequestReview}
                                            disabled={purchasing}
                                            className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {purchasing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Shield className="h-4 w-4" />
                                            )}
                                            Solicitar Nueva Revisión
                                        </button>
                                    </div>
                                ) : driverStatus === 'suspended' ? (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 shrink-0">
                                                <AlertTriangle className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-red-500">Cuenta Suspendida</p>
                                                <p className="text-xs text-red-400/80 mt-1 mb-3">
                                                    Tu cuenta ha sido suspendida. Por favor revisa el motivo a continuación y contacta a soporte o solicita una revisión.
                                                </p>

                                                {profile?.driver_profile?.rejection_reason && (
                                                    <div className="bg-black/30 p-3 rounded-lg border border-red-500/20 mb-2">
                                                        <p className="text-[10px] font-bold text-red-500 uppercase mb-1 tracking-wider">Motivo de suspensión:</p>
                                                        <p className="text-sm text-white italic">"{profile.driver_profile.rejection_reason}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleRequestReview}
                                            disabled={purchasing}
                                            className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {purchasing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Shield className="h-4 w-4" />
                                            )}
                                            Solicitar Revisión para Reactivación
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-zinc-400 text-sm mb-4">
                                            Para comenzar a operar, debes solicitar una revisión de tu perfil. Asegúrate de haber completado todos tus datos.
                                        </p>
                                        <button
                                            onClick={handleRequestReview}
                                            disabled={purchasing}
                                            className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {purchasing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Shield className="h-4 w-4" />
                                            )}
                                            Solicitar Revisión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                        <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-indigo-600/5 transition-transform hover:scale-110 duration-500">
                            <CreditCard className="h-10 w-10 text-indigo-500" />
                        </div>

                        <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Activa tu Membresía Driver</h3>
                        <p className="text-zinc-400 text-lg mb-12 leading-relaxed max-w-2xl mx-auto">
                            Únete a la red de conductores profesionales de AvivaGo. Sigue estos simples pasos para comenzar a recibir solicitudes directas de pasajeros.
                        </p>

                        {pendingPayment && (
                            <div className="mb-12 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-left flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                                <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500 shrink-0">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-bold text-amber-200">Tienes un pago pendiente</h4>
                                        <p className="text-sm text-amber-200/60">Detectamos un intento de pago por transferencia (SPEI) o efectivo que aún no se ha completado.</p>
                                    </div>
                                    <button
                                        onClick={() => openStripeCheckout(pendingPayment.checkout_url)}
                                        className="inline-flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition-colors"
                                    >
                                        Ver Instrucciones de Pago
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Process Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 text-left relative">

                            {/* Step 1 */}
                            <div className="bg-zinc-900/80 border border-indigo-500/50 p-6 rounded-3xl relative shadow-lg shadow-indigo-500/20 overflow-hidden group hover:bg-zinc-900 transition-colors">
                                <div className="absolute top-0 left-0 bg-indigo-600 text-white px-4 py-1.5 rounded-br-2xl text-[10px] font-bold tracking-widest uppercase">Paso 01</div>
                                <div className="mt-6 flex flex-col items-center">
                                    <div className="h-12 w-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <h4 className="font-bold text-white text-center mb-2">Activa Membresía</h4>
                                    <p className="text-xs text-zinc-400 text-center leading-relaxed">Realiza tu pago anual seguro para desbloquear las funciones de tu perfil.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:bg-white/5 transition-colors">
                                <div className="absolute top-0 left-0 bg-white/10 text-zinc-400 px-4 py-1.5 rounded-br-2xl text-[10px] font-bold tracking-widest uppercase">Paso 02</div>
                                <div className="mt-6 flex flex-col items-center">
                                    <div className="h-12 w-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                        <Car className="h-6 w-6" />
                                    </div>
                                    <h4 className="font-bold text-zinc-300 text-center mb-2">Configura Datos</h4>
                                    <p className="text-xs text-zinc-500 text-center leading-relaxed">Registra al menos un vehículo y tus zonas de cobertura.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:bg-white/5 transition-colors">
                                <div className="absolute top-0 left-0 bg-white/10 text-zinc-400 px-4 py-1.5 rounded-br-2xl text-[10px] font-bold tracking-widest uppercase">Paso 03</div>
                                <div className="mt-6 flex flex-col items-center">
                                    <div className="h-12 w-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <h4 className="font-bold text-zinc-300 text-center mb-2">Solicita Revisión</h4>
                                    <p className="text-xs text-zinc-500 text-center leading-relaxed">Envía tu perfil a validación de identidad para mayor seguridad.</p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:bg-white/5 transition-colors">
                                <div className="absolute top-0 left-0 bg-green-500/10 text-green-500 px-4 py-1.5 rounded-br-2xl text-[10px] font-bold tracking-widest uppercase">Paso 04</div>
                                <div className="mt-6 flex flex-col items-center">
                                    <div className="h-12 w-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-zinc-500 group-hover:text-green-400/50 transition-colors">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <h4 className="font-bold text-zinc-300 text-center mb-2">¡Recibe Clientes!</h4>
                                    <p className="text-xs text-zinc-500 text-center leading-relaxed">Tu perfil se vuelve público y aceptas solicitudes directas.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-8 mb-10 inline-block px-12 transform hover:scale-[1.02] transition-transform shadow-inner">
                            <div className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-black mb-2">Costo Anual de Activación</div>
                            <div className="text-5xl font-black text-white">$524 <span className="text-sm font-medium text-zinc-500 tracking-normal">MXN</span></div>
                        </div>

                        <div className="space-y-6">
                            <button
                                onClick={handlePurchase}
                                disabled={purchasing}
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-16 rounded-[2rem] transition-all shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 mx-auto disabled:opacity-50 active:scale-[0.98] group"
                            >
                                {purchasing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Validando Pago...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                        Comenzar Activación Ahora
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-2 opacity-40">
                                <Shield className="h-3 w-3" />
                                <p className="text-[10px] text-white uppercase font-bold tracking-[0.1em]">Transacción Protegida por AvivaGo Secure</p>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                        <Info className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-100">Transparencia en tus pagos</h4>
                        <p className="text-sm text-blue-200/60 mt-1">Aquí puedes ver el historial de conductores que has desbloqueado. Cada pago te garantiza acceso ilimitado a su contacto por tiempo indefinido.</p>
                    </div>
                </div>
            )}

            {(!isDriver || hasMembership) && (
                <div className="space-y-4 animate-in fade-in duration-700">
                    <h3 className="font-bold text-lg">{isDriver ? 'Historial de Membresía' : 'Historial de Desbloqueos'}</h3>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">{isDriver ? 'Concepto' : 'Conductor'}</th>
                                    <th className="px-6 py-4">Fecha de Pago</th>
                                    {isDriver && <th className="px-6 py-4">Expira el</th>}
                                    <th className="px-6 py-4 text-right">Monto</th>
                                    {!isDriver && (
                                        <>
                                            <th className="px-6 py-4 text-center">Tu Calif.</th>
                                            <th className="px-6 py-4 text-center">Calif. Conductor</th>
                                            <th className="px-6 py-4 text-right">Acción</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {unlocks.length > 0 ? (
                                    unlocks.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                {isDriver ? (
                                                    item.amount_paid === 524
                                                        ? 'Membresía Anual Driver Premium'
                                                        : 'Pago de Servicio'
                                                ) : (
                                                    item.driver_profiles?.users?.full_name || 'Conductor Desconocido'
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500">
                                                {new Date(item.created_at).toLocaleDateString('es-MX', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            {isDriver && (
                                                <td className="px-6 py-4 text-indigo-400/70 font-medium">
                                                    {new Date(new Date(item.created_at).setFullYear(new Date(item.created_at).getFullYear() + 1)).toLocaleDateString('es-MX', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-right font-bold text-emerald-400">
                                                ${item.amount_paid === 524 || isDriver ? 524 : item.amount_paid} MXN
                                            </td>
                                            {!isDriver && (
                                                <>
                                                    <td className="px-6 py-4 text-center">
                                                        {item.reviews && item.reviews.length > 0 ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                                                                <Star className="h-3 w-3 fill-current" />
                                                                {item.reviews[0].rating}.0
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">SIN CALIFICAR</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {item.reviews && item.reviews.length > 0 && item.reviews[0].passenger_rating ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                                                                <Star className="h-3 w-3 fill-current" />
                                                                {item.reviews[0].passenger_rating}.0
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter italic">PENDIENTE</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {item.reviews && item.reviews.length > 0 ? (
                                                            <div className="flex items-center justify-end gap-1.5 text-zinc-500 opacity-50">
                                                                <CheckCircle className="h-4 w-4" />
                                                                <span className="text-[10px] font-black uppercase">Completado</span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setReviewModal({
                                                                    open: true,
                                                                    driverId: item.driver_profile_id,
                                                                    driverName: item.driver_profiles?.users?.full_name || 'Conductor'
                                                                })}
                                                                className="text-[10px] font-black bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest active:scale-95"
                                                            >
                                                                Calificar
                                                            </button>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isDriver ? 3 : 6} className="px-6 py-12 text-center text-zinc-500 italic">
                                            No se encontraron transacciones recientes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {reviewModal && (
                <ReviewModal
                    isOpen={reviewModal.open}
                    onClose={() => setReviewModal(null)}
                    driverId={reviewModal.driverId}
                    driverName={reviewModal.driverName}
                />
            )}
        </div>
    )
}
