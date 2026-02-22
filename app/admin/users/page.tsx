
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Search, Filter, MoreHorizontal, Shield, Car, User, Users, Settings, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { formatDateMX, formatTimeMX } from '@/lib/dateUtils'

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
        case 'incomplete': return 'Incompleto'; // Profile incomplete but email confirmed
        default: return 'Usuario';
    }
}

async function getSignedUrlsBatch(supabase: any, items: any[], bucket: string, photoKey: (item: any) => string | null) {
    const validItems = items.filter(item => {
        const url = photoKey(item);
        const isPlaceholder = !url || url.includes('placehold') || url.includes('placeholder') || url.includes('default') || url === '/images/socio-avivago.png';
        return url && !isPlaceholder && url.includes(`/storage/v1/object/public/${bucket}/`);
    });

    if (validItems.length === 0) {
        return items.map(item => ({ ...item, signed_photo_url: null }));
    }

    const paths = validItems.map(item => photoKey(item)!.split(`/storage/v1/object/public/${bucket}/`)[1]);
    const { data } = await supabase.storage.from(bucket).createSignedUrls(paths, 3600);

    return items.map(item => {
        const url = photoKey(item);
        const isPlaceholder = !url || url.includes('placehold') || url.includes('placeholder') || url.includes('default') || url === '/images/socio-avivago.png';

        if (!isPlaceholder && url && url.includes(`/storage/v1/object/public/${bucket}/`)) {
            const path = url.split(`/storage/v1/object/public/${bucket}/`)[1];
            const signed = data?.find((d: any) => d.path === path);
            return { ...item, signed_photo_url: signed?.signedUrl || null };
        }
        return { ...item, signed_photo_url: null };
    });
}

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const filter = params.filter as string | undefined
    const search = params.search as string | undefined
    const sortBy = (params.sortBy as string) || 'created_at'
    const sortOrder = (params.order as 'asc' | 'desc') || 'desc'

    const supabase = createAdminClient()

    let selectStr = `
        id,
        full_name,
        email,
        phone_number,
        avatar_url,
        roles,
        created_at,
        email_confirmed_at,
        driver_profiles (
            status,
            city,
            is_visible,
            profile_photo_url,
            driver_memberships (
                status,
                expires_at
            )
        )
    `;

    // Advanced Filtering Strategy
    if (filter === 'pending' || filter === 'vip') {
        selectStr = `
            id,
            full_name,
            email,
            phone_number,
            avatar_url,
            roles,
            created_at,
            email_confirmed_at,
            driver_profiles!inner (
                status,
                city,
                is_visible,
                profile_photo_url,
                driver_memberships (
                    status,
                    expires_at
                )
            )
        `;
    }

    const page = parseInt((params.page as string) || '1')
    const pageSize = 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
        .from('users')
        .select(selectStr, { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

    // Filter Logic
    let vipUserIds: string[] = []
    if (filter === 'vip') {
        const { data: activeMemberships } = await supabase
            .from('driver_memberships')
            .select('driver_profiles(user_id)')
            .eq('status', 'active')
            .gte('expires_at', new Date().toISOString())

        vipUserIds = (activeMemberships || []).map(m => (m.driver_profiles as any)?.user_id).filter(Boolean)
        if (vipUserIds.length === 0) vipUserIds = ['00000000-0000-0000-0000-000000000000'] // Prevent empty array error
    }

    if (filter === 'pending') {
        query = query.eq('driver_profiles.status', 'pending_approval')
    } else if (filter === 'drivers') {
        query = query.not('driver_profiles', 'is', null)
    } else if (filter === 'passengers') {
        query = query.is('driver_profiles', null)
    } else if (filter === 'unconfirmed') {
        query = query.is('email_confirmed_at', null)
    } else if (filter === 'vip') {
        query = query.in('id', vipUserIds)
    } else if (filter === 'issues') {
        // Show users with unconfirmed emails OR drivers that are suspended/rejected
        query = query.or('email_confirmed_at.is.null, driver_profiles.status.in.(suspended,rejected)')
    }

    // Apply Search (Name, Email, Phone)
    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`)
    }

    // Parallel execution for data and total count
    const [
        { data: users, error, count },
        { count: globalTotal }
    ] = await Promise.all([
        query,
        supabase.from('users').select('*', { count: 'exact', head: true })
    ])

    const filteredUsers = users || []
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    // Batch sign all profile photos for performance
    const usersWithSignedPhotos = await getSignedUrlsBatch(
        supabase,
        filteredUsers,
        'avatars',
        (u) => {
            const driverProfile = Array.isArray(u.driver_profiles) ? u.driver_profiles[0] : u.driver_profiles;
            return driverProfile?.profile_photo_url || u.avatar_url;
        }
    );


    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white m-0">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                        Panel central para el control de identidad y estados de actividad de conductores y pasajeros.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-[2rem] backdrop-blur-xl min-w-[240px]">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Base de Datos Global</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-white font-mono font-bold text-2xl leading-none">{globalTotal}</span>
                            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Usuarios</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Controls Section (Search & Filter) */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2">
                <form action="/admin/users" method="GET" className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        name="search"
                        placeholder="Buscar por nombre, correo o teléfono..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                        defaultValue={search}
                    />
                    {filter && <input type="hidden" name="filter" value={filter} />}
                </form>

                <div className="flex items-center gap-1 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide bg-white/5 border border-white/10 rounded-[1.25rem] p-1.5 backdrop-blur-md">
                    {[
                        { id: null, label: 'Todos', filter: null },
                        { id: 'passengers', label: 'Pasajeros', filter: 'passengers' },
                        { id: 'drivers', label: 'CONDUCTORES', filter: 'drivers' },
                        { id: 'vip', label: 'C. VIP', filter: 'vip' },
                        { id: 'pending', label: 'Pendientes', filter: 'pending' },
                        { id: 'issues', label: 'Observaciones', filter: 'issues' },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.id ? `/admin/users?filter=${item.filter}${search ? `&search=${search}` : ''}` : search ? `/admin/users?search=${search}` : '/admin/users'}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-wider ${(item.filter === filter) || (!item.filter && !filter)
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

                <div className="w-full">
                    <table className="w-full text-left border-collapse block lg:table">
                        <thead className="hidden lg:table-header-group">
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <Link
                                        href={`/admin/users?sortBy=full_name&order=${sortBy === 'full_name' && sortOrder === 'asc' ? 'desc' : 'asc'}${filter ? `&filter=${filter}` : ''}${search ? `&search=${search}` : ''}`}
                                        className="flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        Nombre
                                        {sortBy === 'full_name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </Link>
                                </th>
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Perfil</th>
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Estado</th>
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Suscripción</th>
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <Link
                                        href={`/admin/users?sortBy=created_at&order=${sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc'}${filter ? `&filter=${filter}` : ''}${search ? `&search=${search}` : ''}`}
                                        className="flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        Registro
                                        {sortBy === 'created_at' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </Link>
                                </th>
                                <th className="px-4 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right">Administrar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 relative z-10 block lg:table-row-group">
                            {usersWithSignedPhotos.map((user) => {
                                const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles
                                const roles = user.roles || []
                                const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin'
                                const isDriver = !!driverProfile || (Array.isArray(roles) ? roles.includes('driver') : roles === 'driver')

                                const memberships = driverProfile?.driver_memberships || []
                                const membershipsArr = Array.isArray(memberships) ? memberships : [memberships]
                                const hasActiveMembership = membershipsArr.some(m => m && m.status === 'active' && new Date(m.expires_at) > new Date())

                                return (
                                    <tr key={user.id} className="hover:bg-white/5 transition-all group grid grid-cols-4 lg:table-row p-4 lg:p-0 gap-y-4 items-start">
                                        <td className="col-span-full px-2 lg:px-4 lg:py-6 block lg:table-cell border-b border-white/5 lg:border-none pb-4 lg:pb-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center group/photo relative">
                                                        {user.signed_photo_url ? (
                                                            <img src={user.signed_photo_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <>
                                                                <User className="h-6 w-6 text-zinc-600" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <span className="text-[8px] text-white font-bold uppercase">Sin Foto</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="font-bold text-white text-base lg:text-sm leading-tight mb-0.5">{user.full_name || 'Sin Nombre'}</p>
                                                        <p className="text-zinc-400 text-xs lg:text-[11px] font-mono">{user.email || 'Sin correo electrónico'}</p>
                                                        <p className="text-zinc-500 text-xs lg:text-[11px] font-mono">{user.phone_number || 'Sin teléfono'}</p>
                                                    </div>
                                                </div>
                                                <div className="lg:hidden mt-0.5">
                                                    <Link
                                                        href={`/admin/users/${user.id}`}
                                                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg active:scale-95 group/btn"
                                                        title="Gestionar Usuario"
                                                    >
                                                        <Settings className="w-6 h-6 group-hover/btn:rotate-90 transition-transform duration-500" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="col-span-1 px-1 lg:px-4 lg:py-6 flex flex-col items-center lg:items-start gap-2 lg:table-cell">
                                            <span className="lg:hidden text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">Perfil</span>
                                            <div className="flex items-center justify-center lg:justify-start">
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
                                        <td className="col-span-1 px-1 lg:px-4 lg:py-6 flex flex-col items-center lg:items-start gap-2 lg:table-cell text-center lg:text-left">
                                            <span className="lg:hidden text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">Estado</span>
                                            <div className="flex flex-col gap-1.5 items-center lg:items-start">
                                                {/* Badge de Pasajero (Cuenta Base) */}
                                                <div className="flex flex-row items-center gap-1 lg:gap-1.5 group/tooltip relative">
                                                    <span className={`inline-flex items-center px-1 lg:px-2.5 py-1 rounded-lg text-[6px] lg:text-[9px] font-black uppercase border text-center ${!user.email_confirmed_at ? getStatusColor('unconfirmed') : getStatusColor((user.full_name && user.phone_number && user.email) ? 'validated' : 'incomplete')} ${!user.email_confirmed_at ? 'animate-pulse-subtle' : ''}`}>
                                                        {(!user.email_confirmed_at) ? translateStatus('unconfirmed') : translateStatus((user.full_name && user.phone_number && user.email) ? 'validated' : 'incomplete')}
                                                    </span>
                                                    <span className="text-[5px] lg:text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">P</span>
                                                </div>

                                                {/* Badge de Conductor (Opcional) */}
                                                {isDriver && (
                                                    <div className="flex flex-row items-center gap-1 lg:gap-1.5 group/tooltip relative pt-1 border-t border-white/5 w-full justify-center lg:justify-start">
                                                        <span className={`inline-flex items-center px-1 lg:px-2.5 py-1 rounded-lg text-[6px] lg:text-[9px] font-black uppercase border text-center ${getStatusColor(driverProfile?.status)}`}>
                                                            {translateStatus(driverProfile?.status)}
                                                        </span>
                                                        <span className="text-[5px] lg:text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">C</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Columna Suscripción */}
                                        <td className="col-span-1 px-1 lg:px-4 lg:py-6 flex flex-col items-center lg:items-start gap-2 lg:table-cell text-center lg:text-left">
                                            <span className="lg:hidden text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">Suscripción</span>
                                            <div className="flex items-center justify-center lg:justify-start">
                                                {isDriver ? (
                                                    hasActiveMembership ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border text-center bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-sm" title="Membresía Activa">
                                                            <Shield className="h-3 w-3" /> VIP
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border text-center bg-zinc-500/10 text-zinc-400 border-zinc-500/20 shadow-sm" title="Usuario Free">
                                                            FREE
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-zinc-600 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="col-span-1 px-1 lg:px-4 lg:py-6 flex flex-col items-center lg:items-start gap-2 lg:table-cell">
                                            <span className="lg:hidden text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center text-balance leading-tight">Registro</span>
                                            <div className="flex flex-col text-center lg:text-left w-full">
                                                <span className="text-zinc-300 font-medium text-[9px] lg:text-sm leading-tight">
                                                    {formatDateMX(user.created_at)}
                                                </span>
                                                <span className="text-zinc-500 font-medium text-[9px] lg:text-sm leading-tight">
                                                    {formatTimeMX(user.created_at)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-2 lg:px-4 py-3 lg:py-6 lg:text-right border-t border-white/5 lg:border-none mt-2 lg:mt-0 lg:pt-6">
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
                                <tr className="block lg:table-row">
                                    <td colSpan={5} className="px-4 lg:px-8 py-16 lg:py-24 text-center block lg:table-cell w-full">
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

                {/* 4. Pagination Section */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 border-t border-white/5 bg-white/[0.01]">
                        <p className="text-zinc-500 text-[10px] font-medium">
                            Mostrando <span className="text-white">{from + 1}</span> a <span className="text-white">{Math.min(to + 1, totalCount)}</span> de <span className="text-white">{totalCount}</span> {filter || search ? 'resultados filtrados' : 'usuarios'}
                        </p>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/users?page=${page - 1}${filter ? `&filter=${filter}` : ''}${search ? `&search=${search}` : ''}&sortBy=${sortBy}&order=${sortOrder}`}
                                className={`p-2 rounded-xl border border-white/10 transition-all ${page <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-white/5 hover:border-white/20'}`}
                            >
                                <ChevronLeft className="w-4 h-4 text-zinc-400" />
                            </Link>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    // Logic to show fewer pages for cleaner UI
                                    const isVisible = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);

                                    if (isVisible) {
                                        return (
                                            <Link
                                                key={p}
                                                href={`/admin/users?page=${p}${filter ? `&filter=${filter}` : ''}${search ? `&search=${search}` : ''}&sortBy=${sortBy}&order=${sortOrder}`}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border ${p === page
                                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                                    : 'border-white/10 text-zinc-500 hover:border-white/20 hover:text-white hover:bg-white/5'}`}
                                            >
                                                {p}
                                            </Link>
                                        );
                                    }
                                    if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-zinc-700 px-0.5 text-[10px]">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <Link
                                href={`/admin/users?page=${page + 1}${filter ? `&filter=${filter}` : ''}${search ? `&search=${search}` : ''}&sortBy=${sortBy}&order=${sortOrder}`}
                                className={`p-2 rounded-xl border border-white/10 transition-all ${page >= totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-white/5 hover:border-white/20'}`}
                            >
                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
