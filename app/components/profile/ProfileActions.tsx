import { FileText, Users, Heart, Share2, ShieldCheck, Check } from 'lucide-react';
import Link from 'next/link';
import { DriverProfile } from './types';

interface ProfileActionsProps {
    driver: DriverProfile;
    isFavorite: boolean;
    isLocked?: boolean;
    loadingFav: boolean;
    showShareFeedback: boolean;
    onQuote: () => void;
    onToggleFavorite: () => void;
    onShare: () => void;
    className?: string; // Add className prop
}

export default function ProfileActions({
    driver,
    isFavorite,
    isLocked = false,
    loadingFav,
    showShareFeedback,
    onQuote,
    onToggleFavorite,
    onShare,
    className = ''
}: ProfileActionsProps) {
    return (
        <div className={`bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] overflow-hidden p-6 sm:p-8 ${className}`}>
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

                {/* Referral Button */}
                {driver.referral_code && (
                    <Link
                        href={`/register?ref=${driver.referral_code}&redirect=/driver/${driver.id}`}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-indigo-500/25 group active:scale-[0.98]"
                    >
                        <Users className="h-5 w-5 fill-current" />
                        Regístrate con {driver.name.split(' ')[0]}
                    </Link>
                )}


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
