'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Trophy, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { OnboardingProgressResult, updateOnboardingFlag } from '@/lib/actions/onboarding';
import { TipModal } from './TipModal';
import Link from 'next/link';

interface OnboardingTrackerProps {
    progress: OnboardingProgressResult;
    driverId: string;
}

export function OnboardingTracker({ progress, driverId }: OnboardingTrackerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isExpanded, setIsExpanded] = useState(!progress.allCompleted);
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);

    // Calcula el porcentaje exacto de progreso
    const percentage = Math.round((progress.completedCount / progress.totalSteps) * 100);

    // Manejador genérico para CTAs clickeables del tracker (actualiza base de datos "flags")
    const handleActionClick = async (e: React.MouseEvent, stepId: number, ctaLink: string) => {
        // Si no es un enlace real sino un disparador de modal
        if (ctaLink === '#modal-tips') {
            e.preventDefault();
            setIsTipModalOpen(true);
            return;
        }

        // Para Pasos que solo requieren clics (compartir link, descargar QR)
        if (stepId === 4) {
            await updateFlag('has_shared_link');
        } else if (stepId === 5) {
            await updateFlag('has_downloaded_qr');
        } else if (stepId === 7) {
            await updateFlag('has_visited_clients');
        } else if (stepId === 8) {
            await updateFlag('has_visited_payments');
        }
    };

    const handleUnderstoodTips = async () => {
        setIsTipModalOpen(false);
        await updateFlag('has_viewed_tips');
    };

    const updateFlag = async (flagName: string) => {
        startTransition(async () => {
            await updateOnboardingFlag(driverId, flagName, true);
            router.refresh();
        });
    };

    if (progress.allCompleted && !isExpanded) {
        return (
            <div
                onClick={() => setIsExpanded(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 cursor-pointer text-white flex items-center justify-between shadow-md mb-6 hover:shadow-lg transition-all"
            >
                <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                    <span className="font-semibold text-sm sm:text-base">¡Perfil al 100%! Estás listo para dominar la ciudad.</span>
                </div>
                <ChevronDown className="w-5 h-5 opacity-70" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 transition-all duration-300">
            {/* Header del Tracker */}
            <div
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors border-b"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        🚀 Guía de Éxito AvivaGo
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Completa estos pasos para atraer más pasajeros y multiplicar tus ganancias.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-blue-600">{percentage}% Completado</span>
                        <div className="w-32 h-2.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                    <div className="p-1 bg-slate-100 rounded-full text-slate-500">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>
            </div>

            {/* Lista de Pasos Desplegable */}
            {isExpanded && (
                <div className="p-0 sm:p-2 bg-slate-50/50">
                    <div className="relative p-2 sm:p-4 space-y-2">

                        {/* Línea vertical de conexión visual */}
                        <div className="absolute top-8 bottom-8 left-6 sm:left-10 w-0.5 bg-slate-200 hidden sm:block" />

                        {progress.steps.map((step, index) => {
                            const completed = step.status === 'completed';
                            const isPremiumTarget = step.id === 8;

                            return (
                                <div key={step.id} className="relative flex items-start p-3 sm:p-4 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all group">

                                    {/* Icono de Check */}
                                    <div className="flex-shrink-0 relative z-10 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 bg-white">
                                        {completed ? (
                                            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
                                        )}
                                    </div>

                                    {/* Contenido del Paso */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-base font-semibold ${completed ? 'text-slate-500 line-through decoration-slate-300 opacity-80' : 'text-slate-800'} flex items-center gap-2`}>
                                            {step.title}
                                            {isPremiumTarget && !completed && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                                            {isPremiumTarget && completed && <Trophy className="w-4 h-4 text-yellow-500" />}
                                        </h3>
                                        <p className={`text-sm mt-1 mb-3 ${completed ? 'text-slate-400 opacity-80' : 'text-slate-600'}`}>
                                            {step.description}
                                        </p>

                                        {/* Botón CTA */}
                                        {(!completed || step.id === 4 || step.id === 5) && (
                                            <div className="inline-block flex-shrink-0">
                                                {step.isActionable ? (
                                                    <a
                                                        href={step.ctaLink}
                                                        onClick={(e) => handleActionClick(e, step.id, step.ctaLink)}
                                                        className={`inline-flex items-center text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${completed
                                                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            : isPremiumTarget
                                                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-sm'
                                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                                            }`}
                                                    >
                                                        {step.ctaText}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={step.ctaLink}
                                                        className={`inline-flex items-center text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${completed
                                                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            : isPremiumTarget
                                                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-sm'
                                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                                            }`}
                                                    >
                                                        {step.ctaText}
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tip Modal Component */}
            <TipModal
                isOpen={isTipModalOpen}
                onClose={() => setIsTipModalOpen(false)}
                onUnderstood={handleUnderstoodTips}
            />
        </div>
    );
}
