import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import ProfileView from '../../components/ProfileView';
import TrustFooter from '@/app/components/marketing/v1/TrustFooter';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resParams = await params;
    const id = resParams.id.split('/')[0].trim(); // Sanitize: remove trailing slashes if present
    const supabase = await createClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('driver_profiles_public').select(`
        driver_memberships (
            status,
            expires_at
        )
    `);

    if (isUuid) {
        query = query.or(`id.eq.${id},user_id.eq.${id}`);
    } else {
        query = query.ilike('user_referral_code', id);
    }

    const { data: driver } = await query.maybeSingle();

    const memberships = Array.isArray(driver?.driver_memberships)
        ? driver.driver_memberships
        : (driver?.driver_memberships ? [driver.driver_memberships] : []);

    const isPremium = memberships.some(
        (m: any) => m.status === 'active' && new Date(m.expires_at) > new Date()
    );

    if (!isPremium) {
        return {
            robots: {
                index: false,
                follow: false,
            }
        };
    }

    return {
        robots: {
            index: true,
            follow: true,
        }
    };
}

export default async function DriverPage({ params }: { params: Promise<{ id: string }> }) {
    const resParams = await params;
    const id = resParams.id.split('/')[0].trim(); // Sanitize: remove trailing slashes if present
    const supabase = await createClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('driver_profiles_public').select(`
        *,
        vehicles (*),
        driver_services (*),
        driver_memberships (
            status,
            expires_at
        )
    `);

    if (isUuid) {
        query = query.or(`id.eq.${id},user_id.eq.${id}`);
    } else {
        query = query.ilike('user_referral_code', id);
    }

    // Fetch driver profile from Supabase
    const { data: driver, error } = await query.maybeSingle();

    if (error) {
        console.error('Error fetching driver:', JSON.stringify(error, null, 2));
    }

    if (error || !driver) {
        notFound();
    }

    // Determine Premium status
    const memberships = Array.isArray(driver.driver_memberships)
        ? driver.driver_memberships
        : (driver.driver_memberships ? [driver.driver_memberships] : []);

    const hasActiveMembership = memberships.some(
        (m: any) => m.status === 'active' && new Date(m.expires_at) > new Date()
    );

    // Map tags from questionnaire to friendly labels
    const tagLabels: Record<string, string> = {
        'cargo': 'Carga de Alto Volumen',
        'sport': 'Equipo Deportivo',
        'rack': 'Canastilla / Rack',
        'baby': 'Silla para Bebé',
        'charge': 'Kit de Carga',
        'ac': 'Aire Acondicionado',
        'mobility': 'Movilidad Reducida',
        'sensory': 'Asistencia Sensorial',
        'medical': 'Soporte Médico',
        'plus': 'Espacio Confort',
        'neuro': 'Neurodiversidad',
        'pet': 'Pet Friendly',
        'move': 'Mudanza Ligera',
        'shopping': 'Turismo de Compras',
        'party': 'Traslado de Fiesta',
        'native': 'Anfitrión Extranjeros',
        'guide': 'Guía e Información',
        'roads': 'Traslados Foráneos',
        'universal': 'Compromiso Universal'
    };

    // Services can be an array if it's a join, or a single object
    const services = Array.isArray(driver?.driver_services)
        ? (driver.driver_services[0] || {})
        : (driver?.driver_services || {});

    const questionnaire = services?.professional_questionnaire || {};
    const rawTags = questionnaire.tags || [];
    const tags = rawTags.length > 0
        ? rawTags.map((t: string) => tagLabels[t] || t).slice(0, 6)
        : ["Verificado", "Seguro"];

    // Map languages
    const spokenLanguages = services?.languages || ['Español'];
    const indigenous = services?.indigenous_languages || [];
    // If the questionnaire has separate language fields, use them if preferred
    const questLanguages = questionnaire.languages || [];
    const questIndigenous = questionnaire.indigenous || [];

    const finalLanguages = questLanguages.length > 0 ? questLanguages : spokenLanguages;
    const finalIndigenous = questIndigenous.length > 0 ? questIndigenous : indigenous;

    // Format schedule
    const scheduleObj = services?.work_schedule || {};
    const scheduleTextFromQuest = questionnaire.schedule;
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    let scheduleText = scheduleTextFromQuest || "Horario Flexible / A Convenir";

    if (!scheduleTextFromQuest && Object.keys(scheduleObj).length > 0) {
        const activeDays = days.filter(d => scheduleObj[d] && scheduleObj[d].start !== '00:00');
        if (activeDays.length > 0) {
            const first = activeDays[0];
            const last = activeDays[activeDays.length - 1];
            const times = scheduleObj[first];
            scheduleText = `${activeDays.length > 1 ? first + ' a ' + last : first}: ${times.start} - ${times.end}`;
        }
    }

    // Map personality questions
    const personalityOptions: any = {
        social: {
            '1a': { label: 'Privacidad', desc: 'Ambiente de absoluta reserva y silencio.' },
            '1b': { label: 'Empático', desc: 'Saludo cordial y adaptación al ritmo del cliente.' },
            '1c': { label: 'Anfitrión', desc: 'Disfruto conversar y dar recomendaciones locales.' }
        },
        driving: {
            '2a': { label: 'Zen', desc: 'Suavidad absoluta y velocidad constante por debajo del límite.' },
            '2b': { label: 'Dinámico', desc: 'Enfoque en puntualidad y optimización de tiempos.' },
            '2c': { label: 'Normativo', desc: 'Cumplimiento estricto de reglas (no fumar, no comer).' }
        },
        assistance: {
            '3a': { label: 'Directo', desc: 'El cliente gestiona su propio acceso y equipaje.' },
            '3b': { label: 'Asistido', desc: 'Ayuda activa con maletas y apoyo en el ascenso/descenso.' },
            '3c': { label: 'Espera / Circuitos', desc: 'Disponibilidad para múltiples paradas y esperas.' }
        }
    };

    // Check for accepted quote if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    let hasAcceptedQuote = false;

    // Fetch selfie if premium
    let selfiePhoto = null;
    if (hasActiveMembership) {
        const adminSupabase = createAdminClient();
        const { data: verification } = await adminSupabase
            .from('identity_verifications')
            .select('selfie_url')
            .eq('user_id', driver.user_id)
            .maybeSingle();
        selfiePhoto = verification?.selfie_url;
    }

    if (user) {
        // Fetch user profiles to check role
        const { data: userData } = await supabase
            .from('users')
            .select('roles')
            .eq('id', user.id)
            .single();

        const isPassenger = userData?.roles?.includes('client');

        if (isPassenger) {
            const { data: quotes } = await supabase
                .from('quote_requests')
                .select('id')
                .eq('passenger_id', user.id)
                .eq('driver_id', driver.id) // Use the actual driver UUID from successfully fetched profile
                .eq('status', 'accepted')
                .limit(1);

            if (quotes && quotes.length > 0) {
                hasAcceptedQuote = true;
            }
        }
    }

    // --- Improved Profile Photos Logic ---
    // Collect all potential photos
    const allProfilePhotos = [
        driver.profile_photo_url,
        driver.user_avatar_url,
        selfiePhoto
    ].filter(url =>
        url &&
        url.length > 5 &&
        url !== 'https://placehold.co/400' &&
        url !== 'https://via.placeholder.com/150'
    );

    // Remove duplicates while maintaining order
    const uniqueProfilePhotos = Array.from(new Set(allProfilePhotos)) as string[];

    // Main photo is the first one found (usually the general avatar as you preferred)
    const avatarPhoto = uniqueProfilePhotos[0] || "";
    // If there's a second photo, we'll pass it as the selfie/alternate photo
    const secondaryPhoto = uniqueProfilePhotos.length > 1 ? uniqueProfilePhotos[1] : undefined;

    // Build hero photos (vehicle background) - Deduplicated
    const rawHeroPhotos = hasActiveMembership ? (driver.vehicles?.[0]?.photos?.slice(0, 2) || []) : [];
    const uniqueHeroPhotos = Array.from(new Set(rawHeroPhotos.filter(Boolean))) as string[];

    // Convert Supabase driver data to the format expected by ProfileView
    const formattedDriver = {
        is_verified: driver.is_verified,
        is_premium: hasActiveMembership,
        id: driver.id,
        name: driver.user_full_name || 'Conductor AvivaGo',
        city: driver.user_address_state || driver.city,
        area: driver.user_address_state || driver.city,
        vehicle: driver.vehicles?.[0] ? `${driver.vehicles[0].brand} ${driver.vehicles[0].model}` : 'Vehículo Confort',
        year: driver.vehicles?.[0]?.year || 2022,
        photo: avatarPhoto,
        profilePhotos: [], // We will move the logic to ProfileHeader
        rating: Number(driver.average_rating) || 5.0,
        reviews: driver.total_reviews || 0,
        price: 18.00,
        year_joined: new Date(driver.created_at).getFullYear().toString(),
        tags: rawTags, // Pass raw tags for categorization in ProfileView
        zones: services?.preferred_zones || [],
        languages: finalLanguages,
        indigenous: finalIndigenous,
        schedule: scheduleObj, // Pass full object
        bio: questionnaire.bio || driver.bio || "Este conductor aún no ha redactado su reseña profesional.",
        phone: undefined,
        personality: {
            social: personalityOptions.social[questionnaire.social],
            driving: personalityOptions.driving[questionnaire.driving],
            assistance: personalityOptions.assistance[questionnaire.assistance]
        },
        personal_bio: services?.personal_bio || "",
        transport_platforms: services?.transport_platforms || [],
        knows_sign_language: services?.knows_sign_language || false,
        social_commitment: services?.social_commitment || false,
        payment_methods: services?.payment_methods || [],
        payment_link: services?.payment_link || "",
        hasAcceptedQuote: hasAcceptedQuote,
        heroPhotos: uniqueHeroPhotos,
        selfiePhoto: secondaryPhoto,
        vehicleSidePhoto: uniqueHeroPhotos[0] || undefined,
        vehiclePhotos: (() => {
            const allPhotos = (driver.vehicles?.[0]?.photos || []).filter(Boolean) as string[];
            const unique = Array.from(new Set(allPhotos));
            return hasActiveMembership ? unique : unique.slice(0, 2);
        })(),
        passenger_capacity: driver.vehicles?.[0]?.passenger_capacity || 4,
        trunk_capacity: driver.vehicles?.[0]?.trunk_capacity || "",
        referral_code: driver.user_referral_code
    };

    return <ProfileView driver={formattedDriver} />;
}
