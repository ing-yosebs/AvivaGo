
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Filter, MoreHorizontal, Shield, Car, User, Settings } from 'lucide-react'

// Helper to get status color
const getStatusColor = (status: string | undefined) => {
    switch (status) {
        case 'unconfirmed': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'; // Validado (Driver) or Profile Complete (User)
        case 'validated': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'pending_approval': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        case 'suspended': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'rejected': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'incomplete': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
}

// Helper to translate status
const translateStatus = (status: string | undefined) => {
    switch (status) {
        case 'unconfirmed': return 'Email Pendiente';
        case 'active': return 'Validado';
        case 'validated': return 'Validado';
        case 'pending_approval': return 'En Revisión';
        case 'suspended': return 'Suspendido';
        case 'rejected': return 'Rechazado';
        case 'draft': return 'Borrador';
        case 'hidden': return 'Oculto';
        case 'incomplete': return 'Activo'; // Profile incomplete but email confirmed
        default: return 'Usuario';
    }
}

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const filter = params.filter as string | undefined
    const search = params.search as string | undefined

    const supabase = await createClient()

    let query = supabase
        .from('users')
        .select(`
            id,
            full_name,
            full_name,
            email,
            phone_number,
            roles,
            created_at,
            email_confirmed_at,
            driver_profiles (
                status,
                city,
                is_visible
            )
        `)
        .order('created_at', { ascending: false })

    // Apply Search
    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply Role Filter (simple implementation)
    // Note: complex filtering on jsonb array 'roles' might need diferent syntax depending on structure
    // For now we check if driver_profile exists for 'driver' filter
    if (filter === 'drivers') {
        query = query.not('driver_profiles', 'is', null)
    } else if (filter === 'pending') {
        // This is a bit tricky with inner join logic in Supabase JS basic select, 
        // so we might filter in memory or improve query if dataset is huge.
        // For MVP, let's just fetch and filter or use !inner if we want Strict Database Filtering
        // But let's try to map it first.
        query = query.not('driver_profiles', 'is', null)
    }

    const { data: users, error } = await query

    // Client-side refinement for complex filters if needed (e.g. pending status which is deep in relation)
    const filteredUsers = users?.filter(user => {
        if (filter === 'pending') {
            const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles
            return driverProfile?.status === 'pending_approval'
        }
        if (filter === 'unconfirmed') {
            return !user.email_confirmed_at
        }
        return true
    }) || []


    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Header Section */}
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
                    Gestión de Usuarios
                </h1>
                <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                    Panel central para el control de identidad y estados de actividad de conductores y pasajeros en la plataforma AvivaGo.
                </p>
            </div>

            {/* 2. Controls Section (Search & Filter) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        name="search"
                        placeholder="Buscar por nombre o correo electrónico..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                        defaultValue={search}
                    />
                </div>

                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-[1.25rem] p-1.5 backdrop-blur-md">
                    {[
                        { id: null, label: 'Todos', filter: null },
                        { id: 'drivers', label: 'Conductores', filter: 'drivers' },
                        { id: 'pending', label: 'Pendientes', filter: 'pending' },
                        { id: 'unconfirmed', label: 'Sin Validar', filter: 'unconfirmed' },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.id ? `/admin/users?filter=${item.filter}` : '/admin/users'}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider ${(item.filter === filter) || (!item.filter && !filter)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* 3. Data Section (Table) */}
            <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Nombre</th>
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Perfil</th>
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Estado</th>
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Registro</th>
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right">Administrar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 relative z-10">
                            {filteredUsers.map((user) => {
                                const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles
                                const roles = user.roles || []
                                const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin'
                                const isDriver = !!driverProfile || (Array.isArray(roles) ? roles.includes('driver') : roles === 'driver')

                                return (
                                    <tr key={user.id} className="hover:bg-white/5 transition-all group">
                                        <td className="px-4 py-6">
                                            <div className="flex flex-col">
                                                <p className="font-bold text-white text-sm leading-tight mb-0.5">{user.full_name || 'Sin Nombre'}</p>
                                                <p className="text-zinc-500 text-[11px] font-mono">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex items-center">
                                                {isAdmin ? (
                                                    <span className="inline-flex items-center justify-center p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm" title="Admin">
                                                        <Shield className="h-4 w-4" />
                                                    </span>
                                                ) : isDriver ? (
                                                    <span className="inline-flex items-center justify-center p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm" title="Conductor">
                                                        <Car className="h-4 w-4" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm" title="Pasajero">
                                                        <User className="h-4 w-4" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            {!user.email_confirmed_at ? (
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border animate-pulse-subtle ${getStatusColor('unconfirmed')}`}>
                                                    {translateStatus('unconfirmed')}
                                                </span>
                                            ) : isDriver ? (
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${getStatusColor(driverProfile?.status)}`}>
                                                    {translateStatus(driverProfile?.status)}
                                                </span>
                                            ) : ( // Passenger Logic
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${getStatusColor((user.full_name && user.phone_number) ? 'validated' : 'incomplete')}`}>
                                                    {translateStatus((user.full_name && user.phone_number) ? 'validated' : 'incomplete')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-300 font-medium text-sm">
                                                    {new Date(user.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-right">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg active:scale-95 group/btn"
                                                title="Gestionar Usuario"
                                            >
                                                <Settings className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-500" />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                                <Search className="h-6 w-6 text-zinc-700" />
                                            </div>
                                            <p className="text-zinc-500 font-medium">No se encontraron resultados para tu búsqueda.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
