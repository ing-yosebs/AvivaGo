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
    note?: string;
    renderFooter?: (isMe: boolean) => React.ReactNode;
}

export default function DriverCard({ driver, note, renderFooter }: DriverCardProps) {
    const userObj = Array.isArray(driver.users) ? driver.users[0] : driver.users;
    const fullName = driver.user_full_name || userObj?.full_name || 'Conductor AvivaGo';
    const avatarUrl = driver.user_avatar_url || userObj?.avatar_url || driver.profile_photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop';
    const addressState = driver.user_address_state || userObj?.address_state || driver.city;

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
        'charge': { label: 'Energía', icon: Zap }
    };

    const userTags = questionnaire.tags || [];
    const activeTags = categories.flatMap(cat =>
        cat.tags.filter(t => userTags.includes(t)).map(t => ({ id: t, ...tagData[t], color: cat.color, categoryId: cat.id }))
    );

    return (
        <Link
            href={`/driver/${driver.id}`}
            className="group block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-card-hover transition-all duration-300 shadow-card"
        >
            {/* Header: Avatar & Main Info */}
            <div className="flex items-start gap-4 mb-4">
                <div className="relative shrink-0">
                    <img
                        src={avatarUrl}
                        alt={fullName}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop';
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm ring-1 ring-gray-100 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-50">
                        <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-full">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-bold text-gray-700">{driver.average_rating || '5.0'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-lg font-bold text-aviva-navy truncate group-hover:text-aviva-primary transition-colors font-display">
                        {fullName}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 mb-2">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold tracking-wide border border-emerald-100">
                            <ShieldCheck className="h-3 w-3" />
                            <span>VERIFICADO</span>
                        </div>
                        {hasSocialCommitment && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-[10px] font-semibold tracking-wide border border-violet-100" title="Compromiso Social">
                                <Users className="h-3 w-3" />
                                <span>IGUALDAD</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="truncate">{addressState}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle Card - Prominent */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100 group-hover:border-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                        <Car className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Vehículo</p>
                        <p className="text-sm font-bold text-gray-700 truncate">{vehicle}</p>
                    </div>
                </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-1 min-h-[40px]">
                {bio}
            </p>

            {/* User Note (if provided) */}
            {note && (
                <div className="mb-4 p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-[11px] text-indigo-800 italic line-clamp-1">"{note}"</p>
                </div>
            )}

            {/* Tags Section */}
            <div className="space-y-3">
                {/* Personality */}
                <div className="flex flex-wrap gap-1.5">
                    {questionnaire.social && (
                        <span className="px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold">
                            {personalityLabels.social[questionnaire.social]}
                        </span>
                    )}
                    {questionnaire.driving && (
                        <span className="px-2 py-1 rounded-md bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-bold">
                            {personalityLabels.driving[questionnaire.driving]}
                        </span>
                    )}
                    {questionnaire.assistance && (
                        <span className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold">
                            {personalityLabels.assistance[questionnaire.assistance]}
                        </span>
                    )}
                </div>

                {activeTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                        {(() => {
                            // Logic to select exactly one from each priority category if available
                            const priorityOrder = ['tech', 'inclusion', 'lifestyle'];
                            const visibleTags: any[] = [];
                            const usedIds = new Set();

                            // 1. Pick one from each priority category
                            priorityOrder.forEach(catId => {
                                const tag = activeTags.find(t => t.categoryId === catId);
                                if (tag) {
                                    visibleTags.push(tag);
                                    usedIds.add(tag.id);
                                }
                            });

                            // 2. Fill remaining spots (up to 3) with any other tags if needed
                            if (visibleTags.length < 3) {
                                activeTags.forEach(tag => {
                                    if (visibleTags.length < 3 && !usedIds.has(tag.id)) {
                                        visibleTags.push(tag);
                                        usedIds.add(tag.id);
                                    }
                                });
                            }

                            return (
                                <>
                                    {visibleTags.map((t: any) => {
                                        const Icon = t.icon;
                                        const colors: any = {
                                            blue: 'bg-blue-50 text-aviva-primary border-blue-100',
                                            red: 'bg-red-50 text-red-600 border-red-100',
                                            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                            amber: 'bg-amber-50 text-amber-600 border-amber-100'
                                        };
                                        return (
                                            <div key={t.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${colors[t.color] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                <Icon className="h-3 w-3" />
                                                <span className="text-[10px] font-semibold">{t.label}</span>
                                            </div>
                                        );
                                    })}
                                    {activeTags.length > visibleTags.length && (
                                        <span className="text-[10px] text-gray-400 self-center font-medium">+{activeTags.length - visibleTags.length}</span>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Disponible
                </span>

                {renderFooter ? renderFooter(false) : (
                    <div className="flex items-center gap-1 text-aviva-primary text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                        Ver Perfil
                        <ArrowRight className="h-3 w-3" />
                    </div>
                )}
            </div>
        </Link>
    );
}
