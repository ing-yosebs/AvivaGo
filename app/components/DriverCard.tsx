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
    Zap
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
            className="group relative block backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 shadow-2xl hover:shadow-white/5"
        >
            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="relative md:w-[35%] h-64 md:h-auto overflow-hidden">
                    <img
                        src={userObj?.avatar_url || driver.profile_photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop'}
                        alt={fullName}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay for Name and Rating */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                    {/* Rating at Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                        <div className="flex items-center gap-1.5 bg-yellow-500 text-black px-2.5 py-1 rounded-full shadow-lg shadow-yellow-500/20">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-[11px] font-black">{driver.average_rating || '5.0'}</span>
                        </div>
                    </div>

                    {/* Name at Bottom Centered */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-center">
                        <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md">
                            {fullName}
                        </h3>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="space-y-4 mb-6">
                            {/* 1. Professional Bio */}
                            <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed italic">
                                "{bio}"
                            </p>

                            {/* 2. Main Vehicle */}
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Car className="h-4 w-4 text-blue-500 opacity-70" />
                                <span className="text-sm font-medium truncate">{vehicle}</span>
                            </div>

                            {/* 3. City of Origin */}
                            <div className="flex items-center gap-3 text-zinc-400">
                                <MapPin className="h-4 w-4 text-emerald-500 opacity-70" />
                                <span className="text-sm font-medium">{userObj?.address_state || driver.city}</span>
                            </div>

                            {/* Personality Tags */}
                            <div className="flex flex-wrap gap-2 pt-1">
                                {questionnaire.social && (
                                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-wider border border-blue-500/20">
                                        {personalityLabels.social[questionnaire.social]}
                                    </span>
                                )}
                                {questionnaire.driving && (
                                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[9px] font-bold uppercase tracking-wider border border-purple-500/20">
                                        {personalityLabels.driving[questionnaire.driving]}
                                    </span>
                                )}
                                {questionnaire.assistance && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                        {personalityLabels.assistance[questionnaire.assistance]}
                                    </span>
                                )}
                            </div>

                            {activeTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-3">
                                    {activeTags.map((t: any) => {
                                        const Icon = t.icon;
                                        const colors: any = {
                                            blue: 'bg-blue-500/5 text-blue-400/80 border-blue-500/10',
                                            red: 'bg-red-500/5 text-red-400/80 border-red-500/10',
                                            emerald: 'bg-emerald-500/5 text-emerald-400/80 border-emerald-500/10',
                                            amber: 'bg-amber-500/5 text-amber-400/80 border-amber-500/10'
                                        };
                                        return (
                                            <div key={t.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${colors[t.color]} transition-colors group-hover:border-white/20`}>
                                                <Icon className="h-3 w-3" />
                                                <span className="text-[10px] font-medium">{t.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Disponible ahora</span>
                        <div className="flex items-center gap-2 text-white font-semibold text-sm group/btn">
                            Ver Perfil
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
