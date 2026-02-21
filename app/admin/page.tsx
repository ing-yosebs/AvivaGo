
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { Users, Car, DollarSign, Activity, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
    const supabase = createAdminClient()

    // 1. Total Users
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })

    // 2. Total Drivers
    const { count: totalDrivers } = await supabase.from('driver_profiles').select('*', { count: 'exact', head: true })

    // 3. Active Drivers 
    const { count: activeDrivers } = await supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('status', 'active')

    // 4. Pending Approvals
    const { count: pendingDrivers } = await supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval')

    // 5. Monthly Revenue (Completed in current month)
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: revenueData } = await supabase
        .from('unlocks')
        .select('amount_paid')
        .eq('status', 'completed')
        .gte('created_at', firstDayOfMonth)

    const monthlyRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.amount_paid), 0) || 0

    // 6. Pending Payments (Open sessions for memberships)
    const { count: pendingPaymentsCount } = await supabase
        .from('pending_payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

    // Estimate pending revenue (using fallback of 524 for now)
    const estimatedPendingRevenue = (pendingPaymentsCount || 0) * 524

    return {
        totalUsers: totalUsers || 0,
        totalDrivers: totalDrivers || 0,
        activeDrivers: activeDrivers || 0,
        pendingDrivers: pendingDrivers || 0,
        monthlyRevenue,
        pendingPaymentsCount: pendingPaymentsCount || 0,
        estimatedPendingRevenue
    }
}

export default async function AdminDashboard() {
    const stats = await getStats()

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
                <p className="text-zinc-400">Resumen general de la plataforma AvivaGo.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Total Users */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Users className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Usuarios Totales</p>
                            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>

                {/* Active Drivers */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Car className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Conductores Activos</p>
                            <p className="text-2xl font-bold text-white">{stats.activeDrivers}</p>
                        </div>
                    </div>
                </div>

                {/* Revenue */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className={`absolute inset-0 bg-purple-500/5 transition-opacity ${stats.pendingPaymentsCount > 0 ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <DollarSign className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Ingresos Mensuales</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-white">
                                    ${stats.monthlyRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            {stats.pendingPaymentsCount > 0 && (
                                <p className="text-[10px] text-zinc-500 font-medium mt-1">
                                    <span className="text-purple-400">{stats.pendingPaymentsCount}</span> pagos pendientes (~${stats.estimatedPendingRevenue})
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className={`absolute inset-0 bg-orange-500/5 transition-opacity ${stats.pendingDrivers > 0 ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <AlertTriangle className="h-6 w-6 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Pendientes Aprobación</p>
                            <p className="text-2xl font-bold text-white">{stats.pendingDrivers}</p>
                        </div>
                    </div>
                    {stats.pendingDrivers > 0 && (
                        <Link href="/admin/users?filter=pending" className="absolute inset-0 z-20 focus:outline-none" />
                    )}
                </div>
            </div>

            {/* Charts Section Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl min-h-[300px] flex flex-col justify-center items-center text-zinc-500">
                    <Activity className="h-10 w-10 mb-2 opacity-50" />
                    <p>Gráfica de Actividad (Próximamente)</p>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl min-h-[300px] flex flex-col justify-center items-center text-zinc-500">
                    <DollarSign className="h-10 w-10 mb-2 opacity-50" />
                    <p>Gráfica de Ingresos (Próximamente)</p>
                </div>
            </div>
        </div>
    )
}
