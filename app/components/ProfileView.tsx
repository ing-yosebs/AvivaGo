'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
    Edit3,
    CreditCard,
    Share2,
    Check,
    FileText
} from 'lucide-react';
import ReviewModal from './ReviewModal';
import QuoteModal from './QuoteModal';

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
        social_commitment?: boolean;
        payment_methods?: string[];
        payment_link?: string;
    }
}

const ProfileView = ({ driver }: ProfileViewProps) => {
    const supabase = createClient();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFav, setLoadingFav] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [showShareFeedback, setShowShareFeedback] = useState(false);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const hasViewedRef = useState(false);

    useEffect(() => {
        const registerView = async () => {
            // Basic strict mode check or session check to prevent double count in dev
            if (hasViewedRef[0]) return;
            hasViewedRef[1](true);

            // Call RPC to increment view
            await supabase.rpc('increment_profile_view', { profile_id: driver.id });
        };
        registerView();
    }, [driver.id]);

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

    const handleShare = async () => {
        const shareData = {
            title: `AvivaGo - Perfil de ${driver.name}`,
            text: `Mira el perfil de ${driver.name} en AvivaGo. Un conductor certificado y seguro.`,
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setShowShareFeedback(true);
                setTimeout(() => setShowShareFeedback(false), 2000);
            } catch (err) {
                console.error('Error copying to clipboard:', err);
                alert('No se pudo copiar el enlace al portapapeles');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col relative font-sans">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-indigo-50/50 rounded-full blur-[100px]" />
            </div>

            <Header />

            <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] overflow-hidden p-6 sm:p-8">
                                <div className="relative mb-8 text-center">
                                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-blue-50 group relative">
                                        <img
                                            src={driver.photo}
                                            alt={driver.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 group-hover:opacity-0 transition-opacity" />
                                    </div>
                                    <div className="absolute bottom-0 right-1/2 translate-x-12 translate-y-1 bg-green-500 p-1.5 rounded-full ring-4 ring-white">
                                        <ShieldCheck className="h-4 w-4 text-white" />
                                    </div>
                                    {driver.social_commitment && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-12 translate-y-1 bg-violet-500 p-1.5 rounded-full ring-4 ring-white shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse">
                                            <Users className="h-4 w-4 text-white fill-current" />
                                        </div>
                                    )}
                                </div>

                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold mb-2 tracking-tight text-aviva-navy font-display">{driver.name}</h1>

                                    {driver.social_commitment && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 border border-violet-100 text-violet-600 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                                            <Users className="h-3 w-3 fill-current" />
                                            Trato igualitario
                                        </div>
                                    )}

                                    <div className="flex items-center justify-center gap-2 text-aviva-subtext">
                                        <MapPin className="h-4 w-4 text-aviva-primary" />
                                        <span className="text-sm font-medium">{driver.city}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 mt-4">
                                        <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                            <Star className="h-3.5 w-3.5 fill-current" />
                                            <span className="text-sm font-bold">{driver.rating}</span>
                                        </div>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-sm text-aviva-subtext font-medium">{driver.reviews} reseñas</span>
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="space-y-4">
                                    {/* Quote Request Section */}
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                                        <div className="p-6 bg-white border border-blue-100 rounded-3xl text-center shadow-soft ring-4 ring-blue-50/50">
                                            <p className="text-aviva-subtext text-xs font-bold uppercase tracking-wider mb-2">Agenda tu viaje</p>
                                            <button
                                                onClick={() => setIsQuoteModalOpen(true)}
                                                className="w-full flex items-center justify-center gap-3 bg-aviva-primary text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 group active:scale-[0.98]"
                                            >
                                                <FileText className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                                                Solicitar Cotización
                                            </button>

                                            <p className="mt-4 text-[10px] text-gray-400 leading-tight">
                                                Sin compromiso. El conductor te contactará con los detalles si acepta tu solicitud.
                                            </p>
                                        </div>
                                    </div>


                                    <button
                                        onClick={toggleFavorite}
                                        disabled={loadingFav}
                                        className={`w-full flex items-center justify-center gap-3 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] ${isFavorite
                                            ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100/50'
                                            : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-50 shadow-soft'
                                            }`}
                                    >
                                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                                        {isFavorite ? 'En mis Favoritos' : 'Agregar a Favoritos'}
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className={`w-full flex items-center justify-center gap-3 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] border border-gray-100 ${showShareFeedback
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-soft'
                                            }`}
                                    >
                                        {showShareFeedback ? (
                                            <>
                                                <Check className="h-5 w-5" />
                                                ¡Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Share2 className="h-5 w-5" />
                                                Compartir Perfil
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Bio, Vehicle, Reviews */}
                        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                            {/* Bio Card */}
                            <div className="bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 lg:p-12">
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-50 p-2 rounded-xl">
                                            <Award className="h-5 w-5 text-aviva-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Experiencia Profesional</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                        <p className="text-aviva-subtext text-lg leading-relaxed font-medium">
                                            {driver.bio}
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-purple-50 p-2 rounded-xl">
                                            <User className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Sobre mí (Reseña Personal)</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                        <p className={`text-lg leading-relaxed font-medium ${driver.personal_bio ? 'text-aviva-subtext' : 'text-gray-400 italic'}`}>
                                            {driver.personal_bio || "Este conductor aun no ha redactado su reseña personal."}
                                        </p>
                                    </div>
                                </section>

                                {/* Vehicle */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-50 p-2 rounded-xl">
                                            <Car className="h-5 w-5 text-aviva-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Vehículo Registrado</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                        <div className="text-xl font-bold text-aviva-navy mb-1">{driver.vehicle}</div>
                                        <div className="text-sm text-aviva-subtext font-medium">Modelo {driver.year} • Capacidad para 4 pasajeros</div>
                                    </div>
                                </section>

                                {/* SERVICE SEAL (Personality) */}
                                {(driver.personality?.social || driver.personality?.driving || driver.personality?.assistance) && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="bg-blue-50 p-2 rounded-xl">
                                                <Zap className="h-5 w-5 text-aviva-primary" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Sello de Servicio Profesional</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {driver.personality?.social && (
                                                <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm hover:shadow-soft transition-all">
                                                    <div className="text-[10px] font-bold text-aviva-subtext uppercase tracking-widest">Interacción Social</div>
                                                    <div className="text-lg font-bold text-aviva-primary">"{driver.personality.social.label}"</div>
                                                    <p className="text-xs text-aviva-subtext leading-relaxed">
                                                        La interacción social de este conductor es principalmente de <span className="text-aviva-navy font-semibold">"{driver.personality.social.label}"</span>. {driver.personality.social.desc}
                                                    </p>
                                                </div>
                                            )}
                                            {driver.personality?.driving && (
                                                <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm hover:shadow-soft transition-all">
                                                    <div className="text-[10px] font-bold text-aviva-subtext uppercase tracking-widest">Estilo de Conducción</div>
                                                    <div className="text-lg font-bold text-purple-600">"{driver.personality.driving.label}"</div>
                                                    <p className="text-xs text-aviva-subtext leading-relaxed">
                                                        Su estilo de conducción es <span className="text-aviva-navy font-semibold">"{driver.personality.driving.label}"</span>. {driver.personality.driving.desc}
                                                    </p>
                                                </div>
                                            )}
                                            {driver.personality?.assistance && (
                                                <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm hover:shadow-soft transition-all">
                                                    <div className="text-[10px] font-bold text-aviva-subtext uppercase tracking-widest">Nivel de Asistencia</div>
                                                    <div className="text-lg font-bold text-emerald-600">"{driver.personality.assistance.label}"</div>
                                                    <p className="text-xs text-aviva-subtext leading-relaxed">
                                                        El nivel de asistencia es <span className="text-aviva-navy font-semibold">"{driver.personality.assistance.label}"</span>. {driver.personality.assistance.desc}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* Social Commitment */}
                                {driver.social_commitment && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="p-8 bg-violet-50 border border-violet-100 rounded-[2.5rem] relative overflow-hidden group shadow-soft">
                                            {/* Decorative Background Icon */}
                                            <Users className="absolute -right-4 -bottom-4 h-32 w-32 text-violet-500/5 group-hover:scale-110 transition-transform duration-700" />

                                            <div className="flex items-start gap-6 relative z-10">
                                                <div className="bg-white p-4 rounded-2xl shadow-sm">
                                                    <Users className="h-8 w-8 text-violet-600 fill-violet-600/10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-bold text-violet-700 font-display">Compromiso de Trato Igualitario</h3>
                                                    <p className="text-violet-900/80 text-lg leading-relaxed font-medium italic">
                                                        "Me comprometo a brindar un trato cordial, respetuoso y equitativo a hombres, mujeres y a la comunidad LGBTQ+, sin distinción por ideologías o creencias religiosas de mis pasajeros."
                                                    </p>
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <ShieldCheck className="h-4 w-4 text-violet-600" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600/70">Conductor Comprometido con la Inclusión</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Inclusive Communication (Sign Language) */}
                                {driver.knows_sign_language && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-blue-50 p-2 rounded-xl">
                                                <Zap className="h-5 w-5 text-aviva-primary" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Comunicación Inclusiva</h3>
                                        </div>
                                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                <CheckCircle className="h-6 w-6 text-aviva-primary" />
                                            </div>
                                            <div>
                                                <p className="text-aviva-navy font-bold text-lg">Intérprete de Lenguaje de Señas (LSM)</p>
                                                <p className="text-aviva-subtext text-sm">Este conductor está capacitado para comunicarse con personas con discapacidad auditiva.</p>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="bg-blue-50 p-2 rounded-xl">
                                            <Award className="h-5 w-5 text-aviva-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Especialidades y Equipamiento</h3>
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
                                                    { id: 'charge', label: 'Kit de carga diversos celulares' },
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
                                                blue: 'bg-blue-50 text-aviva-primary border-blue-100',
                                                red: 'bg-red-50 text-red-600 border-red-100',
                                                emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                                amber: 'bg-amber-50 text-amber-600 border-amber-100'
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

                                {/* Payment Methods */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-emerald-50 p-2 rounded-xl">
                                            <CreditCard className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Formas de Pago Aceptadas</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                        {driver.payment_methods && driver.payment_methods.length > 0 ? (
                                            <div className="space-y-6">
                                                <div className="flex flex-wrap gap-3">
                                                    {driver.payment_methods.map(method => (
                                                        <span key={method} className="px-4 py-2 bg-white border border-emerald-100 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                                                            {method === 'Efectivo' && '💵'}
                                                            {method === 'Transferencia Bancaria' && '🏦'}
                                                            {method === 'Tarjeta de Crédito/Débito' && '💳'}
                                                            {method === 'Pago en Línea' && '🌐'}
                                                            {method}
                                                        </span>
                                                    ))}
                                                </div>

                                                {driver.payment_link && driver.payment_methods?.includes('Pago en Línea') && (
                                                    <a
                                                        href={driver.payment_link.startsWith('http') ? driver.payment_link : `https://${driver.payment_link}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] group"
                                                    >
                                                        <Globe className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                                        Pagar en Línea ahora
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-aviva-subtext italic">No especificado</span>
                                        )}
                                    </div>
                                </section>

                                {/* Zones */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-amber-50 p-2 rounded-xl">
                                            <MapPin className="h-5 w-5 text-amber-800" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Zonas de Cobertura</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl text-sm">
                                        <div className="flex flex-wrap gap-2">
                                            {(driver.zones || []).length > 0 ? (
                                                (driver.zones || []).map(zone => (
                                                    <span key={zone} className="px-3 py-1 bg-white border border-amber-200 text-amber-900 rounded-lg font-bold shadow-sm">{zone}</span>
                                                ))
                                            ) : <span className="text-aviva-subtext italic">No especificado</span>}
                                        </div>
                                    </div>
                                </section>

                                {/* Languages */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-50 p-2 rounded-xl">
                                            <Globe className="h-5 w-5 text-aviva-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Idiomas</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                        <div className="flex flex-wrap gap-2">
                                            {(driver.languages || []).length > 0 ? (
                                                (driver.languages || []).map(lang => (
                                                    <span key={lang} className="px-3 py-1 bg-white border border-blue-100 text-aviva-primary rounded-lg text-sm font-bold shadow-sm">{lang}</span>
                                                ))
                                            ) : <span className="text-aviva-subtext italic">Español</span>}
                                        </div>
                                    </div>
                                </section>

                                {/* Indigenous Languages */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-purple-50 p-2 rounded-xl">
                                            <Globe className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Lenguas Indígenas</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                        {(driver.indigenous || []).length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {driver.indigenous?.map((lang: string) => (
                                                    <span key={lang} className="px-3 py-1 bg-white border border-purple-100 text-purple-600 rounded-lg text-sm font-bold shadow-sm">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-aviva-subtext italic">No se especificaron lenguas indígenas</span>
                                        )}
                                    </div>
                                </section>

                                {/* Transport Platforms */}
                                {driver.transport_platforms && driver.transport_platforms.length > 0 && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-gray-100 p-2 rounded-xl">
                                                <Car className="h-5 w-5 text-gray-700" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Plataformas donde opero</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {driver.transport_platforms.map(platform => (
                                                <div key={platform} className="px-4 py-2 bg-gray-700 border border-gray-700 rounded-xl text-sm font-bold text-white shadow-sm">
                                                    {platform}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-50 p-2 rounded-xl">
                                            <Clock className="h-5 w-5 text-aviva-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Horario y Disponibilidad</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
                                            const time = driver.schedule?.[day];
                                            const isActive = time && time.start !== '00:00' && time.end !== '00:00';

                                            return (
                                                <div key={day} className={`p-4 rounded-2xl border transition-all ${isActive ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-aviva-subtext mb-1">{day}</div>
                                                    <div className={`text-sm font-bold ${isActive ? 'text-aviva-navy' : 'text-gray-300'}`}>
                                                        {isActive ? `${time.start} - ${time.end}` : 'No disponible'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>

                            {/* Verification Badge */}
                            <div className="bg-blue-600 border border-blue-400/20 rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-blue-500/20">
                                <div className="bg-white/20 p-4 rounded-3xl shrink-0 backdrop-blur-md">
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1 text-center md:text-left text-white">
                                    <h4 className="text-xl font-bold mb-1 font-display">Perfil Verificado y Miembro AvivaGo</h4>
                                    <p className="text-blue-50 text-sm leading-relaxed opacity-90">
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

            <QuoteModal
                driverId={driver.id.toString()}
                driverName={driver.name}
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
            />
        </div>
    );
};

export default ProfileView;
