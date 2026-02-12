
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, Car, MapPin, Calendar, CheckCircle, Shield, FileText, Activity, Share2 } from 'lucide-react'
import StatusHistory from '@/app/components/admin/StatusHistory'
import DriverActions from '@/app/components/admin/DriverActions'
import PassengerActions from '@/app/components/admin/PassengerActions'
import MembershipManager from '@/app/components/admin/MembershipManager'

async function getSignedUrl(supabase: any, publicUrl: string | null, bucket: string) {
    if (!publicUrl) return null;
    try {
        // Try to verify if it's already a working URL or needs signing
        // Assuming standard Supabase storage URL structure: .../storage/v1/object/public/BUCKET/PATH
        if (!publicUrl.includes(`/storage/v1/object/public/${bucket}/`)) return publicUrl;

        const path = publicUrl.split(`/storage/v1/object/public/${bucket}/`)[1];
        if (!path) return publicUrl;

        const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
        return data?.signedUrl || publicUrl;
    } catch (e) {
        return publicUrl;
    }
}

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    // Await params first (Next.js 15+ requirement)
    const { id } = await params

    const supabase = await createClient()

    const { data: user, error } = await supabase
        .from('users')
        .select(`
            *,
            driver_profiles (
                id,
                status,
                city,
                bio,
                profile_photo_url,
                is_visible,
                created_at,
                service_radius_km,
                whatsapp_number,
                request_reason,
                vehicles (
                    brand,
                    model,
                    year,
                    color,
                    plate_number,
                    status
                ),
                driver_services (
                    preferred_zones,
                    languages,
                    indigenous_languages,
                    work_schedule,
                    professional_questionnaire,
                    personal_bio,
                    transport_platforms,
                    knows_sign_language,
                    social_commitment,
                    payment_methods,
                    payment_link
                ),
                driver_memberships (
                    status,
                    expires_at,
                    origin
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error || !user) {
        console.error('Error fetching user:', error)
        notFound()
    }

    const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles
    const vehicle = driverProfile?.vehicles?.[0]
    const membership = driverProfile?.driver_memberships?.[0] || driverProfile?.driver_memberships

    const isDriver = !!driverProfile

    const idDocumentSignedUrl = await getSignedUrl(supabase, user.id_document_url, 'documents');
    const addressProofSignedUrl = await getSignedUrl(supabase, user.address_proof_url, 'documents');

    // Fetch Logs if driver
    let logs: any[] = []
    if (isDriver) {
        const { data: logsData } = await supabase
            .from('driver_status_logs')
            .select(`
                *,
                actor:users!actor_id (
                    full_name,
                    email
                )
            `)
            .eq('driver_profile_id', driverProfile.id)
            .order('created_at', { ascending: false })

        logs = logsData || []
    }

    // Fetch Referrer details if available
    let referrer = null
    if (user.referred_by) {
        const { data: referrerData } = await supabase
            .from('users')
            .select('full_name, referral_code')
            .eq('id', user.referred_by)
            .single()
        referrer = referrerData
    }


    return (
        <div>
            {/* Header */}
            {/* ... existing header ... */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info - Left Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* ... existing sections (Personal Info, Driver Request Note, Documents, Service Info) ... */}
                    {/* Personal Information (Consolidated) */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                        {/* ... content ... */}
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                            <User className="h-5 w-5 text-purple-400" />
                            Información Personal
                        </h3>
                        {/* ... content ... */}
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* ... content ... */}
                            <div className="flex-shrink-0 space-y-4">
                                {(isDriver ? driverProfile.profile_photo_url : user.avatar_url) ? (
                                    <div className="w-full md:w-48 aspect-square relative rounded-xl overflow-hidden border border-white/10 bg-black/20 group">
                                        <Image
                                            src={isDriver ? driverProfile.profile_photo_url : user.avatar_url}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 w-full bg-black/60 p-2 text-xs text-center text-white">Foto de Perfil</div>
                                    </div>
                                ) : (
                                    <div className="w-full md:w-48 aspect-square flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-zinc-500 text-sm p-4 text-center">
                                        Sin foto de perfil
                                    </div>
                                )}
                            </div>
                            {/* ... content ... */}
                            <div className="flex-grow space-y-5">
                                {/* ... content ... */}
                                <div className="grid grid-cols-1 gap-5">
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Nombre Completo</label>
                                        <p className="text-white font-medium text-lg">{user.full_name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Correo Electrónico</label>
                                        <p className="text-white font-medium">{user.email}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Teléfono</label>
                                            <p className="text-white font-medium">
                                                {(() => {
                                                    const phone = user.phone_number || driverProfile?.whatsapp_number;
                                                    if (!phone) return 'No registrado';
                                                    if (phone.length < 4) return phone;
                                                    return `${'*'.repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`;
                                                })()}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Fecha de Registro</label>
                                            <p className="text-white font-medium">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {/* ... content ... */}
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Dirección</label>
                                        <div className="flex items-start gap-2 text-white font-medium">
                                            <MapPin className="h-4 w-4 text-zinc-400 mt-1 flex-shrink-0" />
                                            <p>
                                                {user.address_text || [
                                                    user.address_street,
                                                    user.address_number_ext,
                                                    user.address_number_int ? `Int. ${user.address_number_int}` : null,
                                                    user.address_suburb,
                                                    user.address_postal_code,
                                                    user.address_state,
                                                    user.address_country
                                                ].filter(Boolean).join(', ') || 'No registrada'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HISTORY LOGS - Moved to main column */}
                    {isDriver && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                                <Activity className="h-5 w-5 text-zinc-400" />
                                Historial de Actividad
                            </h3>
                            <StatusHistory logs={logs} />
                        </div>
                    )}


                    {/* Driver Request Note */}
                    {isDriver && driverProfile.status === 'pending_approval' && driverProfile.request_reason && (
                        <div className="backdrop-blur-xl bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-400">
                                <FileText className="h-5 w-5" />
                                Nota del Conductor
                            </h3>
                            <p className="text-sm text-zinc-300 italic whitespace-pre-wrap leading-relaxed">
                                "{driverProfile.request_reason}"
                            </p>
                        </div>
                    )}


                    {/* Personal Documents */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                            <Shield className="h-5 w-5 text-blue-400" />
                            Documentos Personales
                        </h3>
                        {/* ... content ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Official ID */}
                            <div className="space-y-2">
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider">Identificación Oficial</label>
                                {idDocumentSignedUrl ? (
                                    <Link href={idDocumentSignedUrl} target="_blank" className="block group relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 hover:border-blue-500/50 transition-colors">
                                        {idDocumentSignedUrl.toLowerCase().includes('.pdf') ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                                                <FileText className="h-10 w-10 mb-2" />
                                                <span className="text-xs font-medium">Documento PDF</span>
                                            </div>
                                        ) : (
                                            <Image
                                                src={idDocumentSignedUrl}
                                                alt="Identificación Oficial"
                                                fill
                                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">Ver Documento</span>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="aspect-video bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-zinc-500 text-xs italic">
                                        No adjuntada
                                    </div>
                                )}
                            </div>

                            {/* Proof of Address */}
                            <div className="space-y-2">
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider">Comprobante de Domicilio</label>
                                {addressProofSignedUrl ? (
                                    <Link href={addressProofSignedUrl} target="_blank" className="block group relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 hover:border-blue-500/50 transition-colors">
                                        {addressProofSignedUrl.toLowerCase().includes('.pdf') ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                                                <FileText className="h-10 w-10 mb-2" />
                                                <span className="text-xs font-medium">Documento PDF</span>
                                            </div>
                                        ) : (
                                            <Image
                                                src={addressProofSignedUrl}
                                                alt="Comprobante de Domicilio"
                                                fill
                                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">Ver Documento</span>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="aspect-video bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-zinc-500 text-xs italic">
                                        No adjuntado
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service Information for Drivers */}
                    {isDriver && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                <Car className="h-5 w-5 text-purple-400" />
                                Información de Servicio
                            </h3>

                            {(() => {
                                const services = Array.isArray(driverProfile.driver_services)
                                    ? driverProfile.driver_services[0]
                                    : driverProfile.driver_services;

                                if (!services) return <p className="text-zinc-500 italic">No hay información de servicios registrada.</p>;

                                return (
                                    <div className="space-y-6">
                                        {/* Bio */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Reseña Profesional</h4>
                                                <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                                                    {services.professional_questionnaire?.bio || 'No especificada'}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Reseña Personal</h4>
                                                <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                                                    {services.personal_bio || 'No especificada'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Plataformas</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {services.transport_platforms?.length > 0 ? services.transport_platforms.map((p: string) => (
                                                        <span key={p} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-lg font-medium">
                                                            {p}
                                                        </span>
                                                    )) : <span className="text-zinc-500 text-xs italic">Ninguna</span>}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Zonas e Idiomas</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {services.preferred_zones?.map((z: string) => (
                                                        <span key={z} className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-lg font-medium">{z}</span>
                                                    ))}
                                                    {services.languages?.map((l: string) => (
                                                        <span key={l} className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs rounded-lg font-medium">{l}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Commitments */}
                                        <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${services.knows_sign_language ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                <span className="text-sm text-zinc-300">Sabe Lenguaje de Señas (LSM)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${services.social_commitment ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                <span className="text-sm text-zinc-300">Compromiso Social Firmado</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* Sidebar Info - Right Column */}
                <div className="space-y-6">
                    {/* Referral Info */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                            <Share2 className="h-5 w-5 text-blue-400" />
                            Programa de Referidos
                        </h3>
                        {referrer ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Invitado por</label>
                                    <p className="text-white font-medium">{referrer.full_name}</p>
                                </div>
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Código Usado</label>
                                    <p className="text-white font-mono bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded inline-block text-blue-400">
                                        {referrer.referral_code}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="py-2">
                                <p className="text-zinc-500 italic text-sm">
                                    Este usuario no fue invitado por nadie (llegó orgánicamente).
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Driver Actions */}
                    {isDriver && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4 text-white">Acciones Admin</h3>
                            <p className="text-zinc-400 text-xs mb-6">
                                Revisa cuidadosamente la información antes de aprobar.
                            </p>

                            <DriverActions
                                driverProfileId={driverProfile.id}
                                currentStatus={driverProfile.status}
                                isVisible={driverProfile.is_visible}
                            />
                        </div>
                    )}

                    {/* Membership Manager */}
                    {isDriver && (
                        <MembershipManager
                            driverProfileId={driverProfile.id}
                            membershipStatus={membership?.status || 'inactive'}
                            expiresAt={membership?.expires_at}
                            origin={membership?.origin || 'unknown'}
                        />
                    )}

                    {/* Passenger Verification Status */}
                    {!isDriver && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            {/* ... validation checklist ... */}
                            <h3 className="text-lg font-semibold mb-4 text-white">Estado de Validación</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-zinc-400 text-sm">Email Confirmado</span>
                                    {user.email_confirmed_at ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                                    ) : (
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Pendiente</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-zinc-400 text-sm">Nombre Completo</span>
                                    {user.full_name ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                                    ) : (
                                        <span className="text-xs font-bold text-red-400 uppercase">Faltante</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-zinc-400 text-sm">Teléfono</span>
                                    {user.phone_number ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                                    ) : (
                                        <span className="text-xs font-bold text-red-400 uppercase">Faltante</span>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs text-zinc-500 text-center">
                                        {(user.full_name && user.phone_number && user.email_confirmed_at)
                                            ? "Este usuario cumple con todos los requisitos para contactar conductores."
                                            : "El usuario debe completar su perfil para activar funciones de contacto."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Passenger Actions (Ban/Unban) */}
                    {!isDriver && (
                        <PassengerActions userId={user.id} isBanned={user.is_banned} />
                    )}

                    {/* Vehicle Details */}
                    {isDriver && vehicle && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            {/* ... vehicle info ... */}
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                <Car className="h-5 w-5 text-emerald-400" />
                                Vehículo
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Marca</label>
                                        <p className="text-white font-medium">{vehicle.brand}</p>
                                    </div>
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Modelo</label>
                                        <p className="text-white font-medium">{vehicle.model}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Año</label>
                                        <p className="text-white font-medium">{vehicle.year}</p>
                                    </div>
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Color</label>
                                        <p className="text-white font-medium">{vehicle.color}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Placas</label>
                                    <p className="text-white font-mono bg-black/20 px-2 py-1 rounded border border-white/5 inline-block">
                                        {vehicle.plate_number || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

