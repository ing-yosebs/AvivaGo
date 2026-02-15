import React from 'react'
import { AlertCircle, XCircle, CheckCircle2 } from 'lucide-react'

interface MarketingRequestModalProps {
    address: string
    setAddress: (value: string) => void
    driverNotes: string
    setDriverNotes: (value: string) => void
    termsAccepted: {
        correctInfo: boolean
        shippingCosts: boolean
        noRefunds: boolean
        deliveryDates: boolean
    }
    setTermsAccepted: (value: any) => void
    onSubmit: () => void
    onClose: () => void
    submitting: boolean
}

export default function MarketingRequestModal({
    address,
    setAddress,
    driverNotes,
    setDriverNotes,
    termsAccepted,
    setTermsAccepted,
    onSubmit,
    onClose,
    submitting
}: MarketingRequestModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-[#0F2137]">Solicitar Kit Impreso</h3>
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <XCircle className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100">
                        <p className="font-bold flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4" />
                            Información Importante
                        </p>
                        <p>Solicita el envío de tu Kit de Marketing impreso profesionalmente. El administrador revisará tu solicitud y te enviará una cotización de envío que deberás cubrir para procesar el pedido.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Dirección de Envío Completa</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Calle, Número, Colonia, Ciudad, Estado, Código Postal y Referencias..."
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F2137] outline-none min-h-[100px]"
                            />
                            <p className="text-xs text-gray-500">Asegúrate de que la dirección sea correcta. No nos hacemos responsables por errores en la dirección proporcionada.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Notas Adicionales (Opcional)</label>
                            <textarea
                                value={driverNotes}
                                onChange={(e) => setDriverNotes(e.target.value)}
                                placeholder="Horario de recepción, indicaciones especiales, etc."
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F2137] outline-none min-h-[80px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <p className="text-sm font-black text-[#0F2137] mb-2">Términos y Condiciones del Servicio</p>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${termsAccepted.correctInfo ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                {termsAccepted.correctInfo && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={termsAccepted.correctInfo} onChange={(e) => setTermsAccepted({ ...termsAccepted, correctInfo: e.target.checked })} />
                            <span className="text-xs text-gray-600 group-hover:text-gray-900">Confirmo que mi información de envío es 100% correcta y completa.</span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${termsAccepted.shippingCosts ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                {termsAccepted.shippingCosts && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={termsAccepted.shippingCosts} onChange={(e) => setTermsAccepted({ ...termsAccepted, shippingCosts: e.target.checked })} />
                            <span className="text-xs text-gray-600 group-hover:text-gray-900">Entiendo que el envío tiene un costo adicional que deberé cubrir antes de que se procese mi pedido. Se me notificará el costo y método de pago por este medio.</span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${termsAccepted.noRefunds ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                {termsAccepted.noRefunds && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={termsAccepted.noRefunds} onChange={(e) => setTermsAccepted({ ...termsAccepted, noRefunds: e.target.checked })} />
                            <span className="text-xs text-gray-600 group-hover:text-gray-900">Acepto que no hay cambios ni devoluciones una vez confirmada la solicitud.</span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${termsAccepted.deliveryDates ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                {termsAccepted.deliveryDates && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={termsAccepted.deliveryDates} onChange={(e) => setTermsAccepted({ ...termsAccepted, deliveryDates: e.target.checked })} />
                            <span className="text-xs text-gray-600 group-hover:text-gray-900">Me sujeto a las fechas de entrega estimadas por la paquetería y entiendo que pueden variar.</span>
                        </label>
                    </div>

                    <button
                        onClick={onSubmit}
                        disabled={submitting}
                        className="w-full py-4 bg-[#0F2137] text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Enviando Solicitud...' : 'Enviar Solicitud de Pedido'}
                    </button>
                </div>
            </div>
        </div>
    )
}
