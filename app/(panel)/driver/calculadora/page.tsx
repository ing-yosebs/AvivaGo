"use client";

import { useState, useRef, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Map as MapIcon } from "lucide-react";

import { checkCalculatorQuota, incrementCalculatorUsage, CalculatorQuotaStatus } from "@/app/actions/calculator";
import { fetchRoutes, RouteResult } from "@/app/actions/google-routes";

// Components
import { QuotaBanner, LockedOverlay } from "./components/QuotaComponents";
import { RouteInputs } from "./components/RouteInputs";
import { MapView } from "./components/MapView";
import { ResultsView } from "./components/ResultsView";
import { UsageGuide } from "./components/UsageGuide";

const libraries: "places"[] = ["places"];

// Helper function to decode Google's polyline
function decodePolyline(encoded: string) {
    if (!encoded) return [];
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
        let b, shift = 0, result = 0;
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        lat += (result & 1) ? ~(result >> 1) : (result >> 1);
        shift = 0; result = 0;
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        lng += (result & 1) ? ~(result >> 1) : (result >> 1);
        poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return poly;
}

const DEFAULT_GAS_PRICE = 24.50;
const DEFAULT_PERFORMANCE = 12;

export default function CalculatorPage() {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
        language: "es",
        region: "MX",
    });

    const [gasPrice, setGasPrice] = useState<number>(DEFAULT_GAS_PRICE);
    const [performance, setPerformance] = useState<number>(DEFAULT_PERFORMANCE);
    const [origin, setOrigin] = useState<google.maps.places.PlaceResult | null>(null);
    const [destination, setDestination] = useState<google.maps.places.PlaceResult | null>(null);
    const [waypoints, setWaypoints] = useState<google.maps.places.PlaceResult[]>([]);
    const [routes, setRoutes] = useState<RouteResult[]>([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMSG, setErrorMSG] = useState<string>("");
    const [quota, setQuota] = useState<CalculatorQuotaStatus | null>(null);
    const [isLoadingQuota, setIsLoadingQuota] = useState(true);

    const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const destAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        let mounted = true;
        const loadQuota = async () => {
            try {
                const status = await checkCalculatorQuota();
                if (mounted) {
                    setQuota(status);
                    setIsLoadingQuota(false);

                    // Set defaults based on country if values are still at global defaults
                    if (status.countryCode === 'CO' && gasPrice === DEFAULT_GAS_PRICE) {
                        setGasPrice(15500); // Promedio Galón Colombia
                        setPerformance(35); // Promedio km/galón
                    }
                }
            } catch (error) { console.error("Failed to load quota", error); if (mounted) setIsLoadingQuota(false); }
        };
        loadQuota();
        return () => { mounted = false; };
    }, []);

    const calculateRoute = async () => {
        if (!origin?.place_id || !destination?.place_id) {
            setErrorMSG("Por favor selecciona un punto de origen y un destino válidos de la lista.");
            return;
        }
        setIsLoading(true);
        setErrorMSG("");
        if (quota && !quota.allowed) { setErrorMSG(quota.message || "No tienes cuota disponible."); setIsLoading(false); return; }
        try {
            const waypointIds = waypoints.filter(w => w.place_id).map(w => w.place_id as string);
            const result = await fetchRoutes(origin.place_id, destination.place_id, waypointIds);
            if (!result || !result.routes || result.routes.length === 0) {
                setErrorMSG(result?.error?.message || "No se encontraron rutas disponibles.");
                return;
            }
            setRoutes(result.routes);
            setSelectedRouteIndex(0);
            await incrementCalculatorUsage();
            if (quota && quota.limit !== 'unlimited') {
                setQuota({ ...quota, remaining: Math.max(0, quota.remaining - 1), allowed: quota.remaining - 1 > 0 });
            }
        } catch (error) { setErrorMSG("No se pudo calcular la ruta."); }
        finally { setIsLoading(false); }
    };

    const clearRoute = () => { setRoutes([]); setSelectedRouteIndex(0); setOrigin(null); setDestination(null); setWaypoints([]); };
    const addWaypoint = () => { if (waypoints.length < 5) setWaypoints([...waypoints, {} as google.maps.places.PlaceResult]); else setErrorMSG("Máximo 5 paradas."); };
    const removeWaypoint = (idx: number) => { const nw = [...waypoints]; nw.splice(idx, 1); setWaypoints(nw); };
    const updateWaypoint = (idx: number, p: google.maps.places.PlaceResult) => { const nw = [...waypoints]; nw[idx] = p; setWaypoints(nw); };

    const formatDuration = (dStr: string) => {
        const seconds = parseInt(dStr.replace('s', '')) || 0;
        const mins = Math.round(seconds / 60);
        if (mins < 60) return `${mins} min`;
        return `${Math.floor(mins / 60)} h ${mins % 60} min`;
    };

    const currentRoute = routes[selectedRouteIndex] || null;
    const distanceKm = (currentRoute?.distanceMeters || 0) / 1000;
    const litrosConsumidos = distanceKm / performance;
    const costoGasolina = litrosConsumidos * gasPrice;

    const calculateTolls = (r: RouteResult) => {
        if (!r?.travelAdvisory?.tollInfo?.estimatedPrice) return 0;
        const info = r.travelAdvisory.tollInfo.estimatedPrice[0];
        return parseFloat(info.units) + (info.nanos ? info.nanos / 1e9 : 0);
    };

    const costoPeajes = currentRoute ? calculateTolls(currentRoute) : 0;
    const costoTotal = costoGasolina + costoPeajes;

    if (loadError) return <div className="p-8 text-red-600">Error al cargar Google Maps.</div>;

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-indigo-950 flex items-center gap-2">
                    <MapIcon className="w-8 h-8 text-indigo-600" /> Calculadora de costos de viajes
                </h1>
                <p className="text-indigo-800/70 font-medium">Calcula el costo base de tus viajes para asegurar tu rentabilidad.</p>
            </div>

            <QuotaBanner quota={quota} />

            <div className={`space-y-8 relative transition-all duration-500 ${!isLoadingQuota && quota && !quota.allowed ? 'opacity-40 grayscale-[0.5] pointer-events-none select-none blur-[2px]' : ''}`}>
                <LockedOverlay quota={quota} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">
                    <RouteInputs
                        {...{
                            gasPrice, setGasPrice, performance, setPerformance, origin, setOrigin, destination, setDestination,
                            waypoints, addWaypoint, removeWaypoint, updateWaypoint, calculateRoute, clearRoute, isLoading, isLoaded,
                            errorMSG, countryCode: quota?.countryCode || 'MX', originAutocompleteRef, destAutocompleteRef
                        }}
                    />
                    <div className="lg:col-span-6 h-[400px] lg:h-auto min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-lg relative">
                        <MapView {...{
                            isLoaded, currentRoute, origin, destination, waypoints, decodePolyline,
                            countryCode: quota?.countryCode || 'MX'
                        }} />
                    </div>
                </div>

                <ResultsView
                    {...{
                        routes, selectedRouteIndex, setSelectedRouteIndex, costoTotalBasico: costoTotal, costoGasolina, costoPeajes,
                        getDistanceInKm: () => distanceKm, formatDuration, calculateTollsForRoute: calculateTolls, performance,
                        gasPrice, litrosConsumidos, currentRoute, currency: quota?.currency || 'MXN',
                        countryCode: quota?.countryCode || 'MX'
                    }}
                />

                <UsageGuide countryCode={quota?.countryCode || 'MX'} />
            </div>
        </div>
    );
}
