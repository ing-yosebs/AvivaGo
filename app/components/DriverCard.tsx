import Link from 'next/link';
import {
    Star,
    MapPin,
    Car,
    ArrowRight,
    Briefcase,
    Bike,
    Package,
    Baby,
    Wind,
    Accessibility,
    PawPrint,
    Languages,
    Landmark,
    Zap,
    Users,
    ShieldCheck
} from 'lucide-react';

interface DriverCardProps {
    driver: any;
}

export default function DriverCard({ driver }: DriverCardProps) {
    const userObj = Array.isArray(driver.users) ? driver.users[0] : driver.users;
    const fullName = userObj?.full_name || 'Conductor AvivaGo';

    const vehicleArr = Array.isArray(driver.vehicles) ? driver.vehicles : (driver.vehicles ? [driver.vehicles] : []);
    const vehicleObj = vehicleArr[0];
    const vehicle = vehicleObj
        ? `${vehicleObj.brand} ${vehicleObj.model} ${vehicleObj.year || ''}`
        : 'Vehículo Confort';

    const services = Array.isArray(driver.driver_services) ? driver.driver_services[0] : driver.driver_services;
    const questionnaire = services?.professional_questionnaire || {};
    const bio = questionnaire.bio || driver.bio || 'Preparado para brindarte el mejor servicio de transporte privado con seguridad y puntualidad.';
    const hasSocialCommitment = services?.social_commitment || false;

    const personalityLabels: any = {
        social: { '1a': 'Privacidad', '1b': 'Empático', '1c': 'Anfitrión' },
        driving: { '2a': 'Zen', '2b': 'Dinámico', '2c': 'Normativo' },
        assistance: { '3a': 'Directo', '3b': 'Asistido', '3c': 'Espera' }
    };

    const categories = [
        { id: 'tech', color: 'blue', tags: ['cargo', 'sport', 'rack', 'baby', 'charge', 'ac'] },
        { id: 'inclusion', color: 'red', tags: ['mobility', 'sensory', 'medical', 'plus', 'neuro'] },
        { id: 'lifestyle', color: 'emerald', tags: ['pet', 'move', 'shopping', 'party'] },
        { id: 'tourism', color: 'amber', tags: ['native', 'guide', 'roads', 'universal'] }
    ];

    const tagData: any = {
        'cargo': { label: 'Carga', icon: Briefcase },
        'sport': { label: 'Deporte', icon: Bike },
        'rack': { label: 'Rack', icon: Package },
        'baby': { label: 'Bebé', icon: Baby },
        'ac': { label: 'A/A', icon: Wind },
        'mobility': { label: 'Movilidad', icon: Accessibility },
        'sensory': { label: 'Sensorial', icon: Zap },
        'medical': { label: 'Médico', icon: Zap },
        'plus': { label: 'Confort', icon: Zap },
        'neuro': { label: 'Neuro', icon: Zap },
        'pet': { label: 'Pet Friendly', icon: PawPrint },
        'move': { label: 'Mudanza', icon: Briefcase },
        'shopping': { label: 'Compras', icon: Briefcase },
        'party': { label: 'Fiesta', icon: Zap },
        'native': { label: 'Anfitrión', icon: Languages },
        'guide': { label: 'Guía', icon: Landmark },
        'roads': { label: 'Foráneo', icon: MapPin },
        'universal': { label: 'Universal', icon: Star },
        'charge': { label: 'Carga', icon: Zap }
    };

    const userTags = questionnaire.tags || [];
    const activeTags = categories.map(cat => {
        const found = cat.tags.find(t => userTags.includes(t));
        return found ? { id: found, ...tagData[found], color: cat.color } : null;
    }).filter(Boolean);

    return (
        <Link
            href={`/driver/${driver.id}`}
            className="group relative block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-300 shadow-card"
        >
            <div className="flex flex-col md:flex-row h-full">
                {/* Image Section */}
                <div className="relative md:w-[35%] h-56 sm:h-64 md:h-auto overflow-hidden">
                    <img
                        src={userObj?.avatar_url || driver.profile_photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop'}
                        alt={fullName}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay gradient only at bottom for text readability if needed, but keeping it clean */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />

                    {/* Rating Badge - Clean Glass or White */}
                    <div className="absolute top-3 right-3 z-10">
                        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-900 px-2.5 py-1 rounded-full shadow-sm border border-gray-100/50">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold">{driver.average_rating || '5.0'}</span>
                        </div>
                    </div>

                    {/* Recognition Badges */}
                    <div className="absolute bottom-3 left-3 flex gap-1.5 z-10">
                        <div className="bg-emerald-500 text-white p-1 rounded-full shadow-sm" title="Verificado">
                            <ShieldCheck className="h-3 w-3" />
                        </div>
                        {hasSocialCommitment && (
                            <div className="bg-indigo-500 text-white p-1 rounded-full shadow-sm" title="Compromiso Social">
                                <Users className="h-3 w-3 fill-current" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-aviva-navy leading-tight group-hover:text-aviva-primary transition-colors font-display">
                                {fullName}
                            </h3>
                        </div>

                        {/* Professional Bio */}
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                            {bio}
                        </p>

                        <div className="space-y-2 mb-4">
                            {/* Main Vehicle */}
                            <div className="flex items-center gap-2.5 text-gray-600">
                                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                    <Car className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-sm font-medium truncate">{vehicle}</span>
                            </div>

                            {/* City of Origin */}
                            <div className="flex items-center gap-2.5 text-gray-600">
                                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                    <MapPin className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-sm font-medium">{userObj?.address_state || driver.city}</span>
                            </div>
                        </div>

                        {/* Personality Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {questionnaire.social && (
                                <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold uppercase tracking-wide">
                                    {personalityLabels.social[questionnaire.social]}
                                </span>
                            )}
                            {questionnaire.driving && (
                                <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold uppercase tracking-wide">
                                    {personalityLabels.driving[questionnaire.driving]}
                                </span>
                            )}
                        </div>

                        {/* Feature Tags */}
                        {activeTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {activeTags.slice(0, 4).map((t: any) => {
                                    const Icon = t.icon;
                                    // Mapping legacy colors to new clean style
                                    const colors: any = {
                                        blue: 'bg-blue-50 text-blue-600',
                                        red: 'bg-red-50 text-red-600',
                                        emerald: 'bg-emerald-50 text-emerald-600',
                                        amber: 'bg-amber-50 text-amber-600'
                                    };
                                    return (
                                        <div key={t.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${colors[t.color] || 'bg-gray-100 text-gray-600'}`}>
                                            <Icon className="h-3 w-3" />
                                            <span className="text-[10px] font-medium">{t.label}</span>
                                        </div>
                                    );
                                })}
                                {activeTags.length > 4 && (
                                    <span className="text-[10px] text-gray-400 self-center">+{activeTags.length - 4}</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Disponible hoy
                        </span>
                        <div className="flex items-center gap-1 text-aviva-primary text-sm font-semibold group-hover:gap-2 transition-all">
                            Ver Perfil
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
