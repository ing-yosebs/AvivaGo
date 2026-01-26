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
    Check
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
        social_commitment?: boolean;
        payment_methods?: string[];
        payment_link?: string;
    }
}

const ProfileView = ({ driver }: ProfileViewProps) => {
    const supabase = createClient();
    // Initial state is locked (false) to show the contact information hidden
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFav, setLoadingFav] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [showShareFeedback, setShowShareFeedback] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
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

    // Check for URL param ?unlocked=true (Stripe Return)
    const searchParams = useSearchParams();
    const router = useRouter();

    // Check if unlocked on mount (DB check)
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

    useEffect(() => {
        checkUnlock();
    }, [driver.id, supabase]);

    // Popup Logic
    const openStripeCheckout = (url: string) => {
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            url,
            'StripeCheckout',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
        );

        if (!popup) {
            alert('Por favor habilita las ventanas emergentes para continuar con el pago.');
            return;
        }

        // Listener for the callback page
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.source === 'avivago-payment') {
                if (event.data.status === 'success') {
                    // Start manual verification to ensure DB persistence
                    if (event.data.sessionId) {
                        fetch('/api/checkout/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sessionId: event.data.sessionId })
                        }).then(async (res) => {
                            if (res.ok) {
                                setIsUnlocked(true);
                                checkUnlock(); // Final sync
                            } else {
                                const err = await res.text();
                                console.error('Verification failed:', err);
                                alert('Error al verificar el pago: ' + err);
                            }
                        });
                    } else {
                        setIsUnlocked(true);
                        checkUnlock();
                    }
                    alert('¡Pago completado con éxito!');
                } else {
                    alert('El pago fue cancelado o no se pudo procesar.');
                }
                window.removeEventListener('message', handleMessage);
            }
        };

        window.addEventListener('message', handleMessage);

        const timer = setInterval(() => {
            if (popup.closed) {
                clearInterval(timer);
                window.removeEventListener('message', handleMessage);
                checkUnlock(); // Refresh status just in case
            }
        }, 1000);
    };

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
                                        <div className="absolute bottom-0 left-1/2 -translate-x-12 translate-y-1 bg-indigo-500 p-1.5 rounded-full ring-4 ring-white shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse">
                                            <Users className="h-4 w-4 text-white fill-current" />
                                        </div>
                                    )}
                                </div>

                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold mb-2 tracking-tight text-aviva-navy font-display">{driver.name}</h1>

                                    {driver.social_commitment && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                                            <Users className="h-3 w-3 fill-current" />
                                            Conductor Comprometido
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
                                    {isUnlocked ? (
                                        <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                                            <div className="p-6 bg-green-50 border border-green-100 rounded-3xl text-center shadow-soft">
                                                <p className="text-green-600 font-bold text-[10px] uppercase tracking-widest mb-2">Contacto Desbloqueado</p>
                                                <p className="text-3xl font-mono font-bold text-gray-900 mb-6 tracking-wider">
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

                                            <p className="text-[10px] text-center text-gray-400 uppercase font-bold">Sin cargos adicionales por contacto directo</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-white border border-blue-100 rounded-3xl text-center shadow-soft ring-4 ring-blue-50/50">
                                                <p className="text-aviva-subtext text-xs font-bold uppercase tracking-wider mb-2">Costo para contactar</p>
                                                <h4 className="text-4xl font-extrabold text-aviva-navy mb-6 font-display">$18.00 <span className="text-sm font-medium text-gray-400">MXN</span></h4>

                                                <button
                                                    onClick={async () => {
                                                        setIsUnlocking(true);
                                                        try {
                                                            const { data: { user } } = await supabase.auth.getUser();
                                                            if (!user) {
                                                                router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
                                                                return;
                                                            }

                                                            // Check for Ban Status
                                                            const { data: userProfile } = await supabase
                                                                .from('users')
                                                                .select('is_banned')
                                                                .eq('id', user.id)
                                                                .single();

                                                            if (userProfile?.is_banned) {
                                                                alert('Tu cuenta tiene una restricción temporal. Contacta soporte.');
                                                                return;
                                                            }

                                                            // REAL Payment Flow (Unlock)
                                                            const response = await fetch('/api/checkout', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    type: 'unlock',
                                                                    driverId: driver.id,
                                                                    amount: 18.00,
                                                                    returnPath: window.location.pathname
                                                                })
                                                            });

                                                            if (!response.ok) {
                                                                const text = await response.text();
                                                                throw new Error(text);
                                                            }

                                                            const { url } = await response.json();
                                                            openStripeCheckout(url);

                                                        } catch (err: any) {
                                                            console.error('Checkout error:', err);
                                                            alert('Error iniciando pago: ' + err.message);
                                                        } finally {
                                                            setIsUnlocking(false);
                                                        }
                                                    }}
                                                    disabled={isUnlocking}
                                                    className="w-full flex items-center justify-center gap-3 bg-aviva-primary text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {isUnlocking ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Procesando...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Lock className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                                            Contactar ahora
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Protección al cliente</span>
                                            </div>
                                        </div>
                                    )}

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
                                    <p className="text-aviva-subtext text-lg leading-relaxed font-medium">
                                        {driver.bio}
                                    </p>
                                </section>

                                {driver.personal_bio && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-purple-50 p-2 rounded-xl">
                                                <User className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Sobre mí (Reseña Personal)</h3>
                                        </div>
                                        <p className="text-aviva-subtext text-lg leading-relaxed font-medium">
                                            {driver.personal_bio}
                                        </p>
                                    </section>
                                )}

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

                                                {isUnlocked && driver.payment_link && driver.payment_methods?.includes('Pago en Línea') && (
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
                                        <div className="bg-blue-50 p-2 rounded-xl">
                                            <MapPin className="h-5 w-5 text-aviva-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Zonas de Cobertura</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl text-sm">
                                        <div className="flex flex-wrap gap-2">
                                            {(driver.zones || []).length > 0 ? (
                                                (driver.zones || []).map(zone => (
                                                    <span key={zone} className="px-3 py-1 bg-white border border-blue-100 text-aviva-primary rounded-lg font-bold shadow-sm">{zone}</span>
                                                ))
                                            ) : <span className="text-aviva-subtext italic">No especificado</span>}
                                        </div>
                                    </div>
                                </section>

                                {/* Languages */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-purple-50 p-2 rounded-xl">
                                            <Globe className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Idiomas</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                        <div className="flex flex-wrap gap-2">
                                            {(driver.languages || []).length > 0 ? (
                                                (driver.languages || []).map(lang => (
                                                    <span key={lang} className="px-3 py-1 bg-white border border-purple-100 text-purple-600 rounded-lg text-sm font-bold shadow-sm">{lang}</span>
                                                ))
                                            ) : <span className="text-aviva-subtext italic">Español</span>}
                                        </div>
                                    </div>
                                </section>

                                {/* Indigenous Languages */}
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-emerald-50 p-2 rounded-xl">
                                            <Globe className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Lenguas Indígenas</h3>
                                    </div>
                                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                        {(driver.indigenous || []).length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {driver.indigenous?.map((lang: string) => (
                                                    <span key={lang} className="px-3 py-1 bg-white border border-emerald-100 text-emerald-600 rounded-lg text-sm font-bold shadow-sm">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-aviva-subtext italic">No se especificaron lenguas indígenas</span>
                                        )}
                                    </div>
                                </section>

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

                                {/* Transport Platforms */}
                                {driver.transport_platforms && driver.transport_platforms.length > 0 && (
                                    <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-emerald-50 p-2 rounded-xl">
                                                <Car className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Plataformas donde opero</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {driver.transport_platforms.map(platform => (
                                                <div key={platform} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-aviva-subtext shadow-sm">
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
                                        <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] relative overflow-hidden group shadow-soft">
                                            {/* Decorative Background Icon */}
                                            <Users className="absolute -right-4 -bottom-4 h-32 w-32 text-indigo-500/5 group-hover:scale-110 transition-transform duration-700" />

                                            <div className="flex items-start gap-6 relative z-10">
                                                <div className="bg-white p-4 rounded-2xl shadow-sm">
                                                    <Users className="h-8 w-8 text-indigo-600 fill-indigo-600/10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-bold text-indigo-700 font-display">Compromiso de Trato Igualitario</h3>
                                                    <p className="text-indigo-900/80 text-lg leading-relaxed font-medium italic">
                                                        "Me comprometo a brindar un trato cordial, respetuoso y equitativo a hombres, mujeres y a la comunidad LGBTQ+, sin distinción por ideologías o creencias religiosas de mis pasajeros."
                                                    </p>
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/70">Conductor Comprometido con la Inclusión</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <section>
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
        </div>
    );
};

export default ProfileView;
