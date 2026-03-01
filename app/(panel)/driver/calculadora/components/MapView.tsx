"use client";

import { GoogleMap, Polyline, Marker } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

interface MapViewProps {
    isLoaded: boolean;
    currentRoute: any;
    origin: google.maps.places.PlaceResult | null;
    destination: google.maps.places.PlaceResult | null;
    waypoints: google.maps.places.PlaceResult[];
    decodePolyline: (encoded: string) => { lat: number; lng: number }[];
    countryCode: string;
}

export function MapView({
    isLoaded,
    currentRoute,
    origin,
    destination,
    waypoints,
    decodePolyline,
    countryCode
}: MapViewProps) {
    if (!isLoaded) {
        return (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const defaultCenter = countryCode === 'CO'
        ? { lat: 4.7110, lng: -74.0721 } // Bogotá
        : { lat: 19.4326, lng: -99.1332 }; // CDMX

    return (
        <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={
                currentRoute
                    ? decodePolyline(currentRoute.polyline.encodedPolyline)[0]
                    : defaultCenter
            }
            zoom={12}
            options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        >
            {currentRoute && (
                <Polyline
                    path={decodePolyline(currentRoute.polyline.encodedPolyline)}
                    options={{
                        strokeColor: "#4f46e5",
                        strokeWeight: 5,
                        strokeOpacity: 0.8
                    }}
                />
            )}
            {origin?.geometry?.location && <Marker position={origin.geometry.location} label="A" />}
            {destination?.geometry?.location && <Marker position={destination.geometry.location} label="B" />}
            {waypoints.map((wp, i) => (
                wp.geometry?.location && <Marker key={i} position={wp.geometry.location} label={`${i + 1}`} />
            ))}
        </GoogleMap>
    );
}
