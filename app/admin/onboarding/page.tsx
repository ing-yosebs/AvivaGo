import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Search, Filter, Shield, User, Users, Settings, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CheckCircle2, XCircle, Smartphone, Car, Share2, Tag, Gift, Award, HelpCircle } from 'lucide-react'
import { formatDateMX, formatTimeMX } from '@/lib/dateUtils'

// Helper for WhatsApp link
const getWhatsAppUrl = (phone: string | null | undefined, name: string | null) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
    const msg = encodeURIComponent(`Hola ${name || 'Socio'}, te contactamos del equipo de AvivaGo. Notamos que estás configurando tu cuenta y queremos ofrecerte nuestra ayuda para que comiences a generar ingresos lo antes posible.`);
    return `https://wa.me/${cleanPhone}?text=${msg}`;
}

export default async function OnboardingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const search = params.search as string | undefined
    const sortBy = (params.sortBy as string) || 'created_at'
    const sortOrder = (params.order as 'asc' | 'desc') || 'desc'

    const supabase = createAdminClient()

    const page = parseInt((params.page as string) || '1')
    const pageSize = 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // We only want to see people who are somewhat drivers (they have a driver_profile).
    let query = supabase
        .from('users')
        .select(`
            id,
            full_name,
            email,
            phone_number,
            avatar_url,
            created_at,
            email_confirmed_at,
            driver_profiles!inner (
                id,
                status,
                profile_photo_url,
                b2c_referral_count,
                referral_count,
                vehicles ( id ),
                driver_service_tags ( tag_id )
            )
        `, { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

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
        supabase.from('driver_profiles').select('*', { count: 'exact', head: true }) // Total drivers
    ])

    const filteredUsers = users || []
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    // Calculate global stats (for the header)
    // Note: To be perfectly accurate these should be aggregated on the DB side, 
    // but for the MVP, calculating them based on the current page or a separate fast query is okay.
    // For now we'll just show the total drivers as the global stat.

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white m-0">
                        Progreso de Usuarios
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                        Métricas de Onboarding: identifica la configuración de los perfiles para ayudarles o premiarles.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-[2rem] backdrop-blur-xl min-w-[240px]">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Award className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Conductores Totales</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-white font-mono font-bold text-2xl leading-none">{globalTotal}</span>
                            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Perfiles</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Controls Section (Search) */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2">
                <form action="/admin/onboarding" method="GET" className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        name="search"
                        placeholder="Buscar por nombre, correo o teléfono..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-zinc-600"
                        defaultValue={search}
                    />
                </form>
            </div>

            {/* 3. Data Section (Table) */}
            <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <Link
                                        href={`/admin/onboarding?sortBy=created_at&order=${sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}`}
                                        className="flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        Registro
                                        {sortBy === 'created_at' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </Link>
                                </th>
                                <th className="px-6 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <Link
                                        href={`/admin/onboarding?sortBy=full_name&order=${sortBy === 'full_name' && sortOrder === 'asc' ? 'desc' : 'asc'}${search ? `&search=${search}` : ''}`}
                                        className="flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        Usuario
                                        {sortBy === 'full_name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </Link>
                                </th>
                                <th className="px-6 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-center" title="Correo Confirmado y Teléfono">Contacto OK</th>
                                <th className="px-6 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-center" title="Foto de Perfil Personalizada">Foto</th>
                                <th className="px-6 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-center" title="Servicios Configurables">Servicios</th>
                                <th className="px-6 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-center" title="Vehículos Cargados">Auto</th>
                                <th className="px-6 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-center" title="Pasajeros Referidos / Conductores Referidos">Referidos</th>
                                <th className="px-6 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 relative z-10">
                            {filteredUsers.map((user) => {
                                const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles;

                                // Contact OK logic
                                const hasConfirmedEmail = !!user.email_confirmed_at;
                                const hasPhone = !!user.phone_number;
                                const isContactOk = hasConfirmedEmail && hasPhone;

                                // Photo logic
                                const photoUrl = driverProfile?.profile_photo_url;
                                const hasCustomPhoto = photoUrl && !photoUrl.includes('placeholder') && !photoUrl.includes('default') && photoUrl !== '/images/socio-avivago.png';

                                // Services logic
                                const servicesCount = driverProfile?.driver_service_tags?.length || 0;

                                // Vehicle logic
                                const vehiclesCount = driverProfile?.vehicles?.length || 0;
                                const hasVehicle = vehiclesCount > 0;

                                // Referrals logic
                                const b2cRefs = driverProfile?.b2c_referral_count || 0;
                                const b2bRefs = driverProfile?.referral_count || 0;
                                const totalRefs = b2cRefs + b2bRefs;

                                return (
                                    <tr key={user.id} className="hover:bg-white/5 transition-all group">

                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-300 font-medium text-sm leading-tight">
                                                    {formatDateMX(user.created_at)}
                                                </span>
                                                <span className="text-zinc-500 font-medium text-[10px] leading-tight">
                                                    {formatTimeMX(user.created_at)}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="font-bold text-white text-sm leading-tight mb-0.5">{user.full_name || 'Sin Nombre'}</p>
                                                <p className="text-zinc-400 text-[11px] font-mono">{user.email || 'Sin correo electrónico'}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center flex-col items-center gap-1">
                                                {isContactOk ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-500/50" />
                                                )}
                                                {!hasConfirmedEmail && <span className="text-[8px] text-red-400 uppercase tracking-tighter">Sin Email</span>}
                                                {!hasPhone && <span className="text-[8px] text-red-400 uppercase tracking-tighter">Sin Teléfono</span>}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center">
                                                {hasCustomPhoto ? (
                                                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm" title="Foto subida">
                                                        <User className="h-4 w-4" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 shadow-sm" title="Foto default">
                                                        <User className="h-4 w-4 opacity-50" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center">
                                                {servicesCount > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        {servicesCount}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                                                        0
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center flex-col items-center gap-1">
                                                {hasVehicle ? (
                                                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm" title={`${vehiclesCount} vehículos`}>
                                                        <Car className="h-4 w-4" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 shadow-sm" title="Sin vehículo">
                                                        <Car className="h-4 w-4 opacity-50" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${b2cRefs > 0 ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`} title="Pasajeros Referidos">
                                                    <User className="w-3 h-3" /> {b2cRefs}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${b2bRefs > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`} title="Conductores Referidos">
                                                    <Car className="w-3 h-3" /> {b2bRefs}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* WhatsApp Contact Action */}
                                                <a
                                                    href={getWhatsAppUrl(user.phone_number, user.full_name)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all shadow-lg active:scale-95 ${user.phone_number ? 'bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-600 cursor-not-allowed'}`}
                                                    title={user.phone_number ? "Contactar por WhatsApp" : "Sin teléfono"}
                                                    onClick={(e) => !user.phone_number && e.preventDefault()}
                                                >
                                                    <Smartphone className="w-4 h-4" />
                                                </a>

                                                {/* Go to Profile Detail */}
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg active:scale-95"
                                                    title="Ver Perfil Completo"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                                <HelpCircle className="h-6 w-6 text-zinc-700" />
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
                            Mostrando <span className="text-white">{from + 1}</span> a <span className="text-white">{Math.min(to + 1, totalCount)}</span> de <span className="text-white">{totalCount}</span> {search ? 'resultados filtrados' : 'usuarios'}
                        </p>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/onboarding?page=${page - 1}${search ? `&search=${search}` : ''}&sortBy=${sortBy}&order=${sortOrder}`}
                                className={`p-2 rounded-xl border border-white/10 transition-all ${page <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-white/5 hover:border-white/20'}`}
                            >
                                <ChevronLeft className="w-4 h-4 text-zinc-400" />
                            </Link>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    const isVisible = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);

                                    if (isVisible) {
                                        return (
                                            <Link
                                                key={p}
                                                href={`/admin/onboarding?page=${p}${search ? `&search=${search}` : ''}&sortBy=${sortBy}&order=${sortOrder}`}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border ${p === page
                                                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20'
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
                                href={`/admin/onboarding?page=${page + 1}${search ? `&search=${search}` : ''}&sortBy=${sortBy}&order=${sortOrder}`}
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
