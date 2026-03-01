"use client";

import { Award, AlertCircle, Lock, Zap } from "lucide-react";
import Link from "next/link";
import { CalculatorQuotaStatus } from "@/app/actions/calculator";

interface QuotaBannerProps {
    quota: CalculatorQuotaStatus | null;
}

export function QuotaBanner({ quota }: QuotaBannerProps) {
    if (!quota) return null;

    const isFree = !quota.hasMembership;

    return (
        <div className={`p-4 rounded-xl border ${quota.allowed ? (isFree ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100') : 'bg-red-50 border-red-100'} flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 transition-all`}>
            <div className="flex flex-col">
                <h3 className={`font-bold flex items-center gap-2 ${quota.allowed ? (isFree ? 'text-amber-900' : 'text-indigo-900') : 'text-red-900'}`}>
                    {quota.allowed
                        ? (isFree ? <Zap className="w-5 h-5 text-amber-600" /> : <Award className="w-5 h-5 text-indigo-600" />)
                        : <AlertCircle className="w-5 h-5 text-red-600" />
                    }
                    {quota.allowed
                        ? (isFree ? "Plan de Prueba (Gratuito)" : "Calculadora Premium Active")
                        : "Límite de Consultas Alcanzado"
                    }
                </h3>
                <p className={`text-sm mt-1 font-medium ${quota.allowed ? (isFree ? 'text-amber-700' : 'text-indigo-700') : 'text-red-700'}`}>
                    {isFree
                        ? (quota.allowed
                            ? `Como usuario sin membresía, tienes ${quota.remaining} cálculos de cortesía este mes.`
                            : "Has agotado tus 4 usos de prueba. Activa tu membresía para acceso ilimitado.")
                        : (quota.limit === 'unlimited'
                            ? "¡Felicidades! Tienes consultas ilimitadas por tu nivel de Embajador."
                            : `Tienes ${quota.remaining} cálculos restantes este mes. ¡Sigue creciendo tu red para ser nivel Oro!`)}
                </p>
            </div>
            {quota.limit !== 'unlimited' && (
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 flex items-center gap-3 shrink-0">
                    <span className="text-xs uppercase tracking-widest font-black text-slate-400">Consultas</span>
                    <span className={`text-2xl font-black ${isFree ? 'text-amber-600' : 'text-indigo-600'}`}>{quota.remaining}</span>
                    <span className="text-slate-200">/</span>
                    <span className="text-sm font-bold text-slate-400">{quota.limit}</span>
                </div>
            )}
        </div>
    );
}

export function LockedOverlay({ quota }: { quota: CalculatorQuotaStatus | null }) {
    if (!quota || quota.allowed) return null;

    const isFree = !quota.hasMembership;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto animate-in fade-in zoom-in-95 duration-300 px-4">
            <div className="bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col items-center text-center max-w-lg w-full ring-1 ring-black/5">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-inner ${isFree ? 'bg-amber-50' : 'bg-red-50'}`}>
                    <Lock className={`w-12 h-12 ${isFree ? 'text-amber-500' : 'text-red-500'}`} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">¡Límite Alcanzado!</h2>
                <p className="text-slate-600 text-lg mb-10 leading-relaxed font-medium">
                    {isFree
                        ? "Has utilizado tus 4 cálculos gratuitos de este mes. ¡Es momento de profesionalizar tu negocio con la versión completa!"
                        : "Has alcanzado el límite de tu cuota Premium mensual. Recuerda que puedes aumentarla invitando a más conductores."}
                </p>

                {!quota.hasMembership ? (
                    <div className="w-full space-y-4">
                        <Link href="/perfil?tab=payments" className="block w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg">
                            Activar Membresía Profesional
                        </Link>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Calculadora ilimitada y más beneficios</p>
                    </div>
                ) : (
                    <Link href="/invitados" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg">
                        Aumentar mi Cuota Ahora
                    </Link>
                )}
            </div>
        </div>
    );
}
