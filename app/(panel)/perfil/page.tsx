'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    User,
    Car,
    CreditCard,
    Lock,
    Camera,
    Save,
    Plus,
    Trash2,
    Calendar,
    ChevronRight,
    BadgeCheck
} from 'lucide-react'

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('personal')
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [isDriver, setIsDriver] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [membership, setMembership] = useState<any>(null)
    const [saving, setSaving] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setUser(user)

            // Get Public Profile
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            setProfile(userData)
            setIsDriver(userData?.roles?.includes('driver'))

            if (userData?.roles?.includes('driver')) {
                // Get Driver Profile & Vehicles
                const { data: drvProfile } = await supabase
                    .from('driver_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (drvProfile) {
                    const { data: vhls } = await supabase
                        .from('vehicles')
                        .select('*')
                        .eq('driver_profile_id', drvProfile.id)
                    setVehicles(vhls || [])

                    // Get Membership
                    const { data: mb } = await supabase
                        .from('driver_memberships')
                        .select('*')
                        .eq('driver_profile_id', drvProfile.id)
                        .single()
                    setMembership(mb)
                }
            }

            setLoading(false)
        }
        loadData()
    }, [supabase])

    if (loading) return <div className="animate-pulse space-y-4">
        <div className="h-12 bg-white/5 rounded-2xl w-1/4" />
        <div className="h-[400px] bg-white/5 rounded-3xl" />
    </div>

    const tabs = [
        { id: 'personal', label: 'Datos Personales', icon: User },
        ...(isDriver ? [{ id: 'vehicles', label: 'Mi Vehículo', icon: Car }] : []),
        { id: 'payments', label: 'Pagos y Membresía', icon: CreditCard },
        { id: 'security', label: 'Seguridad', icon: Lock },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Configuración</h1>
                <p className="text-zinc-400">Gestiona tu información personal y preferencias de la cuenta.</p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                {activeTab === 'personal' && (
                    <div className="space-y-8 max-w-2xl">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-zinc-800 border-2 border-white/10 overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                            <User className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-lg text-white shadow-lg hover:bg-blue-700 transition-colors">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{profile?.full_name}</h3>
                                <p className="text-zinc-400 text-sm">{profile?.email}</p>
                                <div className="flex gap-2 mt-2">
                                    {profile?.roles?.map((role: string) => (
                                        <span key={role} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Nombre Completo</label>
                                <input
                                    type="text"
                                    defaultValue={profile?.full_name}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Teléfono</label>
                                <input
                                    type="text"
                                    defaultValue={profile?.phone_number}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                )}

                {activeTab === 'vehicles' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-xl">Mis Vehículos</h3>
                            <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                                <Plus className="h-4 w-4" />
                                Agregar Vehículo
                            </button>
                        </div>

                        {vehicles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {vehicles.map((v) => (
                                    <div key={v.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative group">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-blue-600/10 rounded-xl">
                                                <Car className="h-6 w-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{v.brand} {v.model}</h4>
                                                <p className="text-zinc-500 text-sm">{v.year} • {v.color}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-mono text-zinc-400">
                                                {v.plate_number || 'S-32D-FD'}
                                            </span>
                                        </div>
                                        <button className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 italic">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <Car className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-500">No tienes vehículos registrados todavía.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="space-y-8">
                        {isDriver && (
                            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <BadgeCheck className="h-32 w-32" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 bg-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">Membresía Activa</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Plan Driver Premium</h3>
                                    <p className="text-zinc-400 text-sm mb-6 max-w-md">Tu suscripción anual te permite aparecer en los resultados de búsqueda y recibir contactos directos.</p>

                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-400" />
                                            <span>Próximo cobro: 15 de Octubre, 2026</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">Historial de Transacciones</h3>
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Concepto</th>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4 text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium">Pago de Membresía Anual</td>
                                            <td className="px-6 py-4 text-zinc-500">15/01/2026</td>
                                            <td className="px-6 py-4 text-right font-bold">$49.99</td>
                                        </tr>
                                        {!isDriver && (
                                            <tr className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium">Desbloqueo de Conductor (Juan Pérez)</td>
                                                <td className="px-6 py-4 text-zinc-500">18/01/2026</td>
                                                <td className="px-6 py-4 text-right font-bold">$1.99</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-8 max-w-md">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Contraseña Actual</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Nueva Contraseña</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Confirmar Nueva Contraseña</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        </div>

                        <button className="w-full bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                            Cambiar Contraseña
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
