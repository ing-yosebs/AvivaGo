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
    const fullName = driver.users?.full_name || 'Conductor AvivaGo';
    const vehicle = driver.vehicles?.[0]
        ? `${driver.vehicles[0].brand} ${driver.vehicles[0].model} ${driver.vehicles[0].year}`
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
                <div className="relative md:w-[35%] h-56 md:h-auto overflow-hidden">
                    <img
                        src={driver.users?.avatar_url || driver.profile_photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop'}
                        alt={fullName}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 md:hidden" />

                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {fullName}
                                </h3>
                                <div className="flex items-center gap-2 text-zinc-500 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-sm">{driver.users?.address_state || driver.city}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                                <span className="text-sm font-bold text-white">{driver.average_rating || '5.0'}</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Car className="h-4 w-4 opacity-50" />
                                <span className="text-sm truncate">{vehicle}</span>
                            </div>
                            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed italic">
                                "{bio}"
                            </p>
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
