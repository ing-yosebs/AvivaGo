import { ShieldCheck, Users, MapPin, Star, FileText, Heart, Check, Share2 } from 'lucide-react';
import { DriverProfile } from './types';

interface ProfileSidebarProps {
    driver: DriverProfile;
    isFavorite: boolean;
    isLocked?: boolean;
    loadingFav: boolean;
    showShareFeedback: boolean;
    onQuote: () => void;
    onToggleFavorite: () => void;
    onShare: () => void;
}

export default function ProfileSidebar({
    driver,
    isFavorite,
    isLocked = false,
    loadingFav,
    showShareFeedback,
    onQuote,
    onToggleFavorite,
    onShare
}: ProfileSidebarProps) {
    return (
        <div className="bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] overflow-hidden p-6 sm:p-8">
            <div className="relative mb-8 text-center pt-8">
                {/* Vehicle Side Photo Background */}
                {driver.vehicleSidePhoto && (
                    <div className="absolute top-0 left-0 w-full h-44 -z-0 pointer-events-none">
                        <div className="relative w-full h-full overflow-hidden rounded-t-[30px] sm:rounded-t-[40px]">
                            <img
                                src={driver.vehicleSidePhoto}
                                alt="Vista lateral del vehículo"
                                className="w-full h-full object-cover"
                            />
                            {/* Even more minimal fade at the bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent" />
                        </div>
                    </div>
                )}

                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-white shadow-2xl group relative z-10 bg-white aspect-square">
                    <img
                        src={driver.photo}
                        alt={driver.name}
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-blue-600/5 group-hover:opacity-0 transition-opacity" />
                </div>

                {/* Icons with higher z-index to stay on top - Adjusted for w-32 photo size */}
                <div className="absolute bottom-1 right-1/2 translate-x-12 translate-y-2 bg-green-500 p-1.5 rounded-full ring-4 ring-white z-20 shadow-lg">
                    <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                {driver.social_commitment && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-12 translate-y-2 bg-violet-500 p-1.5 rounded-full ring-4 ring-white shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse z-20">
                        <Users className="h-4 w-4 text-white fill-current" />
                    </div>
                )}
            </div>

            <div className="text-center mb-8 relative z-10">
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
                            onClick={onQuote}
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
                    onClick={onToggleFavorite}
                    disabled={loadingFav || isLocked}
                    className={`w-full flex items-center justify-center gap-3 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] ${isFavorite
                        ? isLocked
                            ? 'bg-amber-50 text-amber-600 border border-amber-100 cursor-not-allowed'
                            : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100/50'
                        : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-50 shadow-soft'
                        }`}
                >
                    {isLocked ? (
                        <ShieldCheck className="h-5 w-5 fill-current" />
                    ) : (
                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    )}
                    {isFavorite
                        ? isLocked
                            ? 'Tu Referente'
                            : 'En mis Favoritos'
                        : 'Agregar a Favoritos'}
                </button>

                <button
                    onClick={onShare}
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
    );
}
