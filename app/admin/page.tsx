import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Car, DollarSign, Activity, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import RevenueChart from '@/app/components/admin/RevenueChart'
import ActivityChart from '@/app/components/admin/ActivityChart'
import DashboardTables from '@/app/components/admin/DashboardTables'

async function getDashboardData(view?: string) {
    const supabase = createAdminClient()

    // 1. Total Users
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })

    // 2. Active Drivers 
    const { count: activeDrivers } = await supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('status', 'active')

    // 3. Pending Approvals
    const { count: pendingDrivers } = await supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval')

    // 4. Monthly Revenue & Pending Payments
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: revenueData } = await supabase
        .from('unlocks')
        .select('amount_paid')
        .eq('status', 'completed')
        .gte('created_at', firstDayOfMonth)

    const monthlyRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.amount_paid), 0) || 0

    const { count: pendingPaymentsCount } = await supabase
        .from('pending_payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

    const estimatedPendingRevenue = (pendingPaymentsCount || 0) * 524

    // 5. Chart Data (Last 6 months)
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    // Revenue Chart Data
    const revenueChartData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        return { name: monthNames[d.getMonth()], month: d.getMonth(), year: d.getFullYear(), total: 0 }
    }).reverse()

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
        const dataPoint = revenueChartData.find(d => d.month === revDate.getMonth() && d.year === revDate.getFullYear())
        if (dataPoint) dataPoint.total += Number(rev.amount_paid)
    })

    // Activity Chart Data
    const activityChartData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        return { name: monthNames[d.getMonth()], month: d.getMonth(), year: d.getFullYear(), users: 0, drivers: 0 }
    }).reverse()

    const { data: recentUsersForChart } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())

    recentUsersForChart?.forEach(u => {
        const date = new Date(u.created_at)
        const dataPoint = activityChartData.find(d => d.month === date.getMonth() && d.year === date.getFullYear())
        if (dataPoint) dataPoint.users += 1
    })

    const { data: recentDriversForChart } = await supabase
        .from('driver_profiles')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())

    recentDriversForChart?.forEach(d => {
        const date = new Date(d.created_at)
        const dataPoint = activityChartData.find(dp => dp.month === date.getMonth() && dp.year === date.getFullYear())
        if (dataPoint) dataPoint.drivers += 1
    })

    // 6. Conditional View Data fetching
    let viewData = []
    if (view === 'active_drivers') {
        const { data } = await supabase.from('driver_profiles').select('*, users(full_name, email, phone_number)').eq('status', 'active').limit(50).order('created_at', { ascending: false })
        viewData = data || []
    } else if (view === 'pending_drivers') {
        const { data } = await supabase.from('driver_profiles').select('*, users(full_name, email, phone_number)').eq('status', 'pending_approval').limit(50).order('created_at', { ascending: false })
        viewData = data || []
    } else if (view === 'pending_payments') {
        const { data } = await supabase.from('pending_payments').select('*, users(full_name, email, phone_number)').eq('status', 'open').limit(50).order('created_at', { ascending: false })
        viewData = data || []
    } else if (view === 'recent_users') {
        const { data } = await supabase.from('users').select('*, driver_profiles(status)').limit(15).order('created_at', { ascending: false })
        viewData = data || []
    }

    return {
        totalUsers: totalUsers || 0,
        activeDrivers: activeDrivers || 0,
        pendingDrivers: pendingDrivers || 0,
        monthlyRevenue,
        pendingPaymentsCount: pendingPaymentsCount || 0,
        estimatedPendingRevenue,
        revenueChartData,
        activityChartData,
        viewData
    }
}

export default async function AdminDashboard({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const view = params.view as string | undefined

    const stats = await getDashboardData(view)

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Dashboard Operativo</h1>
                    <p className="text-zinc-400 text-lg">Resumen general y control de la plataforma AvivaGo en tiempo real.</p>
                </div>
                {view && (
                    <Link href="/admin" className="text-sm font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/5">
                        Limpiar Vista
                    </Link>
                )}
            </div>

            {/* KPI Grid - Interactive */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Users KPI */}
                <Link href="/admin?view=recent_users" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'recent_users' ? 'bg-blue-500/10 border-blue-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'recent_users' ? 'bg-blue-500/20 border-blue-400/30' : 'bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20'}`}>
                            <Users className="h-7 w-7 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Usuarios Registrados</p>
                            <p className="text-3xl font-black text-white tracking-tight">{stats.totalUsers}</p>
                        </div>
                    </div>
                </Link>

                {/* Active Drivers KPI */}
                <Link href="/admin?view=active_drivers" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'active_drivers' ? 'bg-emerald-500/10 border-emerald-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'active_drivers' ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20'}`}>
                            <Car className="h-7 w-7 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Conductores Activos</p>
                            <p className="text-3xl font-black text-white tracking-tight">{stats.activeDrivers}</p>
                        </div>
                    </div>
                </Link>

                {/* Revenue & Pending Payments KPI */}
                <Link href="/admin?view=pending_payments" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'pending_payments' ? 'bg-purple-500/10 border-purple-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className={`absolute inset-0 transition-opacity ${stats.pendingPaymentsCount > 0 && view !== 'pending_payments' ? 'bg-purple-500/5 opacity-100' : 'opacity-0'}`} />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'pending_payments' ? 'bg-purple-500/20 border-purple-400/30' : 'bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20'}`}>
                            <DollarSign className="h-7 w-7 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Ingresos Mensuales</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-white tracking-tight">
                                    ${stats.monthlyRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            {stats.pendingPaymentsCount > 0 && (
                                <p className="text-[11px] text-zinc-500 font-medium mt-1">
                                    <span className="text-purple-400 font-bold">{stats.pendingPaymentsCount}</span> pendientes (~${stats.estimatedPendingRevenue})
                                </p>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Pending Approvals KPI */}
                <Link href="/admin?view=pending_drivers" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'pending_drivers' ? 'bg-orange-500/10 border-orange-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className={`absolute inset-0 transition-opacity ${stats.pendingDrivers > 0 && view !== 'pending_drivers' ? 'bg-orange-500/5 opacity-100' : 'opacity-0'}`} />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'pending_drivers' ? 'bg-orange-500/20 border-orange-400/30' : 'bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500/20'}`}>
                            <AlertTriangle className="h-7 w-7 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Req. Aprobación</p>
                            <p className="text-3xl font-black text-white tracking-tight">{stats.pendingDrivers}</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Drill-down conditional rendering */}
            {view && (
                <div className="mt-8">
                    <DashboardTables view={view} data={stats.viewData} />
                </div>
            )}

            {/* Charts Section */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-500 ${view ? 'opacity-80 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                {/* Activity Chart */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="mb-6 flex justify-between items-center relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Crecimiento de Red</h3>
                            <p className="text-sm text-zinc-500 mt-1">Nuevos usuarios y conductores diarios</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-emerald-400">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <ActivityChart data={stats.activityChartData} />
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="mb-6 flex justify-between items-center relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Ingresos Mensuales</h3>
                            <p className="text-sm text-zinc-500 mt-1">Histórico de últimos 6 meses</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-purple-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <RevenueChart data={stats.revenueChartData} />
                    </div>
                </div>
            </div>
        </div>
    )
}
