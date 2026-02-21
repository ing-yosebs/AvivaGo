'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import DriverCard from './DriverCard';
import TrustFooter from '@/app/components/marketing/v1/TrustFooter';
import ValidatedUserCounter from '@/app/components/marketing/ValidatedUserCounter';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Search, Filter } from 'lucide-react';

export default function DriverBrowser() {
    const [searchTerm, setSearchTerm] = useState('');
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [selectedZone, setSelectedZone] = useState<string>('all');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
    const [selectedIndigenous, setSelectedIndigenous] = useState<string>('all');
    const [selectedPersonality, setSelectedPersonality] = useState<{ social: string, driving: string, assistance: string }>({
        social: 'all',
        driving: 'all',
        assistance: 'all'
    });
    const supabase = createClient();

    useEffect(() => {
        const fetchDrivers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('driver_profiles_public')
                .select(`
                    id,
                    bio,
                    profile_photo_url,
                    city,
                    average_rating,
                    user_full_name,
                    user_avatar_url,
                    user_address_state,
                    vehicles (
                        brand,
                        model,
                        year
                    ),
                    driver_services (*),
                    driver_memberships!inner (
                        status,
                        expires_at
                    )
                `)
                .eq('status', 'active')
                .eq('is_visible', true)
                .eq('driver_memberships.status', 'active')
                .gt('driver_memberships.expires_at', new Date().toISOString());

            if (error) {
                console.error('Error fetching drivers details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
            } else {
                setDrivers(data || []);
            }
            setLoading(false);
        };

        fetchDrivers();
    }, [supabase]);

    const filteredDrivers = drivers.filter(driver => {
        const term = searchTerm.toLowerCase();
        const fullName = driver.user_full_name?.toLowerCase() || '';
        const city = (driver.user_address_state || driver.city || '').toLowerCase();
        const vehicle = driver.vehicles?.[0] ? `${driver.vehicles[0].brand} ${driver.vehicles[0].model}`.toLowerCase() : '';

        const matchesSearch =
            fullName.includes(term) ||
            city.includes(term) ||
            vehicle.includes(term) ||
            driver.bio?.toLowerCase().includes(term);

        const matchesCity = selectedCity === 'all' || (driver.user_address_state === selectedCity || driver.city === selectedCity);

        const services = (Array.isArray(driver.driver_services) ? driver.driver_services[0] : driver.driver_services) || {};
        const questionnaire = services.professional_questionnaire || {};

        const matchesTag = selectedTag === 'all' || (questionnaire.tags || []).includes(selectedTag);

        const matchesSocial = selectedPersonality.social === 'all' || questionnaire.social === selectedPersonality.social;
        const matchesDriving = selectedPersonality.driving === 'all' || questionnaire.driving === selectedPersonality.driving;
        const matchesAssistance = selectedPersonality.assistance === 'all' || questionnaire.assistance === selectedPersonality.assistance;

        const zones = services.preferred_zones || [];
        const languages = services.languages || [];
        const indigenous = services.indigenous_languages || [];

        const matchesZone = selectedZone === 'all' || zones.includes(selectedZone);
        const matchesLanguage = selectedLanguage === 'all' || languages.includes(selectedLanguage);
        const matchesIndigenous = selectedIndigenous === 'all' || indigenous.includes(selectedIndigenous);

        return matchesSearch && matchesCity && matchesTag && matchesSocial && matchesDriving && matchesAssistance && matchesZone && matchesLanguage && matchesIndigenous;
    });

    const allTags = [
        { id: 'cargo', label: 'Carga de Alto Volumen' },
        { id: 'sport', label: 'Equipo Deportivo' },
        { id: 'rack', label: 'Canastilla / Rack' },
        { id: 'baby', label: 'Silla para Bebé' },
        { id: 'charge', label: 'Kit de Carga' },
        { id: 'ac', label: 'Aire Acondicionado' },
        { id: 'mobility', label: 'Movilidad Reducida' },
        { id: 'sensory', label: 'Asistencia Sensorial' },
        { id: 'medical', label: 'Soporte Médico' },
        { id: 'plus', label: 'Espacio Confort' },
        { id: 'neuro', label: 'Neurodiversidad' },
        { id: 'pet', label: 'Pet Friendly' },
        { id: 'move', label: 'Mudanza Ligera' },
        { id: 'shopping', label: 'Turismo de Compras' },
        { id: 'party', label: 'Traslado de Fiesta' },
        { id: 'native', label: 'Anfitrión Extranjeros' },
        { id: 'guide', label: 'Guía e Información' },
        { id: 'roads', label: 'Traslados Foráneos' },
        { id: 'universal', label: 'Compromiso Universal' }
    ];

    const cities = Array.from(new Set(drivers.map(d => d.user_address_state || d.city))).filter(Boolean).sort();

    // Extract unique zones, languages, and indigenous languages for filters
    const allAvailableZones = Array.from(new Set(drivers.flatMap(d => {
        const s = Array.isArray(d.driver_services) ? d.driver_services[0] : d.driver_services;
        return s?.preferred_zones || [];
    }))).filter(Boolean).sort();

    const allAvailableLanguages = Array.from(new Set(drivers.flatMap(d => {
        const s = Array.isArray(d.driver_services) ? d.driver_services[0] : d.driver_services;
        return s?.languages || [];
    }))).filter(Boolean).sort();

    const allAvailableIndigenous = Array.from(new Set(drivers.flatMap(d => {
        const s = Array.isArray(d.driver_services) ? d.driver_services[0] : d.driver_services;
        return s?.indigenous_languages || [];
    }))).filter(Boolean).sort();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col relative font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Background elements - Clean Light Mode */}
            <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-100/40 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] bg-indigo-50/50 rounded-full blur-[100px]" />
            </div>

            <Header />

            {/* Hero Section */}
            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="max-w-4xl mx-auto text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-aviva-navy mb-6 drop-shadow-sm font-display">
                        Tu conductor de <span className="text-aviva-primary inline-block">confianza</span>,<br className="hidden md:block" /> a un clic.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Conecta con conductores profesionales verificados. Seguridad, privacidad y el mejor servicio para ti y tu familia.
                    </p>
                    <ValidatedUserCounter />
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Search Bar - Airbnb Style */}
                    <div className="bg-white rounded-2xl p-2 shadow-soft flex flex-col md:flex-row items-center gap-2 border border-gray-100 transition-all focus-within:shadow-xl focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-50">
                        <div className="relative flex-1 w-full pl-2">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Busca por nombre, ciudad o 'Pet Friendly'..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base md:text-lg font-medium"
                            />
                        </div>
                        <div className="w-full h-px md:w-px md:h-10 bg-gray-100 mx-2" />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all w-full md:w-auto justify-center whitespace-nowrap ${showFilters ? 'bg-blue-50 text-blue-600' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filtros</span>
                        </button>
                        <button className="hidden md:flex bg-aviva-primary text-white p-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">
                            <Search className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-8 bg-white border border-gray-100 rounded-3xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ciudad</label>
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    >
                                        <option value="all">Todas las ciudades</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Especialidad</label>
                                    <select
                                        value={selectedTag}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    >
                                        <option value="all">Cualquier especialidad</option>
                                        {allTags.map(tag => (
                                            <option key={tag.id} value={tag.id}>{tag.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Atmósfera</label>
                                    <select
                                        value={selectedPersonality.social}
                                        onChange={(e) => setSelectedPersonality({ ...selectedPersonality, social: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    >
                                        <option value="all">Todas</option>
                                        <option value="1a">Privacidad / Silencio</option>
                                        <option value="1b">Empatía / Cordial</option>
                                        <option value="1c">Anfitrión / Plática</option>
                                    </select>
                                </div>
                                {/* Reduced other filters for cleaner UI, user can add more if requested */}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-1 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 text-aviva-primary animate-spin" />
                            <p className="text-aviva-subtext animate-pulse font-medium">Buscando los mejores conductores...</p>
                        </div>
                    ) : filteredDrivers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredDrivers.map(driver => (
                                <DriverCard key={driver.id} driver={driver} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-3xl shadow-sm">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-gray-50 rounded-full">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-aviva-navy mb-2 font-display">No encontramos resultados</h3>
                            <p className="text-aviva-subtext mb-6">Intenta ajustar tus filtros o busca en otra zona.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCity('all'); setSelectedTag('all'); }}
                                className="text-aviva-primary font-bold hover:underline"
                            >
                                Ver todos los conductores
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <TrustFooter />
        </div>
    );
}
