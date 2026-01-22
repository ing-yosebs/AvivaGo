'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from './Header';
import { createClient } from '@/lib/supabase/client';
import {
    MapPin,
    Star,
    CheckCircle,
    ChevronLeft,
    MessageCircle,
    Lock,
    ShieldCheck,
    Calendar,
    Car,
    Clock,
    Award,
    Globe,
    Zap,
    Stethoscope,
    Users,
    Map,
    User,
    Heart,
    Edit3
} from 'lucide-react';
import ReviewModal from './ReviewModal';

interface ProfileViewProps {
    driver: {
        id: string | number;
        name: string;
        city: string;
        area: string;
        vehicle: string;
        year: number;
        photo: string;
        rating: number;
        reviews: number;
        price: number;
        year_joined?: string;
        tags: string[];
        bio: string;
        phone?: string;
        zones?: string[];
        languages?: string[];
        indigenous?: string[];
        schedule?: any;
        personality?: {
            social?: { label: string; desc: string };
            driving?: { label: string; desc: string };
            assistance?: { label: string; desc: string };
        };
        personal_bio?: string;
        transport_platforms?: string[];
        knows_sign_language?: boolean;
    }
}

const ProfileView = ({ driver }: ProfileViewProps) => {
    const supabase = createClient();
    // Initial state is locked (false) to show the contact information hidden
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFav, setLoadingFav] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    useEffect(() => {
        const checkFavorite = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoadingFav(false);
                return;
            }

            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('driver_profile_id', driver.id)
                .single();

            if (data) setIsFavorite(true);
            setLoadingFav(false);
        };
        checkFavorite();
    }, [driver.id, supabase]);

    // Check if unlocked on mount
    useEffect(() => {
        const checkUnlock = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('unlocks') // Assuming table name
                .select('id')
                .eq('user_id', user.id)
                .eq('driver_profile_id', driver.id)
                .single();

            if (data) setIsUnlocked(true);
        };
        checkUnlock();
    }, [driver.id, supabase]);

    const toggleFavorite = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Debes iniciar sesión para agregar a favoritos');
            return;
        }

        if (isFavorite) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('driver_profile_id', driver.id);

            if (!error) setIsFavorite(false);
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    driver_profile_id: driver.id
                });

            if (!error) setIsFavorite(true);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <Header />

            <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Back Navigation */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all mb-8 group"
                    >
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Volver al buscador
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar: Profile Info and CTA */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[40px] overflow-hidden p-8 sticky top-24">
                                <div className="relative mb-8 text-center">
                                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-blue-600/20 group relative">
                                        <img
                                            src={driver.photo}
                                            alt={driver.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/20 group-hover:opacity-0 transition-opacity" />
                                    </div>
                                    <div className="absolute bottom-0 right-1/2 translate-x-12 translate-y-1 bg-green-500 p-1.5 rounded-full ring-4 ring-zinc-950">
                                        <ShieldCheck className="h-4 w-4 text-white" />
                                    </div>
                                </div>

                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold mb-2 tracking-tight">{driver.name}</h1>
                                    <div className="flex items-center justify-center gap-2 text-zinc-400">
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium">{driver.city}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 mt-4">
                                        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                                            <Star className="h-3.5 w-3.5 fill-current" />
                                            <span className="text-sm font-bold">{driver.rating}</span>
                                        </div>
                                        <span className="text-zinc-600">•</span>
                                        <span className="text-sm text-zinc-500 font-medium">{driver.reviews} reseñas</span>
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="space-y-4">
                                    {isUnlocked ? (
                                        <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                                            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl text-center">
                                                <p className="text-green-500 font-bold text-[10px] uppercase tracking-widest mb-2">Contacto Desbloqueado</p>
                                                <p className="text-2xl font-mono font-bold text-white mb-6 tracking-wider">
                                                    {driver.phone}
                                                </p>
                                                <a
                                                    href={`https://wa.me/${driver.phone?.replace(/\D/g, '')}?text=Hola ${driver.name}, vi tu perfil en AvivaGo y me gustaría consultar por un servicio.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
                                                >
                                                    <MessageCircle className="h-5 w-5 fill-current" />
                                                    Escribir al WhatsApp
                                                </a>
                                            </div>
                                            <p className="text-[10px] text-center text-zinc-500 uppercase font-bold">Sin cargos adicionales por contacto directo</p>

                                            <button
                                                onClick={() => setIsReviewOpen(true)}
                                                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-2xl transition-all border border-white/10"
                                            >
                                                <Edit3 className="h-4 w-4 text-yellow-500" />
                                                Calificar Servicio
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-white border border-white/10 rounded-3xl text-center shadow-xl">
                                                <p className="text-zinc-500 text-sm mb-2">Costo para contactar</p>
                                                <h4 className="text-4xl font-bold text-black mb-6">${driver.price.toFixed(2)} <span className="text-sm font-medium text-zinc-400">USD</span></h4>
                                                <button
                                                    onClick={async () => {
                                                        const { data: { user } } = await supabase.auth.getUser();
                                                        if (!user) {
                                                            alert('Inicia sesión para desbloquear');
                                                            return;
                                                        }

                                                        // Mock payment / Create unlock
                                                        const { error } = await supabase
                                                            .from('unlocks')
                                                            .insert({
                                                                user_id: user.id,
                                                                driver_profile_id: driver.id,
                                                                amount_paid: driver.price || 10.00
                                                            });

                                                        if (!error) {
                                                            setIsUnlocked(true);
                                                        } else {
                                                            console.error('Error unlocking:', error);
                                                            // If error is duplicate key, just unlock
                                                            if (error.code === '23505') {
                                                                setIsUnlocked(true);
                                                            } else {
                                                                alert('Error al desbloquear contacto');
                                                            }
                                                        }
                                                    }}
                                                    className="w-full flex items-center justify-center gap-3 bg-zinc-950 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg group active:scale-[0.98]"
                                                >
                                                    <Lock className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                                    Desbloquear ahora
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-zinc-500">
                                                <ShieldCheck className="h-4 w-4 text-green-500/50" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Protección al cliente</span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={toggleFavorite}
                                        disabled={loadingFav}
                                        className={`w-full flex items-center justify-center gap-3 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] ${isFavorite
                                            ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                                        {isFavorite ? 'En mis Favoritos' : 'Agregar a Favoritos'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Bio, Vehicle, Reviews */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Bio Card */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[40px] p-8 lg:p-12">
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <Award className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">Experiencia Profesional</h3>
                                    </div>
                                    <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                                        {driver.bio}
                                    </p>
                                </section>

                                {driver.personal_bio && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-purple-600/10 p-2 rounded-xl">
                                                <User className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight">Sobre mí (Reseña Personal)</h3>
                                        </div>
                                        <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                                            {driver.personal_bio}
                                        </p>
                                    </section>
                                )}

                                {/* Vehicle */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <Car className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">Vehículo Registrado</h3>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                        <div className="text-xl font-bold text-white mb-1">{driver.vehicle}</div>
                                        <div className="text-sm text-zinc-500 font-medium">Modelo {driver.year} • Capacidad para 4 pasajeros</div>
                                    </div>
                                </section>

                                {/* Zones */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <MapPin className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">Zonas de Cobertura</h3>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                        <div className="flex flex-wrap gap-2">
                                            {(driver.zones || []).length > 0 ? (
                                                (driver.zones || []).map(zone => (
                                                    <span key={zone} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-bold">{zone}</span>
                                                ))
                                            ) : <span className="text-zinc-500 italic">No especificado</span>}
                                        </div>
                                    </div>
                                </section>

                                {/* Languages */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <Globe className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">Idiomas</h3>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                        <div className="flex flex-wrap gap-2">
                                            {(driver.languages || []).length > 0 ? (
                                                (driver.languages || []).map(lang => (
                                                    <span key={lang} className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-bold">{lang}</span>
                                                ))
                                            ) : <span className="text-zinc-500 italic">Español</span>}
                                        </div>
                                    </div>
                                </section>

                                {/* Indigenous Languages */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <Globe className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">Lenguas Indígenas</h3>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                        {(driver.indigenous || []).length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {driver.indigenous?.map((lang: string) => (
                                                    <span key={lang} className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm font-bold">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-zinc-500 italic">No se especificaron lenguas indígenas</span>
                                        )}
                                    </div>
                                </section>

                                {/* Inclusive Communication (Sign Language) */}
                                {driver.knows_sign_language && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-blue-600/20 p-2 rounded-xl">
                                                <Zap className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight">Comunicación Inclusiva</h3>
                                        </div>
                                        <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-3xl flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                                                <CheckCircle className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-lg">Intérprete de Lenguaje de Señas (LSM)</p>
                                                <p className="text-zinc-400 text-sm">Este conductor está capacitado para comunicarse con personas con discapacidad auditiva.</p>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Transport Platforms */}
                                {driver.transport_platforms && driver.transport_platforms.length > 0 && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-emerald-600/10 p-2 rounded-xl">
                                                <Car className="h-5 w-5 text-emerald-500" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight">Plataformas donde opero</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {driver.transport_platforms.map(platform => (
                                                <div key={platform} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-zinc-300">
                                                    {platform}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <Clock className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">Horario y Disponibilidad</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
                                            const time = driver.schedule?.[day];
                                            const isActive = time && time.start !== '00:00' && time.end !== '00:00';

                                            return (
                                                <div key={day} className={`p-4 rounded-2xl border transition-all ${isActive ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{day}</div>
                                                    <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                                                        {isActive ? `${time.start} - ${time.end}` : 'No disponible'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* SERVICE SEAL (Personality) */}
                                {(driver.personality?.social || driver.personality?.driving || driver.personality?.assistance) && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="bg-blue-600/10 p-2 rounded-xl">
                                                <Zap className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight">Sello de Servicio Profesional</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {driver.personality?.social && (
                                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interacción Social</div>
                                                    <div className="text-lg font-bold text-blue-400">"{driver.personality.social.label}"</div>
                                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                                        La interacción social de este conductor es principalmente de <span className="text-white font-medium">"{driver.personality.social.label}"</span>. {driver.personality.social.desc}
                                                    </p>
                                                </div>
                                            )}
                                            {driver.personality?.driving && (
                                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estilo de Conducción</div>
                                                    <div className="text-lg font-bold text-purple-400">"{driver.personality.driving.label}"</div>
                                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                                        Su estilo de conducción es <span className="text-white font-medium">"{driver.personality.driving.label}"</span>. {driver.personality.driving.desc}
                                                    </p>
                                                </div>
                                            )}
                                            {driver.personality?.assistance && (
                                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nivel de Asistencia</div>
                                                    <div className="text-lg font-bold text-emerald-400">"{driver.personality.assistance.label}"</div>
                                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                                        El nivel de asistencia es <span className="text-white font-medium">"{driver.personality.assistance.label}"</span>. {driver.personality.assistance.desc}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <Award className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">Especialidades y Equipamiento</h3>
                                    </div>

                                    <div className="space-y-10">
                                        {[
                                            {
                                                title: 'Capacidad Técnica',
                                                color: 'blue',
                                                icon: Zap,
                                                tags: [
                                                    { id: 'cargo', label: 'Carga de Alto Volumen' },
                                                    { id: 'sport', label: 'Equipo Deportivo' },
                                                    { id: 'rack', label: 'Canastilla / Rack' },
                                                    { id: 'baby', label: 'Silla para Bebé' },
                                                    { id: 'charge', label: 'Kit de Carga' },
                                                    { id: 'ac', label: 'Aire Acondicionado' }
                                                ]
                                            },
                                            {
                                                title: 'Inclusión y Salud',
                                                color: 'red',
                                                icon: Stethoscope,
                                                tags: [
                                                    { id: 'mobility', label: 'Movilidad Reducida' },
                                                    { id: 'sensory', label: 'Asistencia Sensorial' },
                                                    { id: 'medical', label: 'Soporte Médico' },
                                                    { id: 'plus', label: 'Espacio Confort' },
                                                    { id: 'neuro', label: 'Neurodiversidad' }
                                                ]
                                            },
                                            {
                                                title: 'Logística y Estilo de Vida',
                                                color: 'emerald',
                                                icon: Users,
                                                tags: [
                                                    { id: 'pet', label: 'Pet Friendly' },
                                                    { id: 'move', label: 'Mudanza Ligera' },
                                                    { id: 'shopping', label: 'Turismo de Compras' },
                                                    { id: 'party', label: 'Traslado de Fiesta' }
                                                ]
                                            },
                                            {
                                                title: 'Turismo y Cultura',
                                                color: 'amber',
                                                icon: Map,
                                                tags: [
                                                    { id: 'native', label: 'Anfitrión Extranjeros' },
                                                    { id: 'guide', label: 'Guía e Información' },
                                                    { id: 'roads', label: 'Traslados Foráneos' },
                                                    { id: 'universal', label: 'Compromiso Universal' }
                                                ]
                                            }
                                        ].map((cat) => {
                                            const activeTags = cat.tags.filter(t => driver.tags.includes(t.id));
                                            if (activeTags.length === 0) return null;

                                            const colorClasses: any = {
                                                blue: 'bg-blue-600/20 text-blue-400 border-blue-500/20 text-blue-500',
                                                red: 'bg-red-600/20 text-red-400 border-red-500/20 text-red-500',
                                                emerald: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/20 text-emerald-500',
                                                amber: 'bg-amber-600/20 text-amber-400 border-amber-500/20 text-amber-500'
                                            };

                                            const Icon = cat.icon;

                                            return (
                                                <div key={cat.title} className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={`h-4 w-4 ${colorClasses[cat.color].split(' ').pop()}`} />
                                                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{cat.title}</h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {activeTags.map(tag => (
                                                            <span
                                                                key={tag.id}
                                                                className={`px-4 py-2 border rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 ${colorClasses[cat.color].split(' ').slice(0, 3).join(' ')}`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full ${cat.color === 'blue' ? 'bg-blue-400' : cat.color === 'red' ? 'bg-red-400' : cat.color === 'emerald' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                                                {tag.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>

                            {/* Verification Badge */}
                            <div className="backdrop-blur-xl bg-blue-600/5 border border-blue-600/20 rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-6">
                                <div className="bg-blue-600 p-4 rounded-3xl shrink-0">
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl font-bold mb-1">Perfil Verificado y Miembro AvivaGo</h4>
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        Este conductor es miembro activo de nuestra comunidad desde {driver.year_joined} y ha superado satisfactoriamente nuestro proceso de validación de identidad, documentos y antecedentes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                driverId={String(driver.id)}
                driverName={driver.name}
            />
        </div>
    );
};

export default ProfileView;
