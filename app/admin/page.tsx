
import { createClient } from '@/lib/supabase/server'
import { Users, Car, DollarSign, Activity, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
    const supabase = await createClient()

    // 1. Total Users
    // Note: auth.users is not directly accessible via standard client usually unless service role. 
    // We will count public.users instead which mirrors auth.users ideally.
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })

    // 2. Total Drivers
    const { count: totalDrivers } = await supabase.from('driver_profiles').select('*', { count: 'exact', head: true })

    // 3. Active Drivers
    const { count: activeDrivers } = await supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('status', 'active')

    // 4. Pending Approvals
    const { count: pendingDrivers } = await supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval')

    return {
        totalUsers: totalUsers || 0,
        totalDrivers: totalDrivers || 0,
        activeDrivers: activeDrivers || 0,
        pendingDrivers: pendingDrivers || 0
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

                {/* Revenue (Mocked for now) */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <DollarSign className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Ingresos Mensuales</p>
                            <p className="text-2xl font-bold text-white">$0.00</p>
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
