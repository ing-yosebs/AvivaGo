"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DollarSign, Route as RouteIcon, Zap, Navigation, Map as MapIcon, Info } from "lucide-react";

interface ResultsViewProps {
    routes: any[];
    selectedRouteIndex: number;
    setSelectedRouteIndex: (idx: number) => void;
    costoTotalBasico: number;
    costoGasolina: number;
    costoPeajes: number;
    getDistanceInKm: () => number;
    formatDuration: (d: string) => string;
    calculateTollsForRoute: (r: any) => number;
    performance: number;
    gasPrice: number;
    litrosConsumidos: number;
    currentRoute: any;
    currency: string;
    countryCode: string;
}

export function ResultsView({
    routes,
    selectedRouteIndex,
    setSelectedRouteIndex,
    costoTotalBasico,
    costoGasolina,
    costoPeajes,
    getDistanceInKm,
    formatDuration,
    calculateTollsForRoute,
    performance,
    gasPrice,
    litrosConsumidos,
    currentRoute,
    currency,
    countryCode
}: ResultsViewProps) {
    if (routes.length === 0) return null;

    const unitLabel = countryCode === 'CO' ? 'Galones' : 'Litros';

    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {routes.length > 1 && (
                <div className="space-y-3 px-1">
                    <label className="text-slate-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                        <RouteIcon className="w-4 h-4" />
                        Elige una Ruta Sugerida
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {routes.map((r, idx) => {
                            const routeTolls = calculateTollsForRoute(r);
                            const hasTolls = routeTolls > 0;
                            const routeGas = (r.distanceMeters / 1000 / performance * gasPrice);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedRouteIndex(idx)}
                                    className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${selectedRouteIndex === idx
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02] z-10'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <p className="font-bold text-sm">Ruta {idx + 1}</p>
                                        {hasTolls && <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${selectedRouteIndex === idx ? 'bg-white text-indigo-600' : 'bg-amber-100 text-amber-700'}`}>Casetas</span>}
                                    </div>
                                    <p className={`text-xs ${selectedRouteIndex === idx ? 'text-indigo-100' : 'text-slate-500'}`}>
                                        {Math.round(r.distanceMeters / 1000)} km • {formatDuration(r.duration)}
                                    </p>
                                    <div className="mt-1 font-mono font-bold text-lg">
                                        ${(routeGas + routeTolls).toFixed(0)}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {currentRoute && (
                <div className="space-y-6">
                    <Card className="border-indigo-100 shadow-2xl bg-indigo-50/40 overflow-hidden border-2">
                        <div className="bg-indigo-600 p-5 text-white flex items-center justify-between">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <DollarSign className="w-6 h-6" />
                                Costo Estimado del Viaje
                            </h3>
                            <div className="text-right">
                                <p className="text-[10px] uppercase opacity-80 font-bold tracking-widest">Moneda</p>
                                <p className="font-black">{currency}</p>
                            </div>
                        </div>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-indigo-100 pb-8 gap-6">
                                <div className="text-center md:text-left">
                                    <p className="text-sm font-bold text-indigo-900/70 mb-2 uppercase tracking-tight">Costo Total Variable</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black text-indigo-900 leading-none">
                                            ${costoTotalBasico.toFixed(0)}
                                        </span>
                                        <span className="text-2xl font-bold text-indigo-400">.{(costoTotalBasico % 1).toFixed(2).split('.')[1]}</span>
                                    </div>
                                    <p className="text-sm text-indigo-600 font-bold mt-3 flex items-center gap-2 justify-center md:justify-start">
                                        <Zap className="w-4 h-4" />
                                        Cálculo basado en tráfico en vivo
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Distancia</p>
                                        <p className="text-2xl font-black text-indigo-900">{getDistanceInKm().toFixed(1)} <span className="text-xs font-bold text-slate-400">km</span></p>
                                    </div>
                                    <div className="text-center px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tiempo</p>
                                        <p className="text-2xl font-black text-indigo-900">{formatDuration(currentRoute.duration)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Navigation className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Combustible</p>
                                        <p className="text-2xl font-black text-indigo-900">${costoGasolina.toFixed(2)}</p>
                                        <p className="text-xs font-bold text-slate-600">{litrosConsumidos.toFixed(2)} {unitLabel} consumidos</p>
                                    </div>
                                </div>
                                <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 ${costoPeajes > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${costoPeajes > 0 ? 'bg-amber-100' : 'bg-slate-50'}`}>
                                        <MapIcon className={`w-6 h-6 ${costoPeajes > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Peajes (Casetas)</p>
                                        <p className={`text-2xl font-black ${costoPeajes > 0 ? 'text-amber-900' : 'text-indigo-900'}`}>
                                            ${costoPeajes.toFixed(2)}
                                        </p>
                                        <p className={`text-xs font-bold ${costoPeajes > 0 ? 'text-amber-700' : 'text-indigo-600/70'}`}>
                                            {costoPeajes > 0 ? 'Detectado en la ruta' : 'Sin peajes detectados'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Alert className="bg-amber-50 border-amber-200 text-amber-800 py-6 px-6 rounded-2xl border-2">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                <Info className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <AlertTitle className="text-amber-900 font-black text-lg mb-2 flex items-center gap-2">
                                    ¡Recuerda tus ganancias!
                                </AlertTitle>
                                <AlertDescription className="text-amber-800/80 text-sm leading-relaxed font-medium">
                                    Este cálculo muestra solo el <strong>Costo Directo Variable</strong>. Para ser rentable, suma siempre tu margen de ganancia, tiempo de espera y reserva un 15-20% extra para gastos fijos (Seguro, Verificación, Llantas).
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                </div>
            )}
        </div>
    );
}
