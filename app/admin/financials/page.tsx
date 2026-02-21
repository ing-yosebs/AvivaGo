import { createAdminClient } from '@/lib/supabase/admin'
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
    const supabase = createAdminClient()

    // 1. Fetch completed payments from 'unlocks'
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: monthlyRevenueData } = await supabase
        .from('unlocks')
        .select(`
            id,
            amount_paid,
            status,
            created_at,
            users (
                full_name
            )
        `)
        .eq('status', 'completed')
        .gte('created_at', firstDayOfMonth)
        .order('created_at', { ascending: false })

    const monthlyRevenue = monthlyRevenueData?.reduce((acc, curr) => acc + Number(curr.amount_paid), 0) || 0

    // 2. Fetch pending payments
    const { data: pendingPayments, count: pendingCount } = await supabase
        .from('pending_payments')
        .select(`
            *,
            users (
                full_name
            )
        `, { count: 'exact' })
        .eq('status', 'open')
        .order('created_at', { ascending: false })

    const estimatedPendingRevenue = (pendingCount || 0) * 524

    // 3. Count active memberships
    const { count: activeMemberships } = await supabase
        .from('driver_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

    // Combine for display in the table
    const recentActivity = [
        ...(monthlyRevenueData || []).map(r => ({ ...r, type: 'Membresía (Pagada)', amount: r.amount_paid, displayStatus: 'Completado' })),
        ...(pendingPayments || []).map(p => ({ ...p, type: 'Membresía (Pendiente)', amount: 524, displayStatus: 'Abierto' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 4. Aggregate Chart Data (Last 6 months)
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const dynamicMonthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const m = d.getMonth()
        const y = d.getFullYear()
        return { name: monthNames[m], month: m, year: y, total: 0 }
    }).reverse()

    // Fetch historical data for chart
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)

    const { data: historicalRevenue } = await supabase
        .from('unlocks')
        .select('amount_paid, created_at')
        .eq('status', 'completed')
        .gte('created_at', sixMonthsAgo.toISOString())

    historicalRevenue?.forEach(rev => {
        const revDate = new Date(rev.created_at)
        const revMonth = revDate.getMonth()
        const revYear = revDate.getFullYear()
        const dataPoint = dynamicMonthlyData.find(d => d.month === revMonth && d.year === revYear)
        if (dataPoint) {
            dataPoint.total += Number(rev.amount_paid)
        }
    })

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
                            <span className="text-3xl font-bold text-white">${monthlyRevenue.toFixed(2)}</span>
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +100%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col">
                        <span className="text-zinc-400 text-sm font-medium mb-1">Membresías Activas</span>
                        <span className="text-3xl font-bold text-white">{activeMemberships || 0}</span>
                    </div>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-500/5 transition-opacity opacity-100" />
                    <div className="flex flex-col relative z-10">
                        <span className="text-zinc-400 text-sm font-medium mb-1">Pendiente de Pago</span>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-white">${estimatedPendingRevenue.toFixed(2)}</span>
                            <span className="text-[10px] text-zinc-500 font-medium">({pendingCount} sesiones)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-6">Tendencia de Ingresos</h3>
                    <RevenueChart data={dynamicMonthlyData} />
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
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((item: any) => (
                                        <tr key={item.id} className="group">
                                            <td className="py-3 pr-4 text-white">
                                                {item.users?.full_name || 'Desconocido'}
                                            </td>
                                            <td className="py-3 pr-4 text-zinc-400">
                                                {item.type}
                                            </td>
                                            <td className={`py-3 pr-4 font-medium ${item.displayStatus === 'Completado' ? 'text-emerald-400' : 'text-purple-400'}`}>
                                                ${Number(item.amount).toFixed(2)}
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${item.displayStatus === 'Completado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    }`}>
                                                    {item.displayStatus}
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
