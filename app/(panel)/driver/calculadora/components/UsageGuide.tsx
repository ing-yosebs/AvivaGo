"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, Route as RouteIcon, MapPin, DollarSign, Zap, Users, Globe, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface UsageGuideProps {
    countryCode?: string;
}

export function UsageGuide({ countryCode }: UsageGuideProps) {
    const isColombia = countryCode === 'CO';

    return (
        <div className="max-w-4xl mx-auto w-full pt-4">
            <Card className="border-slate-200 shadow-sm bg-slate-50/80 rounded-2xl border-dashed">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 font-black text-indigo-950">
                        <HelpCircle className="w-5 h-5 text-indigo-600" />
                        Guía de Funcionamiento
                    </CardTitle>
                    <CardDescription className="font-bold text-indigo-800/60">¿Cómo calculamos estos números?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl border border-slate-100 flex gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                                <RouteIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h5 className="font-black text-sm text-indigo-950 mb-1">Rutas Sugeridas</h5>
                                <p className="text-xs text-indigo-800/70 leading-tight font-medium">Comparamos opciones (Rápida vs Libre) para que elijas la que genere más margen.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 flex gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h5 className="font-black text-sm text-indigo-950 mb-1">Cálculo por Escalas</h5>
                                <p className="text-xs text-indigo-800/70 leading-tight font-medium">Al añadir paradas, el sistema recalcula los peajes de cada tramo automáticamente.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 flex gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                                <DollarSign className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h5 className="font-black text-sm text-indigo-950 mb-1">Peajes Inteligentes</h5>
                                <p className="text-xs text-indigo-800/70 leading-tight font-medium">
                                    Datos oficiales de Google Routes API para costos de {
                                        countryCode === 'MX' ? 'casetas en México' :
                                            countryCode === 'CO' ? 'peajes en Colombia' :
                                                `peajes y rutas en tu región`
                                    }.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 flex gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                <Zap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h5 className="font-black text-sm text-indigo-950 mb-1">Combustible Inteligente</h5>
                                <p className="text-xs text-indigo-800/70 leading-tight font-medium">Ajustamos el consumo basado en el tráfico actual y tiempo de ralentí.</p>
                            </div>
                        </div>

                        {/* New International Section */}
                        <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex gap-4 shadow-sm md:col-span-2">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                <Globe className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h5 className="font-black text-sm text-indigo-950 mb-1">Detección Automática de País</h5>
                                <p className="text-xs text-indigo-900 leading-normal font-medium">
                                    Esta calculadora se configura automáticamente según el país de tu registro. Actualmente detectamos: <span className="font-bold text-indigo-700">
                                        {countryCode === 'MX' ? '🇲🇽 México (MXN, Litros)' :
                                            countryCode === 'CO' ? '🇨🇴 Colombia (COP, Galones)' :
                                                `${countryCode || 'Tu país'} (Configuración local activa)`}
                                    </span>.
                                </p>
                                <div className="mt-2 flex items-center gap-2 bg-amber-100/50 p-2 rounded-lg border border-amber-200">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    <p className="text-[10px] text-amber-800 font-bold leading-tight italic">
                                        ¿Ves unidades o monedas incorrectas? Asegúrate de tener bien configurada tu ubicación en tu Perfil Profesional.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6 text-white overflow-hidden relative border border-indigo-500/30 shadow-2xl">
                        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                            <Users className="w-48 h-48 text-white" />
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md border border-white/30 shadow-inner">
                            <Users className="w-9 h-9 text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-left z-10 space-y-1">
                            <h5 className="font-black text-xl text-white tracking-tight">¿Necesitas cálculos ilimitados?</h5>
                            <p className="text-white text-sm font-semibold opacity-100">Sube de nivel en el programa de embajadores invitando a nuevos usuarios.</p>
                        </div>
                        <Link href="/invitados" className="shrink-0 font-black bg-white text-indigo-700 px-8 py-3.5 rounded-xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-xl z-10 text-sm uppercase tracking-wider">
                            Ver mis referidos
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
