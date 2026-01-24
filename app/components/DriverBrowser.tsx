'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import DriverCard from './DriverCard';
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
                .from('driver_profiles')
                .select(`
                    id,
                    bio,
                    profile_photo_url,
                    city,
                    average_rating,
                    users (
                        full_name,
                        email,
                        avatar_url,
                        address_state
                    ),
                    vehicles (
                        brand,
                        model,
                        year
                    ),
                    driver_services (*)
                `)
                .eq('status', 'active')
                .eq('is_visible', true);

            if (error) {
                console.error('Error fetching drivers:', error);
            } else {
                setDrivers(data || []);
            }
            setLoading(false);
        };

        fetchDrivers();
    }, [supabase]);

    const filteredDrivers = drivers.filter(driver => {
        const term = searchTerm.toLowerCase();
        const fullName = driver.users?.full_name?.toLowerCase() || '';
        const city = (driver.users?.address_state || driver.city || '').toLowerCase();
        const vehicle = driver.vehicles?.[0] ? `${driver.vehicles[0].brand} ${driver.vehicles[0].model}`.toLowerCase() : '';

        const matchesSearch =
            fullName.includes(term) ||
            city.includes(term) ||
            vehicle.includes(term) ||
            driver.bio?.toLowerCase().includes(term);

        const matchesCity = selectedCity === 'all' || (driver.users?.address_state === selectedCity || driver.city === selectedCity);

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

    const cities = Array.from(new Set(drivers.map(d => d.users?.address_state || d.city))).filter(Boolean).sort();

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
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <Header />

            {/* Search and Filter Section below Header */}
            <div className="pt-24 pb-6 px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 shadow-2xl">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="¿A quién buscas? (Nombre, ciudad o tipo de vehículo...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0 text-lg"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all w-full md:w-auto justify-center ${showFilters ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-black hover:bg-zinc-200'}`}
                        >
                            <Filter className="h-4 w-4" />
                            <span>{showFilters ? 'Cerrar Filtros' : 'Filtros Avanzados'}</span>
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Ciudad</label>
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="all">Todas las ciudades</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Especialidad / Equipo</label>
                                    <select
                                        value={selectedTag}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="all">Cualquier especialidad</option>
                                        {allTags.map(tag => (
                                            <option key={tag.id} value={tag.id}>{tag.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Atmósfera (Social)</label>
                                    <select
                                        value={selectedPersonality.social}
                                        onChange={(e) => setSelectedPersonality({ ...selectedPersonality, social: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="all">Todas</option>
                                        <option value="1a">Privacidad / Silencio</option>
                                        <option value="1b">Empatía / Cordial</option>
                                        <option value="1c">Anfitrión / Plática</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Conducción</label>
                                    <select
                                        value={selectedPersonality.driving}
                                        onChange={(e) => setSelectedPersonality({ ...selectedPersonality, driving: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="all">Todas</option>
                                        <option value="2a">Zen (Suavidad)</option>
                                        <option value="2b">Dinámico (Optimización)</option>
                                        <option value="2c">Normativo (Estricto)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Nivel de Asistencia</label>
                                    <select
                                        value={selectedPersonality.assistance}
                                        onChange={(e) => setSelectedPersonality({ ...selectedPersonality, assistance: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="all">Todas</option>
                                        <option value="3a">Directo (Auto-gestión)</option>
                                        <option value="3b">Asistido (Maletas/Apoyo)</option>
                                        <option value="3c">Espera (Múltiples paradas)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Zona de Trabajo</label>
                                    <select
                                        value={selectedZone}
                                        onChange={(e) => setSelectedZone(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="all">Todas las zonas</option>
                                        {allAvailableZones.map(zone => (
                                            <option key={zone} value={zone}>{zone}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Idioma de Comunicación</label>
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="all">Todos los idiomas</option>
                                        {allAvailableLanguages.map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Lengua Indígena</label>
                                    <select
                                        value={selectedIndigenous}
                                        onChange={(e) => setSelectedIndigenous(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="all">Cualquiera / Ninguna</option>
                                        {allAvailableIndigenous.map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-1 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-10">
                        <h1 className="text-4xl font-bold tracking-tight mb-3">
                            Conductores Profesionales
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-2xl">
                            Encuentra conductores verificados en tu zona. Seguridad, confianza y trato directo.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 text-white animate-spin opacity-20" />
                            <p className="text-zinc-500 animate-pulse">Cargando conductores...</p>
                        </div>
                    ) : filteredDrivers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                            {filteredDrivers.map(driver => (
                                <DriverCard key={driver.id} driver={driver} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 backdrop-blur-xl bg-white/5 border border-dashed border-white/10 rounded-3xl">
                            <div className="flex justify-center mb-4 text-zinc-600">
                                <Search className="h-12 w-12" />
                            </div>
                            <p className="text-zinc-400 text-lg">No encontramos conductores que coincidan con tu búsqueda.</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-white font-medium hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
