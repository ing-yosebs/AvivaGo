'use server'

export type TollInfo = {
    estimatedPrice?: [
        {
            currencyCode: string;
            units: string;
            nanos?: number;
        }
    ];
};

export type RouteResult = {
    distanceMeters: number;
    duration: string; // e.g., "1500s"
    polyline: {
        encodedPolyline: string;
    };
    travelAdvisory?: {
        tollInfo?: TollInfo;
    };
};

export type RoutesResponse = {
    routes: RouteResult[];
    error?: {
        message: string;
        status: string;
    }
};

export async function fetchRoutes(
    originPlaceId: string,
    destinationPlaceId: string,
    waypointPlaceIds: string[] = []
): Promise<RoutesResponse | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error("Missing Google Maps API Key in environment variables.");
        return null;
    }

    const requestBody: any = {
        origin: {
            placeId: originPlaceId
        },
        destination: {
            placeId: destinationPlaceId
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE_OPTIMAL",
        computeAlternativeRoutes: waypointPlaceIds.length === 0, // Alternatives aren't supported with intermediates in some regions/quotas, keeping it simple
        routeModifiers: {
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false
        },
        extraComputations: ["TOLLS"],
        languageCode: "es-419",
        units: "METRIC"
    };

    if (waypointPlaceIds.length > 0) {
        requestBody.intermediates = waypointPlaceIds.map(id => ({ placeId: id }));
    }

    // The fields we want the API to return. Limiting this reduces data transfer and cost if applicable.
    const fieldMask = "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.travelAdvisory";

    try {
        const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": fieldMask
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error from Google Routes API:", data);
            return {
                routes: [],
                error: {
                    message: data.error?.message || "Error al comunicarse con Google Routes",
                    status: data.error?.status || "UNKNOWN"
                }
            };
        }

        return data as RoutesResponse;

    } catch (error) {
        console.error("Error calling Google Routes API:", error);
        return null; // Return null on complete failure
    }
}
