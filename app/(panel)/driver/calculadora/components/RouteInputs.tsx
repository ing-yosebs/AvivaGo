"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Autocomplete } from "@react-google-maps/api";
import { DollarSign, Navigation, MapPin, Trash2, GripVertical, Plus, Loader2 } from "lucide-react";
import { MutableRefObject } from "react";

interface RouteInputsProps {
    gasPrice: number;
    setGasPrice: (v: number) => void;
    performance: number;
    setPerformance: (v: number) => void;
    origin: google.maps.places.PlaceResult | null;
    setOrigin: (p: google.maps.places.PlaceResult) => void;
    destination: google.maps.places.PlaceResult | null;
    setDestination: (p: google.maps.places.PlaceResult) => void;
    waypoints: google.maps.places.PlaceResult[];
    addWaypoint: () => void;
    removeWaypoint: (idx: number) => void;
    updateWaypoint: (idx: number, p: google.maps.places.PlaceResult) => void;
    calculateRoute: () => void;
    clearRoute: () => void;
    isLoading: boolean;
    isLoaded: boolean;
    errorMSG: string;
    countryCode: string;
    originAutocompleteRef: MutableRefObject<google.maps.places.Autocomplete | null>;
    destAutocompleteRef: MutableRefObject<google.maps.places.Autocomplete | null>;
}

export function RouteInputs({
    gasPrice, setGasPrice, performance, setPerformance,
    origin, setOrigin, destination, setDestination,
    waypoints, addWaypoint, removeWaypoint, updateWaypoint,
    calculateRoute, clearRoute, isLoading, isLoaded, errorMSG,
    countryCode, originAutocompleteRef, destAutocompleteRef
}: RouteInputsProps) {
    return (
        <div className="lg:col-span-6 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-indigo-950">Tus Parámetros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gasPrice" className="text-indigo-900/80 font-bold text-xs uppercase tracking-wide">Precio Combustible ({countryCode === 'CO' ? '$/Galón' : '$/L'})</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="gasPrice"
                                    type="number"
                                    step={countryCode === 'CO' ? '50' : '0.10'}
                                    min="1"
                                    className="pl-9"
                                    value={gasPrice}
                                    onChange={(e) => setGasPrice(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="performance" className="text-indigo-900/80 font-bold text-xs uppercase tracking-wide">Rendimiento ({countryCode === 'CO' ? 'km/Galón' : 'km/L'})</Label>
                            <div className="relative">
                                <Navigation className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="performance"
                                    type="number"
                                    step="0.5"
                                    min="1"
                                    className="pl-9"
                                    value={performance}
                                    onChange={(e) => setPerformance(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-indigo-950">Ruta del Viaje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {!isLoaded ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                    ) : (
                        <>
                            <div className="space-y-2 relative">
                                <Label className="text-sm font-bold text-indigo-900/80">Punto de Origen (A)</Label>
                                <div className="flex relative items-center">
                                    <MapPin className="absolute left-3 h-5 w-5 text-emerald-500 z-10" />
                                    <Autocomplete
                                        onLoad={(auto) => { originAutocompleteRef.current = auto }}
                                        onPlaceChanged={() => {
                                            if (originAutocompleteRef.current) {
                                                const place = originAutocompleteRef.current.getPlace();
                                                if (place.geometry) setOrigin(place);
                                            }
                                        }}
                                        className="w-full"
                                        options={{ componentRestrictions: { country: countryCode.toLowerCase() } }}
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Buscar origen..."
                                            defaultValue={origin?.formatted_address || ""}
                                            className="pl-10 w-full bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-sm"
                                        />
                                    </Autocomplete>
                                </div>
                            </div>

                            {waypoints.map((wp, idx) => (
                                <div key={idx} className="space-y-1 relative animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-slate-400">Parada intermedia {idx + 1}</Label>
                                        <button onClick={() => removeWaypoint(idx)} className="text-slate-300 hover:text-red-500 transition-colors" type="button">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex relative items-center">
                                        <GripVertical className="absolute left-3 h-4 w-4 text-slate-300 z-10" />
                                        <Autocomplete
                                            onLoad={(auto) => {
                                                auto.addListener("place_changed", () => {
                                                    const place = auto.getPlace();
                                                    if (place.geometry) updateWaypoint(idx, place);
                                                });
                                            }}
                                            className="w-full"
                                            options={{ componentRestrictions: { country: countryCode.toLowerCase() } }}
                                        >
                                            <Input
                                                type="text"
                                                placeholder="Buscar parada..."
                                                defaultValue={wp.formatted_address || ""}
                                                className="pl-10 w-full bg-slate-50/50 border-dashed border-slate-200 focus-visible:ring-indigo-400 text-sm h-9"
                                            />
                                        </Autocomplete>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-center -my-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={addWaypoint}
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-bold gap-1.5"
                                    type="button"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Añadir Parada
                                </Button>
                            </div>

                            <div className="space-y-2 relative">
                                <Label className="text-sm font-bold text-indigo-900/80">Punto de Destino (B)</Label>
                                <div className="flex relative items-center">
                                    <MapPin className="absolute left-3 h-5 w-5 text-indigo-500 z-10" />
                                    <Autocomplete
                                        onLoad={(auto) => { destAutocompleteRef.current = auto }}
                                        onPlaceChanged={() => {
                                            if (destAutocompleteRef.current) {
                                                const place = destAutocompleteRef.current.getPlace();
                                                if (place.geometry) setDestination(place);
                                            }
                                        }}
                                        className="w-full"
                                        options={{ componentRestrictions: { country: countryCode.toLowerCase() } }}
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Buscar destino..."
                                            defaultValue={destination?.formatted_address || ""}
                                            className="pl-10 w-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 text-sm"
                                        />
                                    </Autocomplete>
                                </div>
                            </div>

                            {errorMSG && (
                                <p className="text-sm text-red-500 font-medium">{errorMSG}</p>
                            )}

                            <div className="pt-2 flex gap-3">
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base font-bold shadow-lg shadow-indigo-200"
                                    onClick={calculateRoute}
                                    disabled={isLoading || !isLoaded}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Calcular Ruta"}
                                </Button>
                                <Button variant="outline" onClick={clearRoute} type="button" className="h-11">
                                    Limpiar
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
