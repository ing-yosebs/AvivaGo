export interface DriverProfile {
    id: string | number;
    name: string;
    city: string;
    area: string;
    vehicle: string;
    year: number;
    photo: string;
    rating: number;
    reviews: number;
    price: number;
    year_joined?: string;
    tags: string[];
    bio: string;
    phone?: string;
    zones?: string[];
    languages?: string[];
    indigenous?: string[];
    schedule?: any;
    personality?: {
        social?: { label: string; desc: string };
        driving?: { label: string; desc: string };
        assistance?: { label: string; desc: string };
    };
    personal_bio?: string;
    transport_platforms?: string[];
    knows_sign_language?: boolean;
    social_commitment?: boolean;
    payment_methods?: string[];
    payment_link?: string;
    hasAcceptedQuote?: boolean;
}
