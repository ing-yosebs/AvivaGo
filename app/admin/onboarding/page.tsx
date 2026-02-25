export const revalidate = 0
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Search, Filter, Shield, User, Users, Settings, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CheckCircle2, XCircle, Smartphone, Car, Share2, Tag, Gift, Award, HelpCircle, FileText } from 'lucide-react'
import { formatDateMX, formatTimeMX } from '@/lib/dateUtils'

// Helper for WhatsApp link
const getWhatsAppUrl = (phone: string | null | undefined, name: string | null) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
    const msg = encodeURIComponent(`Hola ${name || 'Socio'}, te contactamos del equipo de AvivaGo. Notamos que estás configurando tu cuenta y queremos ofrecerte nuestra ayuda para que comiences a generar ingresos lo antes posible.`);
    return `https://wa.me/${cleanPhone}?text=${msg}`;
}

async function getSignedUrl(supabase: any, pathOrUrl: string | null, fallbackBucket: string) {
    if (!pathOrUrl) return null;

    // Quick escape for standard placeholders
    if (pathOrUrl.includes('placehold.co') || pathOrUrl.includes('via.placeholder')) return pathOrUrl;

    try {
        let path = pathOrUrl;
        let bucket = fallbackBucket;

        // Auto-detect bucket from Supabase URLs
        if (pathOrUrl.startsWith('http') && pathOrUrl.includes('/storage/v1/object/')) {
            const urlObj = new URL(pathOrUrl);
            const segments = urlObj.pathname.split('/');
            // Expected segments for Supabase storage: ["", "storage", "v1", "object", "type", "bucketName", "path1", "path2"...]
            if (segments.length > 6) {
                bucket = segments[5];
                path = decodeURIComponent(segments.slice(6).join('/'));
            }
        }

        // Try to generate a signed URL using the admin client
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);

        if (error) {
            // If it's a full URL, fallback to it (might be public)
            return pathOrUrl.startsWith('http') ? pathOrUrl : null;
        }

        return data?.signedUrl || pathOrUrl;
    } catch (e) {
        return pathOrUrl;
    }
}

