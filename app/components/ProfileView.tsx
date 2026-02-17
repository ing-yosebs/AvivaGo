'use client';

import { useState, useEffect } from 'react';
import TrustFooter from '@/app/components/marketing/v1/TrustFooter';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import ReviewModal from './ReviewModal';
import ReportModal from './ReportModal';
import QuoteModal from './QuoteModal';
import AuthRequiredModal from './AuthRequiredModal';
import { DriverProfile } from './profile/types';
import ProfileHeader from './profile/ProfileHeader';
import ProfileInfo from './profile/ProfileInfo';
import ProfileActions from './profile/ProfileActions';
import ProfileAbout from './profile/ProfileAbout';
import ProfileFeatures from './profile/ProfileFeatures';
import ProfileDetails from './profile/ProfileDetails';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProfileViewProps {
    driver: DriverProfile;
}

const ProfileView = ({ driver }: ProfileViewProps) => {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFav, setLoadingFav] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [showShareFeedback, setShowShareFeedback] = useState(false);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const hasViewedRef = useState(false);

    // Auth Modal State
    const [authModalConfig, setAuthModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        intent?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        intent: undefined
    });

    useEffect(() => {
        const checkIntent = async () => {
            const intent = searchParams.get('intent');
            if (intent === 'quote') {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setIsQuoteModalOpen(true);
                    // Optional: Clear the param from URL without reload to avoid re-opening on refresh
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                }
            }
        };
        checkIntent();
    }, [searchParams, supabase]);

    useEffect(() => {
        const registerView = async () => {
            // Basic strict mode check or session check to prevent double count in dev
            if (hasViewedRef[0]) return;
            hasViewedRef[1](true);

            // Call RPC to increment view
            await supabase.rpc('increment_profile_view', { profile_id: driver.id });

            // Track Facebook Pixel 'ViewContent'
            if (typeof window.fbq !== 'undefined') {
                window.fbq('track', 'ViewContent', {
                    content_name: driver.name,
                    content_type: 'product',
                    content_ids: [driver.id.toString()],
                    content_category: 'Driver Profile'
                });
            }
        };
        registerView();
    }, [driver.id, driver.name, supabase]);

    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const checkFavorite = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoadingFav(false);
                return;
            }

            const { data } = await supabase
                .from('favorites')
                .select('id, is_locked')
                .eq('user_id', user.id)
                .eq('driver_profile_id', driver.id)
                .single();

            if (data) {
                setIsFavorite(true);
                setIsLocked(data.is_locked || false);
            }
            setLoadingFav(false);
        };
        checkFavorite();
    }, [driver.id, supabase]);

    const handleQuoteRequest = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setAuthModalConfig({
                isOpen: true,
                title: 'Solicitar Cotización',
                message: 'Para solicitar una cotización a este conductor, necesitas tener una cuenta de usuario en AvivaGo.',
                intent: 'quote'
            });
            return;
        }

        setIsQuoteModalOpen(true);
    };

    const toggleFavorite = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setAuthModalConfig({
                isOpen: true,
                title: 'Agregar a Favoritos',
                message: 'Para guardar conductores en tus favoritos, necesitas iniciar sesión.'
            });
            return;
        }

        if (isFavorite) {
            if (isLocked) {
                alert('No puedes eliminar a este conductor de favoritos porque es quien te invitó a la plataforma.');
                return;
            }

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

            <main className="flex-1 pt-8 sm:pt-12 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Mobile Sticky Header - Placed outside grid to ensure sticky works */}
                    <div className="lg:hidden sticky top-0 z-40 -mx-4 sm:mx-0 mb-2 px-4 sm:px-0 bg-gray-50/95 backdrop-blur-sm pt-0 pb-2 transition-all">
                        <div className="shadow-xl rounded-b-[30px] sm:rounded-b-[40px] overflow-hidden bg-white pt-2">
                            <ProfileHeader driver={driver} className="border-none shadow-none pb-0 mb-0 rounded-none rounded-b-[30px]" />
                        </div>
                    </div>

                    {/* Mobile Info - Just below sticky header */}
                    <div className="lg:hidden mb-6">
                        <ProfileInfo driver={driver} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Sidebar (Desktop & Mobile Actions) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Desktop Header containing both Image+Name and Details */}
                            <div className="hidden lg:block bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] overflow-hidden pb-6">
                                <ProfileHeader driver={driver} className="border-none shadow-none rounded-none mb-0" />
                                <ProfileInfo driver={driver} />
                            </div>

                            <ProfileActions
                                driver={driver}
                                isFavorite={isFavorite}
                                isLocked={isLocked}
                                loadingFav={loadingFav}
                                showShareFeedback={showShareFeedback}
                                onQuote={handleQuoteRequest}
                                onToggleFavorite={toggleFavorite}
                                onShare={handleShare}
                            />
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                            <ProfileAbout driver={driver} />

                            <ProfileFeatures driver={driver} />

                            <ProfileDetails driver={driver} />

                            {/* Verification Badge */}
                            {(driver.is_verified && driver.is_premium) && (
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
                            )}
                        </div>
                    </div>
                </div>
            </main>


            <div className="bg-gray-50 border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    {(driver.is_verified || driver.is_premium) ? (
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-2">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Conductor Verificado</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto">
                                <strong>Aviso:</strong> Este conductor ha completado nuestro proceso de validación de identidad y antecedentes. Sin embargo, AvivaGo recuerda a los usuarios que el conductor sigue siendo el único responsable de la calidad y cumplimiento de los servicios ofrecidos.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-bold mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Aviso Importante</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto">
                                <strong>Renuncia de Responsabilidad:</strong> La información contenida en esta página es responsabilidad directa del conductor. AvivaGo no se hace responsable de ningún acto fraudulento, servicio deficiente o incumplimiento de lo ofrecido. Te recomendamos revisar nuestros <a href="/legales/terminos-y-condiciones" className="text-blue-600 hover:underline">Términos y Condiciones</a> antes de contratar. AvivaGo se reserva el derecho de suspender este perfil sin previo aviso si se detectan violaciones a nuestras políticas.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => setIsReportOpen(true)}
                        className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest border-b border-transparent hover:border-red-500"
                    >
                        ¿Tienes algún reporte sobre este perfil?
                    </button>
                </div>
            </div>

            <TrustFooter />

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                driverId={String(driver.id)}
                driverName={driver.name}
            />

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                driverId={String(driver.id)}
                driverName={driver.name}
            />

            <QuoteModal
                driverId={driver.id.toString()}
                driverName={driver.name}
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
            />

            <AuthRequiredModal
                isOpen={authModalConfig.isOpen}
                onClose={() => setAuthModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={authModalConfig.title}
                message={authModalConfig.message}
                redirectUrl={typeof window !== 'undefined'
                    ? `${window.location.pathname}${authModalConfig.intent ? `?intent=${authModalConfig.intent}` : ''}`
                    : ''
                }
            />
        </div>
    );
};

export default ProfileView;
