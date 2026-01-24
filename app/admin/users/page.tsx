
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Filter, MoreHorizontal, Shield, Car, User } from 'lucide-react'

// Helper to get status color
const getStatusColor = (status: string | undefined) => {
    switch (status) {
        case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'pending_approval': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        case 'suspended': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
}

// Helper to translate status
const translateStatus = (status: string | undefined) => {
    switch (status) {
        case 'active': return 'Activo';
        case 'pending_approval': return 'Pendiente';
        case 'suspended': return 'Suspendido';
        case 'draft': return 'Borrador';
        case 'hidden': return 'Oculto';
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
            email,
            roles,
            created_at,
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
        return true
    }) || []


    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Gestión de Usuarios</h1>
                    <p className="text-zinc-400">Administra conductores y pasajeros de la plataforma.</p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <form className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            name="search"
                            placeholder="Buscar por nombre o correo..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full sm:w-64"
                            defaultValue={search}
                        />
                    </form>
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                        <Link
                            href="/admin/users"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filter ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Todos
                        </Link>
                        <Link
                            href="/admin/users?filter=drivers"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'drivers' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Conductores
                        </Link>
                        <Link
                            href="/admin/users?filter=pending"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Pendientes
                        </Link>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Fecha Registro</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => {
                                const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles
                                const roles = user.roles || []
                                const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin'
                                const isDriver = !!driverProfile || (Array.isArray(roles) ? roles.includes('driver') : roles === 'driver')

                                return (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                                                    <span className="font-bold text-zinc-400 uppercase">
                                                        {user.full_name?.substring(0, 2) || '??'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.full_name || 'Sin Nombre'}</p>
                                                    <p className="text-zinc-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {isAdmin ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        <Shield className="h-3 w-3" />
                                                        Admin
                                                    </span>
                                                ) : isDriver ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                        <Car className="h-3 w-3" />
                                                        Conductor
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        <User className="h-3 w-3" />
                                                        Pasajero
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isDriver ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(driverProfile?.status)}`}>
                                                    {translateStatus(driverProfile?.status)}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400">
                                            {new Date(user.created_at).toLocaleDateString('es-MX', { year: '2-digit', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="text-zinc-400 hover:text-white transition-colors text-xs font-medium border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg"
                                            >
                                                Gestionar
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No se encontraron usuarios.
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
