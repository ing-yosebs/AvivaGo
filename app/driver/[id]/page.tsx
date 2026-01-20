import { createClient } from '@/lib/supabase/server';
import ProfileView from '../../components/ProfileView';
import Header from '../../components/Header';

export default async function DriverPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch driver profile from Supabase
    const { data: driver, error } = await supabase
        .from('driver_profiles')
        .select(`
            *,
            users!driver_profiles_user_id_fkey (
                full_name,
                email,
                avatar_url
            ),
            vehicles (*),
            driver_services (*)
        `)
        .eq('id', id)
        .single();

    if (error || !driver) {
        console.error('Error fetching driver:', JSON.stringify(error, null, 2));
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <Header />
                <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] max-w-sm backdrop-blur-xl mt-10">
                    <h1 className="text-2xl font-bold text-white mb-2">Conductor no encontrado</h1>
                    <p className="text-zinc-500 mb-6 font-medium">
                        {error ? `Hubo un error al cargar la información: ${error.message}` : 'El perfil que buscas no existe o ha sido desactivado.'}
                    </p>
                    <a href="/" className="inline-block bg-white text-black px-8 py-3 rounded-2xl font-bold hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5">
                        Volver al Inicio
                    </a>
                </div>
            </div>
        );
    }

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

    // Convert Supabase driver data to the format expected by ProfileView
    const formattedDriver = {
        id: driver.id,
        name: driver.users?.full_name || 'Conductor AvivaGo',
        city: driver.city,
        area: driver.city,
        vehicle: driver.vehicles?.[0] ? `${driver.vehicles[0].brand} ${driver.vehicles[0].model}` : 'Vehículo Confort',
        year: driver.vehicles?.[0]?.year || 2022,
        photo: driver.users?.avatar_url || driver.profile_photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop',
        rating: Number(driver.average_rating) || 5.0,
        reviews: driver.total_reviews || 0,
        price: 2.00,
        year_joined: new Date(driver.created_at).getFullYear().toString(),
        tags: tags,
        zones: services?.preferred_zones || [],
        languages: finalLanguages,
        indigenous: finalIndigenous,
        schedule: scheduleText,
        bio: driver.bio || "Conductor profesional comprometido con tu seguridad y puntualidad.",
        phone: driver.whatsapp_number
    };

    return <ProfileView driver={formattedDriver} />;
}
