import React from 'react'
import { DollarSign } from 'lucide-react'
import { type AdminMarketingRequest } from '@/app/actions/user-requests'

interface MarketingRequestEditModalProps {
    request: AdminMarketingRequest | null
    onClose: () => void
    onUpdate: () => void
    newStatus: string
    setNewStatus: (val: string) => void
    shippingCost: string
    setShippingCost: (val: string) => void
    adminNotes: string
    setAdminNotes: (val: string) => void
    updating: boolean
}

export default function MarketingRequestEditModal({
    request,
    onClose,
    onUpdate,
    newStatus,
    setNewStatus,
    shippingCost,
    setShippingCost,
    adminNotes,
    setAdminNotes,
    updating
}: MarketingRequestEditModalProps) {
    if (!request) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-black text-[#0F2137]">Gestionar Solicitud</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2 border border-gray-100">
                        <p><strong className="text-gray-900">Conductor:</strong> {request.driver_profiles.users.full_name}</p>
                        <p><strong className="text-gray-900">Dirección:</strong></p>
                        <p className="text-gray-600 bg-white p-2 rounded border border-gray-200">{request.shipping_address}</p>
                        {request.driver_notes && (
                            <>
                                <p><strong className="text-gray-900">Notas del Conductor:</strong></p>
                                <p className="text-gray-600 italic">"{request.driver_notes}"</p>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Estado</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F2137] outline-none text-sm font-medium"
                            >
                                <option value="pending_quote">Pendiente de Cotización</option>
                                <option value="quote_sent">Cotización Enviada</option>
                                <option value="paid">Pagado</option>
                                <option value="processing">En Proceso</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Costo de Envío (MXN)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={shippingCost}
                                    onChange={(e) => setShippingCost(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F2137] outline-none text-sm font-medium"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Ingresa el costo total que el conductor debe pagar.</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Notas para el Conductor</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Instrucciones de pago, número de guía, etc."
                                rows={3}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F2137] outline-none text-sm"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Este mensaje será visible para el conductor en su panel.</p>
                        </div>
                    </div>

                    <button
                        onClick={onUpdate}
                        disabled={updating}
                        className="w-full py-4 bg-[#0F2137] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg disabled:opacity-50"
                    >
                        {updating ? 'Guardando...' : 'Actualizar Solicitud'}
                    </button>
                </div>
            </div>
        </div>
    )
}
