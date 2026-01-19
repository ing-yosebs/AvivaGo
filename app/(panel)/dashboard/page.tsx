'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
    User
} from 'lucide-react'

export default function DriverDashboard() {
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState({
        views: 128,
        unlocks: 12,
        rating: 4.9,
        active_days: 14
    })

    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        checkUser()
    }, [supabase])

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20">
                        Perfil Activo
                    </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Panel de Control
                </h1>
                <p className="text-zinc-400">
                    Hola {user?.user_metadata?.full_name || 'Conductor'}, aquí está el resumen de tu actividad.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Eye className="h-5 w-5 text-blue-500" />} label="Visualizaciones" value={stats.views} change="+12%" />
                <StatCard icon={<Unlock className="h-5 w-5 text-purple-500" />} label="Contactos Desbloqueados" value={stats.unlocks} change="+2" />
                <StatCard icon={<Star className="h-5 w-5 text-yellow-500" />} label="Calificación Media" value={stats.rating} />
                <StatCard icon={<Calendar className="h-5 w-5 text-green-500" />} label="Días en Prueba" value={stats.active_days} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                        <h3 className="text-xl font-bold mb-6">Actividad Reciente</h3>
                        <div className="space-y-6">
                            <ActivityItem
                                icon={<Users className="h-4 w-4" />}
                                text="Un cliente de Santa Tecla visualizó tu perfil"
                                time="Hace 2 horas"
                            />
                            <ActivityItem
                                icon={<Unlock className="h-4 w-4 text-purple-400" />}
                                text="Alguien desbloqueó tu número de WhatsApp"
                                time="Ayer, 4:30 PM"
                            />
                            <ActivityItem
                                icon={<Rocket className="h-4 w-4 text-white" />}
                                text="Tu perfil ha sido verificado satisfactoriamente"
                                time="Hace 2 días"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="font-bold mb-4">Membresía Trial</h3>
                        <div className="space-y-4">
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[14%]" />
                            </div>
                            <p className="text-sm text-zinc-400">
                                Quedan 12 días de tu periodo de prueba gratuito.
                            </p>
                            <button className="w-full py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                                Ver Planes Premium
                            </button>
                        </div>
                    </div>

                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="font-bold mb-4">Accesos Rápidos</h3>
                        <div className="space-y-3">
                            <QuickLink icon={<User className="h-4 w-4" />} text="Ver mi Perfil Público" />
                            <QuickLink icon={<Settings className="h-4 w-4" />} text="Configuración" />
                            <QuickLink icon={<MessageSquare className="h-4 w-4" />} text="Soporte Técnico" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, change }: any) {
    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-default">
            <div className="flex items-start justify-between mb-4">
                <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                    {icon}
                </div>
                {change && (
                    <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full">
                        {change}
                    </span>
                )}
            </div>
            <div>
                <p className="text-zinc-500 text-sm mb-1">{label}</p>
                <h4 className="text-2xl font-bold">{value}</h4>
            </div>
        </div>
    )
}

function ActivityItem({ icon, text, time }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-zinc-400">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-zinc-200">{text}</p>
                <p className="text-xs text-zinc-600">{time}</p>
            </div>
        </div>
    )
}

function QuickLink({ icon, text }: any) {
    return (
        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white group">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm">{text}</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    )
}
