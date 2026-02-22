import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import RevenueChart from '@/app/components/admin/RevenueChart'
import { DollarSign, TrendingUp, CreditCard, Clock, AlertCircle } from 'lucide-react'
import { formatDateMX, formatTimeMX } from '@/lib/dateUtils'

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

    // 2. Fetch pending payments (sessions with 'open', 'expired', 'failed' status)
    const { data: rawPendingPayments } = await supabase
        .from('pending_payments')
        .select(`
            *,
            users (
                full_name
            )
        `)
        .in('status', ['open', 'expired', 'failed'])
        .order('created_at', { ascending: false })

    const rawPendingList = rawPendingPayments || []

    // Filter open payments for the pending revenue calculation
    const openPayments = rawPendingList.filter(p => p.status === 'open')
    const openUserIds = [...new Set(openPayments.map(p => p.user_id))]

    // Filter out users who already have a successful payment in 'unlocks'
    let paidUserIds: string[] = []
    if (openUserIds.length > 0) {
        const { data: completedUnlocks } = await supabase
            .from('unlocks')
            .select('user_id')
            .eq('status', 'completed')
            .in('user_id', openUserIds)
        paidUserIds = (completedUnlocks || []).map(u => u.user_id)
    }

    // Truly pending: Have an open session AND have not completed any payment
    const filteredOpenPayments = openPayments.filter(p => !paidUserIds.includes(p.user_id))
    const uniquePendingUsersCount = new Set(filteredOpenPayments.map(p => p.user_id)).size
    const estimatedPendingRevenue = uniquePendingUsersCount * 524

    // 3. Count active memberships
    const { count: activeMemberships } = await supabase
        .from('driver_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

    // Combine for display in the table (Show ALL activity as before)
    const recentActivity = [
        ...(monthlyRevenueData || []).map(r => ({
            ...r,
            type: 'Membresía (Pagada)',
            amount: r.amount_paid,
            displayStatus: 'Completado',
            payment_method: 'N/A',
            failure_reason: null,
            date: r.created_at
        })),
        ...rawPendingList.map(p => {
            let displayStatus = 'Abierto'
            if (p.status === 'expired') displayStatus = 'Expirado'
            if (p.status === 'failed') displayStatus = 'Fallido'
            return {
                ...p,
                type: 'Membresía (Intento)',
                amount: 524,
                displayStatus,
                date: p.last_attempt_at || p.created_at
            }
        })
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white m-0">
                        Finanzas
                    </h1>
                    <p className="text-zinc-300 text-lg max-w-2xl leading-relaxed">
                        Monitoreo de ingresos, suscripciones y transacciones operativas.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-[2rem] backdrop-blur-xl min-w-[240px]">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Corte Mensual</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-white font-mono font-bold text-2xl leading-none">${monthlyRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="shrink-0 h-16 w-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Ingresos Totales (Mes)</span>
                            <div className="flex items-baseline gap-3">
                                <h2 className="text-4xl font-extrabold text-white">${monthlyRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h2>
                                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                    +100%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="shrink-0 h-16 w-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <CreditCard className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Membresías Activas</span>
                            <h2 className="text-4xl font-extrabold text-white">{activeMemberships || 0}</h2>
                        </div>
                    </div>
                </div>

                <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="shrink-0 h-16 w-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Clock className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Pendiente de Pago</span>
                            <div className="flex items-baseline gap-3">
                                <h2 className="text-4xl font-extrabold text-white">${estimatedPendingRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h2>
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">({uniquePendingUsersCount} usuarios)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Detailed Data Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Chart */}
                <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
                    <h3 className="text-xl font-bold mb-8 text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Tendencia de Ingresos
                    </h3>
                    <div className="w-full">
                        <RevenueChart data={dynamicMonthlyData} />
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative h-full">
                    <div className="p-8">
                        <h3 className="text-xl font-bold mb-6 text-white">Transacciones Recientes</h3>
                        <div className="w-full">
                            <table className="w-full text-left border-separate border-spacing-y-2">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-4">Fecha</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-4">Usuario</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-4">Método</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-4">Monto</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-4">Estado / Motivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((item: any) => (
                                            <tr key={item.id} className="group hover:bg-white/[0.03] transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-zinc-300 font-medium text-[11px] lg:text-sm leading-tight">
                                                            {formatDateMX(item.date)}
                                                        </span>
                                                        <span className="text-zinc-500 font-medium text-[11px] lg:text-sm leading-tight">
                                                            {formatTimeMX(item.date)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="font-bold text-white text-sm block">
                                                        {item.users?.full_name || 'Desconocido'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-zinc-300 text-[11px] font-medium uppercase tracking-tight">
                                                        {item.payment_method === 'card' ? 'Tarjeta'
                                                            : item.payment_method === 'oxxo' ? 'Efectivo (OXXO)'
                                                                : item.payment_method === 'customer_balance' ? 'Transferencia'
                                                                    : item.payment_method && item.payment_method !== 'N/A' ? item.payment_method
                                                                        : 'No registrado'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-sm font-black ${item.displayStatus === 'Completado' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                                        ${Number(item.amount).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 max-w-xs">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${item.displayStatus === 'Completado'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm'
                                                            : item.displayStatus === 'Expirado'
                                                                ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 shadow-sm'
                                                                : item.displayStatus === 'Fallido'
                                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-sm'
                                                                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-sm'
                                                            }`}>
                                                            {item.displayStatus}
                                                        </span>
                                                        {item.failure_reason && (
                                                            <span className="text-xs text-red-400 mt-1 flex items-start gap-1">
                                                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                                                {item.failure_reason}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                                        <CreditCard className="h-5 w-5 text-zinc-700" />
                                                    </div>
                                                    <p className="text-zinc-500 text-sm font-medium">No hay transacciones registradas.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
