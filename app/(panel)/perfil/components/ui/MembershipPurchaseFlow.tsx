import { CreditCard, Clock, Shield, CheckCircle, Car, Loader2 } from 'lucide-react'

interface MembershipPurchaseFlowProps {
    pendingPayment?: any
    openStripeCheckout: (url: string) => void
    handlePurchase: () => void
    purchasing: boolean
    paymentConsent: boolean
    setPaymentConsent: (val: boolean) => void
    price: number
    currency: string
}

export default function MembershipPurchaseFlow({ pendingPayment, openStripeCheckout, handlePurchase, purchasing, paymentConsent, setPaymentConsent, price, currency }: MembershipPurchaseFlowProps) {
    return (
        <div className="backdrop-blur-xl bg-white border border-gray-100 rounded-[3rem] p-8 md:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-indigo-50 transition-transform hover:scale-110 duration-500">
                <CreditCard className="h-10 w-10 text-indigo-600" />
            </div>

            <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-[#0F2137]">Activa tu Membresía Driver</h3>
            <p className="text-gray-500 text-lg mb-12 leading-relaxed max-w-2xl mx-auto">
                Únete a la red de conductores profesionales de AvivaGo. Sigue estos simples pasos para comenzar a recibir solicitudes directas de pasajeros.
            </p>

            {pendingPayment && (
                <div className="mb-12 p-6 bg-amber-50 border border-amber-200 rounded-3xl text-left flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 shrink-0">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-bold text-amber-700">Tienes un pago pendiente</h4>
                            <p className="text-sm text-amber-700/60">Detectamos un intento de pago por transferencia (SPEI) o efectivo que aún no se ha completado.</p>
                        </div>
                        <button
                            onClick={() => openStripeCheckout(pendingPayment.checkout_url)}
                            className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                        >
                            Ver Instrucciones de Pago
                        </button>
                    </div>
                </div>
            )}

            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 text-left relative">

                {/* Step 1 */}
                <div className="bg-white border border-indigo-100 p-6 rounded-3xl relative shadow-lg shadow-indigo-500/10 overflow-hidden group hover:bg-gray-50 transition-colors">
                    <div className="absolute top-0 left-0 bg-indigo-600 text-white px-4 py-1.5 rounded-br-2xl text-[10px] font-bold tracking-widest uppercase">Paso 01</div>
                    <div className="mt-6 flex flex-col items-center">
                        <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-[#0F2137] text-center mb-2">Activa Membresía</h4>
                        <p className="text-xs text-gray-500 text-center leading-relaxed">Realiza tu pago anual seguro para desbloquear las funciones de tu perfil.</p>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl relative overflow-hidden group hover:bg-white transition-colors">
                    <div className="absolute top-0 left-0 bg-gray-200 text-gray-600 px-4 py-1.5 rounded-br-2xl text-[10px] font-bold tracking-widest uppercase">Paso 02</div>
                    <div className="mt-6 flex flex-col items-center">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-gray-600 transition-colors shadow-sm">
                            <Car className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-gray-600 text-center mb-2">Configura Datos</h4>
                        <p className="text-xs text-gray-400 text-center leading-relaxed">Registra al menos un vehículo y tus zonas de cobertura.</p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl relative overflow-hidden group hover:bg-white transition-colors">
                    <div className="absolute top-0 left-0 bg-gray-200 text-gray-600 px-4 py-1.5 rounded-br-2xl text-[10px] font-bold tracking-widest uppercase">Paso 03</div>
                    <div className="mt-6 flex flex-col items-center">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-gray-600 transition-colors shadow-sm">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-gray-600 text-center mb-2">Solicita Revisión</h4>
                        <p className="text-xs text-gray-400 text-center leading-relaxed">Envía tu perfil a validación de identidad para mayor seguridad.</p>
                    </div>
                </div>

                {/* Step 4 */}
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl relative overflow-hidden group hover:bg-white transition-colors">
                    <div className="absolute top-0 left-0 bg-green-100/50 text-green-600 px-4 py-1.5 rounded-br-2xl text-[10px] font-bold tracking-widest uppercase">Paso 04</div>
                    <div className="mt-6 flex flex-col items-center">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-green-500 transition-colors shadow-sm">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-gray-600 text-center mb-2">¡Recibe Clientes!</h4>
                        <p className="text-xs text-gray-400 text-center leading-relaxed">Tu perfil se vuelve público y aceptas solicitudes directas.</p>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 mb-10 inline-block px-12 transform hover:scale-[1.02] transition-transform shadow-inner">
                <div className="text-[10px] text-indigo-500 uppercase tracking-[0.2em] font-black mb-2">Costo Anual de Activación</div>
                <div className="text-5xl font-black text-[#0F2137]">${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-sm font-medium text-gray-500 tracking-normal">{currency}</span></div>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left hover:bg-white hover:shadow-sm transition-all cursor-pointer" onClick={() => setPaymentConsent(!paymentConsent)}>
                    <div className="relative flex items-center pt-0.5">
                        <input
                            type="checkbox"
                            id="payment-consent"
                            checked={paymentConsent}
                            onChange={(e) => setPaymentConsent(e.target.checked)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-400"
                        />
                        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                            <CheckCircle className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <label htmlFor="payment-consent" className="text-sm text-gray-600 cursor-pointer select-none leading-tight">
                        Autorizo a que se me dirija a Stripe para realizar el pago correspondiente.
                    </label>
                </div>

                <button
                    onClick={handlePurchase}
                    disabled={purchasing || !paymentConsent}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-16 rounded-[2rem] transition-all shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] group"
                >
                    {purchasing ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Validando Pago...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                            Pagar Membresía Ahora
                        </>
                    )}
                </button>

                <div className="flex flex-col items-center justify-center gap-2 text-center pt-2">
                    <div className="flex items-center gap-1.5 text-gray-400 opacity-80">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pago Seguro</span>
                    </div>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                        El pago se procesará de forma segura a través de Stripe. AvivaGo no almacena información financiera sensible.
                    </p>
                </div>
            </div>
        </div>
    )
}
