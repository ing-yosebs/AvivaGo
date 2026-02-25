
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Activity, FileText } from 'lucide-react'
import StatusHistory from '@/app/components/admin/StatusHistory'
import PersonalInfo from '@/app/components/admin/user-detail/PersonalInfo'
import VehicleInfo from '@/app/components/admin/user-detail/VehicleInfo'
import PersonalDocs from '@/app/components/admin/user-detail/PersonalDocs'
import ServiceInfo from '@/app/components/admin/user-detail/ServiceInfo'
import ReferralStats from '@/app/components/admin/user-detail/ReferralStats'
import UserDetailSidebar from '@/app/components/admin/user-detail/UserDetailSidebar'

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
                // console.log(`[Admin-Storage] Detected Bucket: ${bucket}, Path: ${path}`);
            }
        }

        // Try to generate a signed URL using the admin client
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);

        if (error) {
            console.error(`[Admin-Storage] Error for ${bucket}/${path}:`, error.message);
            // If it's a full URL, fallback to it (might be public)
            return pathOrUrl.startsWith('http') ? pathOrUrl : null;
        }

        return data?.signedUrl || pathOrUrl;
    } catch (e) {
        console.error('[Admin-Storage] Fatal Exception:', e);
        return pathOrUrl;
    }
}

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: user, error } = await supabase
        .from('users')
        .select(`
            *,
            driver_profiles (
                id, status, city, bio, profile_photo_url, is_visible, created_at,
                service_radius_km, whatsapp_number, request_reason,
                vehicles (
                    brand, model, year, color, plate_number, status, vin_number,
                    plate_photo_url, circulation_card_url, verification_url,
                    vin_photo_url, invoice_url, insurance_policy_url, photos
                ),
                driver_services (
                    preferred_zones, languages, indigenous_languages, work_schedule,
                    professional_questionnaire, personal_bio, transport_platforms,
                    knows_sign_language, social_commitment, payment_methods, payment_link
                ),
                driver_memberships ( status, expires_at, origin )
            ),
            identity_verifications (*)
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
    const identityVerification = Array.isArray(user.identity_verifications) ? user.identity_verifications[0] : user.identity_verifications

    // Signed URLs Preparation
    const idDocumentSignedUrl = await getSignedUrl(supabase, user.id_document_url, 'documents');
    const idDocumentBackSignedUrl = await getSignedUrl(supabase, user.id_document_back_url || identityVerification?.back_image_url, 'documents');
    const addressProofSignedUrl = await getSignedUrl(supabase, user.address_proof_url, 'documents');
    const verificationSelfieSignedUrl = await getSignedUrl(supabase, identityVerification?.selfie_url, 'avatars');

    const vehicleDocs = vehicle ? {
        plate: await getSignedUrl(supabase, vehicle.plate_photo_url, 'vehicles'),
        circulation: await getSignedUrl(supabase, vehicle.circulation_card_url, 'vehicles'),
        verification: await getSignedUrl(supabase, vehicle.verification_url, 'vehicles'),
        vin: await getSignedUrl(supabase, vehicle.vin_photo_url, 'vehicles'),
        invoice: await getSignedUrl(supabase, vehicle.invoice_url, 'vehicles'),
        insurance: await getSignedUrl(supabase, vehicle.insurance_policy_url, 'vehicles'),
        photos: await Promise.all((vehicle.photos || []).map((p: string) => getSignedUrl(supabase, p, 'vehicles')))
    } : null;

    // Aggressive Photo Selection for Admin
    const dpPhoto = driverProfile?.profile_photo_url;
    const uAvatar = user.avatar_url;
    const vSelfie = identityVerification?.selfie_url;

    const rawPhotoUrl = (dpPhoto && dpPhoto !== '' && !dpPhoto.includes('placehold')) ? dpPhoto :
        (uAvatar && uAvatar !== '' && !uAvatar.includes('placehold')) ? uAvatar :
            (vSelfie && vSelfie !== '' && !vSelfie.includes('placehold')) ? vSelfie : null;

    const isPlaceholder = !rawPhotoUrl ||
        rawPhotoUrl === '' ||
        rawPhotoUrl.includes('placehold') ||
        rawPhotoUrl === '/images/socio-avivago.png';

    let profilePhotoUrl = null;
    if (!isPlaceholder && rawPhotoUrl) {
        profilePhotoUrl = await getSignedUrl(supabase, rawPhotoUrl, 'avatars');
        // console.log(`[Admin-Debug] Raw: ${rawPhotoUrl.substring(0, 50)}... -> Signed: ${profilePhotoUrl?.substring(0, 50)}...`);
    } else {
        // console.log(`[Admin-Debug] Photo is placeholder or null. DP: ${!!dpPhoto}, UA: ${!!uAvatar}, VS: ${!!vSelfie}`);
    }

    // Logs and Referrals
    let logs: any[] = []
    if (isDriver) {
        const { data: logsData } = await supabase
            .from('driver_status_logs')
            .select('*, actor:users!actor_id ( full_name, email )')
            .eq('driver_profile_id', driverProfile.id)
            .order('created_at', { ascending: false })
        logs = logsData || []
    }

    let referrer = null
    if (user.referred_by) {
        const { data: referrerData } = await supabase.from('users').select('full_name, referral_code').eq('id', user.referred_by).single()
        referrer = referrerData
    }

    // Fetch Referrals stats (users who used this user's referral code)
    const { data: referralsData } = await supabase
        .from('users')
        .select('id, full_name, email, roles, created_at')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false });

    const referrals = referralsData || [];
    const totalReferralsCount = referrals.length;
    const driverReferrals = referrals.filter(r =>
        Array.isArray(r.roles) ? r.roles.includes('driver') : r.roles === 'driver'
    );
    const passengerReferrals = referrals.filter(r =>
        !(Array.isArray(r.roles) ? r.roles.includes('driver') : r.roles === 'driver')
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users" className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Detalle de Usuario</h2>
                        <p className="text-zinc-500 text-sm">Gestiona la información y el estado de la cuenta</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info - Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* 1. Información Personal */}
                    <PersonalInfo user={user} driverProfile={driverProfile} profilePhotoUrl={profilePhotoUrl} />

                    {/* 2. Documentos Personales */}
                    <PersonalDocs
                        addressProofSignedUrl={addressProofSignedUrl}
                        idDocumentBackSignedUrl={idDocumentBackSignedUrl}
                        idDocumentSignedUrl={idDocumentSignedUrl}
                        verificationSelfieSignedUrl={verificationSelfieSignedUrl}
                    />

                    {/* 3. Información del Vehículo */}
                    <VehicleInfo vehicle={vehicle} vehicleDocs={vehicleDocs} />

                    {/* Rest of components */}
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

                    <ServiceInfo driverProfile={driverProfile} />

                    <ReferralStats
                        driverReferrals={driverReferrals}
                        passengerReferrals={passengerReferrals}
                        referrer={referrer}
                        totalReferralsCount={totalReferralsCount}
                    />

                    {isDriver && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                                <Activity className="h-5 w-5 text-zinc-400" />
                                Historial de Actividad
                            </h3>
                            <StatusHistory logs={logs} />
                        </div>
                    )}
                </div>

                {/* Sidebar Info - Right Column */}
                <UserDetailSidebar
                    user={user}
                    isDriver={isDriver}
                    driverProfile={driverProfile}
                    membership={membership}
                />
            </div>
        </div>
    )
}