export default async function OnboardingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const search = params.search as string | undefined
    const sortBy = (params.sortBy as string) || 'onboarding_progress_score'
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
            onboarding_progress_score,
            driver_profiles!inner (
                id,
                status,
                profile_photo_url,
                b2c_referral_count,
                referral_count,
                vehicles ( id ),
                driver_services ( personal_bio, professional_questionnaire )
            ),
            identity_verifications ( selfie_url )
        `, { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

    // Secondary sort by created_at if progress is equal
    if (sortBy === 'onboarding_progress_score') {
        query = query.order('created_at', { ascending: false })
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
        supabase.from('driver_profiles').select('*', { count: 'exact', head: true }) // Total drivers
    ])

    const filteredUsers = users || []
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    // Parallelly fetch signed URLs for all users in the current page with aggressive selection
    const usersWithPhotos = await Promise.all(filteredUsers.map(async (user) => {
        const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles;
        const identityVerification = Array.isArray(user.identity_verifications) ? user.identity_verifications[0] : user.identity_verifications;

        const dpPhoto = driverProfile?.profile_photo_url;
        const uAvatar = user.avatar_url;
        const vSelfie = identityVerification?.selfie_url;

        // Aggressive selection: Driver Profile Photo > User Avatar > Verification Selfie
        const rawPhotoUrl = (dpPhoto && dpPhoto !== '' && !dpPhoto.includes('placehold')) ? dpPhoto :
            (uAvatar && uAvatar !== '' && !uAvatar.includes('placehold')) ? uAvatar :
                (vSelfie && vSelfie !== '' && !vSelfie.includes('placehold')) ? vSelfie : null;

        const hasCustomPhoto = rawPhotoUrl &&
            !rawPhotoUrl.includes('placeholder') &&
            !rawPhotoUrl.includes('placehold') &&
            !rawPhotoUrl.includes('default') &&
            rawPhotoUrl !== '/images/socio-avivago.png';

        let signedPhotoUrl = null;
        if (hasCustomPhoto) {
            // Determine bucket based on source
            const bucket = (rawPhotoUrl === vSelfie) ? 'avatars' :
                (rawPhotoUrl === uAvatar) ? 'avatars' : 'avatars'; // Most photos are in avatars or public

            signedPhotoUrl = await getSignedUrl(supabase, rawPhotoUrl, bucket);
        }

        return {
            ...user,
            signedPhotoUrl,
            hasCustomPhoto
        };
    }));

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

                {/* Desktop Table View */}
                <div className="hidden lg:block w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <Link
                                        href={`/admin/onboarding?sortBy=onboarding_progress_score&order=${sortBy === 'onboarding_progress_score' && sortOrder === 'desc' ? 'asc' : 'desc'}${search ? `&search=${search}` : ''}`}
                                        className="flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        Nivel
                                        {sortBy === 'onboarding_progress_score' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </Link>
                                </th>
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
                            {usersWithPhotos.map((user) => {
                                const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles;

                                // Contact OK logic (Strict: must have email AND confirmed_at)
                                const hasConfirmedEmail = !!user.email && !!user.email_confirmed_at;
                                const hasPhone = !!user.phone_number;
                                const isContactOk = hasConfirmedEmail && hasPhone;

                                // Photo logic (Using pre-fetched signed URL)
                                const hasCustomPhoto = user.hasCustomPhoto;
                                const photoUrl = user.signedPhotoUrl;

                                // Services logic (Strict: Both bio and questionnaire captured with real content)
                                const driverService = Array.isArray(driverProfile?.driver_services) ? driverProfile?.driver_services[0] : driverProfile?.driver_services;

                                const hasBio = !!driverService?.personal_bio &&
                                    driverService.personal_bio.length > 20 &&
                                    !driverService.personal_bio.includes('no ha redactado');

                                const professionalBio = driverService?.professional_questionnaire?.bio || '';
                                const hasProfessional = !!professionalBio &&
                                    professionalBio.length > 20 &&
                                    !professionalBio.includes('no ha redactado') &&
                                    !professionalBio.includes('reseña profesional') &&
                                    !professionalBio.includes('Escribe aquí');

                                const hasServicesInfo = hasBio && hasProfessional;

                                // Vehicle logic
                                const vehiclesCount = driverProfile?.vehicles?.length || 0;
                                const hasVehicle = vehiclesCount > 0;

                                // Referrals logic
                                const b2cRefs = driverProfile?.b2c_referral_count || 0;
                                const b2bRefs = driverProfile?.referral_count || 0;

                                return (
                                    <tr key={user.id} className="hover:bg-white/5 transition-all group">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border ${(user.onboarding_progress_score as number) >= 5 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                    (user.onboarding_progress_score as number) >= 3 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                                    }`}>
                                                    {user.onboarding_progress_score}/5
                                                </div>
                                            </div>
                                        </td>
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
                                                {hasCustomPhoto && photoUrl ? (
                                                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30 shadow-lg group-hover:scale-110 transition-transform">
                                                        <img
                                                            src={photoUrl}
                                                            alt={user.full_name || 'Usuario'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 shadow-sm" title="Sin foto personalizada">
                                                        <User className="h-4 w-4 opacity-50" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center flex-col items-center gap-1">
                                                {hasServicesInfo ? (
                                                    <span
                                                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm cursor-help"
                                                        title={`Bio Personal: ${driverService?.personal_bio}\n\nBio Prof: ${professionalBio}`}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span
                                                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 shadow-sm cursor-help"
                                                            title={`Pendiente - Bio: ${driverService?.personal_bio || 'Vacía'}\nEXP: ${professionalBio || 'Vacía'}`}
                                                        >
                                                            <FileText className="h-4 w-4 opacity-50" />
                                                        </span>
                                                        <div className="flex gap-1">
                                                            {!hasBio && <span className="text-[7px] text-zinc-500 bg-white/5 px-1 rounded font-bold">Sin BIO</span>}
                                                            {!hasProfessional && <span className="text-[7px] text-zinc-500 bg-white/5 px-1 rounded font-bold">Sin EXP</span>}
                                                        </div>
                                                    </div>
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
                                                {user.phone_number ? (
                                                    <a
                                                        href={getWhatsAppUrl(user.phone_number, user.full_name)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all shadow-lg active:scale-95 bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white"
                                                        title="Contactar por WhatsApp"
                                                    >
                                                        <Smartphone className="w-4 h-4" />
                                                    </a>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border bg-zinc-800/50 border-zinc-700/50 text-zinc-600 cursor-not-allowed"
                                                        title="Sin teléfono"
                                                    >
                                                        <Smartphone className="w-4 h-4" />
                                                    </span>
                                                )}

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
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="lg:hidden flex flex-col divide-y divide-white/5">
                    {usersWithPhotos.map((user) => {
                        const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles;
                        const hasConfirmedEmail = !!user.email && !!user.email_confirmed_at;
                        const hasPhone = !!user.phone_number;
                        const isContactOk = hasConfirmedEmail && hasPhone;
                        const photoUrl = user.signedPhotoUrl;
                        const hasCustomPhoto = user.hasCustomPhoto;

                        const driverService = Array.isArray(driverProfile?.driver_services) ? driverProfile?.driver_services[0] : driverProfile?.driver_services;
                        const hasBio = !!driverService?.personal_bio && driverService.personal_bio.length > 20;
                        const professionalBio = driverService?.professional_questionnaire?.bio || '';
                        const hasProfessional = !!professionalBio && professionalBio.length > 20;
                        const hasServicesInfo = hasBio && hasProfessional;

                        const vehiclesCount = driverProfile?.vehicles?.length || 0;
                        const b2cRefs = driverProfile?.b2c_referral_count || 0;
                        const b2bRefs = driverProfile?.referral_count || 0;

                        return (
                            <div key={user.id} className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center shadow-2xl">
                                            {hasCustomPhoto && photoUrl ? (
                                                <img src={photoUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <User className="h-6 w-6 text-zinc-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-base leading-tight">{user.full_name || 'Sin Nombre'}</p>
                                            <p className="text-zinc-500 text-[10px] font-mono leading-relaxed mt-0.5">{user.email || 'Sin correo'}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${(user.onboarding_progress_score as number) >= 5 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        (user.onboarding_progress_score as number) >= 3 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                        }`}>
                                        {user.onboarding_progress_score}/5
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Contacto</span>
                                        <div className="flex items-center gap-1.5">
                                            {isContactOk ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : (
                                                <XCircle className="w-3.5 h-3.5 text-red-500/50" />
                                            )}
                                            <span className="text-[10px] text-zinc-300 font-medium">
                                                {isContactOk ? 'Validado' : !hasPhone ? 'Sin Tel.' : 'Correo Pend.'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Vehículo</span>
                                        <div className="flex items-center gap-1.5 text-zinc-300">
                                            <Car className={`w-3.5 h-3.5 ${vehiclesCount > 0 ? 'text-indigo-400' : 'text-zinc-600'}`} />
                                            <span className="text-[10px] font-medium">{vehiclesCount} {vehiclesCount === 1 ? 'Auto' : 'Autos'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Servicios</span>
                                        <div className="flex items-center gap-1.5 text-zinc-300">
                                            <FileText className={`w-3.5 h-3.5 ${hasServicesInfo ? 'text-blue-400' : 'text-zinc-600'}`} />
                                            <span className="text-[10px] font-medium">{hasServicesInfo ? 'Configurado' : 'Pendiente'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Referidos</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-pink-400 text-[9px] font-bold">
                                                <User className="w-2.5 h-2.5" /> {b2cRefs}
                                            </div>
                                            <div className="flex items-center gap-1 text-amber-400 text-[9px] font-bold">
                                                <Car className="w-2.5 h-2.5" /> {b2bRefs}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="flex-1 bg-white/10 border border-white/10 py-3 rounded-xl text-center text-xs font-bold text-white active:scale-95 transition-all"
                                    >
                                        Ver Expediente
                                    </Link>
                                    {user.phone_number && (
                                        <a
                                            href={getWhatsAppUrl(user.phone_number, user.full_name)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-11 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl flex items-center justify-center text-[#25D366] active:scale-95 transition-all"
                                        >
                                            <Smartphone className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {usersWithPhotos.length === 0 && (
                    <div className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <HelpCircle className="h-6 w-6 text-zinc-700" />
                            </div>
                            <p className="text-zinc-500 font-medium">No se encontraron resultados para tu búsqueda.</p>
                        </div>
                    </div>
                )}
                {/* 4. Pagination Section */}
                {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-8 border-t border-zinc-800/50 bg-white/[0.01]">
                        <div className="flex flex-col items-center md:items-start gap-1">
                            <p className="text-zinc-500 text-xs font-medium">
                                Mostrando <span className="text-white font-bold">{from + 1}</span> a <span className="text-white font-bold">{Math.min(to + 1, totalCount)}</span>
                            </p>
                            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
                                de <span className="text-zinc-400">{totalCount}</span> {search ? 'resultados filtrados' : 'usuarios totales'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href={`/admin/onboarding?page=${page - 1}${search ? `&search=${search}` : ''}&sortBy=${sortBy}&order=${sortOrder}`}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold transition-all ${page <= 1 ? 'opacity-20 pointer-events-none' : 'text-zinc-400 hover:bg-white/5 hover:border-white/20 hover:text-white active:scale-95'}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Anterior</span>
                            </Link>

                            <div className="hidden sm:flex items-center gap-1.5">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    const isVisible = p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2);

                                    if (isVisible) {
                                        return (
                                            <Link
                                                key={p}
                                                href={`/admin/onboarding?page=${p}${search ? `&search=${search}` : ''}&sortBy=${sortBy}&order=${sortOrder}`}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all border ${p === page
                                                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/40 relative z-10 scale-110'
                                                    : 'border-white/5 text-zinc-500 hover:border-white/20 hover:text-white hover:bg-white/5'}`}
                                            >
                                                {p}
                                            </Link>
                                        );
                                    }
                                    if (p === page - 3 || p === page + 3) {
                                        return <span key={p} className="text-zinc-700 px-1 font-black">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            {/* Mobile Simple Page Indicator */}
                            <div className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-xs font-black text-amber-500">{page}</span>
                                <span className="text-zinc-600 text-[10px]">/</span>
                                <span className="text-xs font-bold text-zinc-500">{totalPages}</span>
                            </div>

                            <Link
                                href={`/admin/onboarding?page=${page + 1}${search ? `&search=${search}` : ''}&sortBy=${sortBy}&order=${sortOrder}`}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold transition-all ${page >= totalPages ? 'opacity-20 pointer-events-none' : 'text-zinc-400 hover:bg-white/5 hover:border-white/20 hover:text-white active:scale-95'}`}
                            >
                                <span className="hidden sm:inline">Siguiente</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
