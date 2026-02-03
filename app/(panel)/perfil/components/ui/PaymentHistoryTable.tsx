import { Star, CheckCircle } from 'lucide-react'

interface PaymentHistoryTableProps {
    isDriver: boolean
    unlocks: any[]
    onRate: (driverId: string, driverName: string) => void
}

export default function PaymentHistoryTable({ isDriver, unlocks, onRate }: PaymentHistoryTableProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-soft">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
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
                <tbody className="divide-y divide-gray-100">
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
                                                    onClick={() => onRate(item.driver_profile_id, item.driver_profiles?.users?.full_name || 'Conductor')}
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
    )
}
