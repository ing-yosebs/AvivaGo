'use client';

import { X, Crown, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';

interface PremiumUpsellModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    feature?: string;
}

export default function PremiumUpsellModal({
    isOpen,
    onClose,
    title = "Característica Premium",
    message = "Para disfrutar de esta y muchas más funciones exclusivas, actualiza tu cuenta a Driver Premium.",
    feature
}: PremiumUpsellModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-aviva-navy/40 backdrop-blur-[2px] animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[24px] w-full max-w-sm shadow-xl relative animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-lg transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                            <Crown className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#0F2137] leading-tight">
                                {title}
                            </h2>
                            {feature && (
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                    Función Premium
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-2.5 mb-8">
                        {[
                            "Galería completa de 6 fotos",
                            "Múltiples vehículos registrados",
                            "Visible en catálogo nacional",
                            "Insignia de verificado"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span className="text-xs font-medium">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <Link
                            href="/perfil?tab=payments"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 w-full bg-[#0F2137] text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all active:scale-95 group text-sm"
                        >
                            Pasar a Premium
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                            onClick={onClose}
                            className="w-full text-gray-400 font-bold py-2 text-xs hover:text-gray-600 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
