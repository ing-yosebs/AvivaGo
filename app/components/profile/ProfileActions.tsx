import { FileText, Users, UserPlus } from 'lucide-react';
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
    className?: string;
}

export default function ProfileActions({
    driver,
    onQuote,
    className = ''
}: ProfileActionsProps) {
    return (
        <div className={`bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] overflow-hidden p-6 sm:p-8 ${className}`}>
            <div className="space-y-4">
                {/* Quote Request Section */}
                <div className="space-y-4 animate-in fade-in zoom-in duration-500 pb-2">
                    <p className="text-aviva-subtext text-center text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70">Agenda tu viaje</p>
                    <button
                        onClick={onQuote}
                        className="w-full flex items-center justify-center gap-3 bg-aviva-primary text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 group active:scale-[0.98]"
                    >
                        <FileText className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                        Solicitar Cotización
                    </button>

                    <p className="text-center text-[10px] text-gray-400 leading-snug px-2">
                        Sin compromiso. El conductor te contactará con los detalles si acepta tu solicitud.
                    </p>
                </div>

                {/* Referral Button */}
                {driver.referral_code && (
                    <Link
                        href={`/register?ref=${driver.referral_code}&redirect=/driver/${driver.id}`}
                        className="w-full relative flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-5 rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-indigo-500/25 group active:scale-[0.98] px-12"
                    >
                        <UserPlus className="absolute left-6 h-6 w-6 opacity-90 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-widest opacity-80 leading-none mb-1">Regístrate con</span>
                            <span className="text-sm leading-tight text-center">{driver.name}</span>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}
