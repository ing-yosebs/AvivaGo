'use client'

import {
    Users,
    TrendingUp,
    Star,
    Unlock,
    Calendar,
    Settings,
    MessageSquare,
    Eye,
    ChevronRight,
    Rocket,
    User,
    Heart,
    Car,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

import { useDashboardData } from './hooks/useDashboardData'
import { StatCard } from './components/StatCard'
import { ActivityItem } from './components/ActivityItem'
import { DriverProfileCard } from './components/DriverProfileCard'

export default function Dashboard() {
    const { user, isDriver, stats, activities, loading, driverProfileId } = useDashboardData()

    if (loading) {
        return <div className="p-8 text-center text-zinc-400">Cargando panel...</div>
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isDriver ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {isDriver ? 'Perfil Conductor Activo' : 'Perfil Pasajero'}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                    Hola {user?.user_metadata?.full_name?.split(' ')[0] || (isDriver ? 'Conductor' : 'Pasajero')}
                </h1>
                <p className="text-lg text-gray-500 font-medium">
                    Aquí está el resumen de tu actividad de hoy.
                </p>
            </div>

            {/* Driver Profile Link Component */}
            {isDriver && driverProfileId && (
                <DriverProfileCard driverProfileId={driverProfileId} />
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isDriver ? (
                    <>
                        <StatCard icon={<Eye className="h-5 w-5 text-blue-500" />} label="Visualizaciones" value={stats.views} />
                        <StatCard icon={<Unlock className="h-5 w-5 text-purple-500" />} label="Mis pasajeros" value={stats.unlocks} />
                        <StatCard icon={<Star className="h-5 w-5 text-yellow-500" />} label="Calificación Media" value={stats.rating.toFixed(1)} />
                        <StatCard icon={<Calendar className="h-5 w-5 text-green-500" />} label="Días Activo" value={stats.active_days} />
                    </>
                ) : (
                    <>
                        <StatCard icon={<Heart className="h-5 w-5 text-red-500" />} label="Conductores Favoritos" value={stats.favorites} />
                        <StatCard icon={<Car className="h-5 w-5 text-purple-500" />} label="Mis conductores" value={stats.unlocks || 0} />
                        <StatCard icon={<Star className="h-5 w-5 text-yellow-500" />} label="Calificación Promedio" value={stats.rating.toFixed(1)} />
                        <StatCard icon={<Rocket className="h-5 w-5 text-green-500" />} label="Días Activo" value={stats.active_days} />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white shadow-soft rounded-3xl p-8 border border-gray-100">
                        <h3 className="text-xl font-bold mb-6">Actividad Reciente</h3>
                        <div className="space-y-6">
                            {activities.length > 0 ? (
                                activities.map((activity, index) => (
                                    <ActivityItem
                                        key={index}
                                        icon={activity.icon}
                                        text={activity.text}
                                        time={formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: es })}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-400">No hay actividad reciente.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuickLink({ icon, text, href }: any) {
    return (
        <Link href={href || "#"} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-500 hover:text-[#0F2137] group">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm">{text}</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
        </Link>
    )
}
