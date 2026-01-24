
import { createClient } from '@/lib/supabase/server'
import RevenueChart from '@/app/components/admin/RevenueChart'
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react'

// Mock Data (Replace with DB aggregation later)
const monthlyData = [
    { name: 'Ene', total: 0 },
    { name: 'Feb', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Abr', total: 0 },
    { name: 'May', total: 0 },
    { name: 'Jun', total: 0 },
]

export default async function FinancialsPage() {
    const supabase = await createClient()

    // Fetch transactions (limit to recent)
    const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select(`
            id,
            amount,
            transaction_type,
            status,
            created_at,
            wallets (
                user_id,
                users (
                    full_name
                )
            )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

    // Calculate total revenue (example logic based on available data)
    // Real logic would sum 'commission_activation' type transactions where status = 'paid'
    const totalRevenue = transactions?.reduce((acc, tx) => {
        // Just an example assumption
        if (tx.status === 'paid' || tx.status === 'available') return acc + Number(tx.amount);
        return acc;
    }, 0) || 0

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Finanzas</h1>
                <p className="text-zinc-400">Monitoreo de ingresos y transacciones.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col">
                        <span className="text-zinc-400 text-sm font-medium mb-1">Ingresos Totales (Mes)</span>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</span>
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +0%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col">
                        <span className="text-zinc-400 text-sm font-medium mb-1">Membresías Activas</span>
                        <span className="text-3xl font-bold text-white">0</span>
                    </div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col">
                        <span className="text-zinc-400 text-sm font-medium mb-1">Pendiente de Pago</span>
                        <span className="text-3xl font-bold text-white">$0.00</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-6">Tendencia de Ingresos</h3>
                    <RevenueChart data={monthlyData} />
                </div>

                {/* Recent Transactions */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-6">Transacciones Recientes</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-zinc-400 font-medium">
                                <tr>
                                    <th className="pb-3 pr-4">Usuario</th>
                                    <th className="pb-3 pr-4">Tipo</th>
                                    <th className="pb-3 pr-4">Monto</th>
                                    <th className="pb-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions && transactions.length > 0 ? (
                                    transactions.map(tx => (
                                        <tr key={tx.id} className="group">
                                            <td className="py-3 pr-4 text-white">
                                                {/* @ts-ignore - Supabase types join handling */}
                                                {tx.wallets?.users?.full_name || 'Desconocido'}
                                            </td>
                                            <td className="py-3 pr-4 text-zinc-400 capitalize">
                                                {tx.transaction_type?.replace('_', ' ')}
                                            </td>
                                            <td className={`py-3 pr-4 font-medium ${Number(tx.amount) > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                                ${Number(tx.amount).toFixed(2)}
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${tx.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-zinc-500">
                                            No hay transacciones registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
