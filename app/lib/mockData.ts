export interface Driver {
    id: number;
    name: string;
    city: string;
    area: string;
    vehicle: string;
    year: number;
    photo: string;
    rating: number;
    reviews: number;
    price: number;
    year_joined?: string; // Optional since not all mock data might have it initially, but good for profile
    tags: string[];
    bio: string;
    phone?: string; // For the profile unlock
}

export const MOCK_DRIVERS: Driver[] = [
    {
        id: 1,
        name: "Juan Pérez",
        city: "Bogotá",
        area: "Norte / Aeropuerto",
        vehicle: "Toyota Corolla",
        year: 2022,
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
        rating: 4.9,
        reviews: 124,
        price: 2.00,
        year_joined: "2021",
        phone: "+57 300 123 4567",
        tags: ["Ejecutivo", "Bilingüe", "Aeropuerto"],
        bio: "Conductor profesional enfocado en el sector corporativo. Puntualidad estricta y vehículo de gama media-alta siempre impecable."
    },
    {
        id: 2,
        name: "María Gómez",
        city: "Medellín",
        area: "Poblado / Llano Grande",
        vehicle: "Mazda CX-5",
        year: 2023,
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
        rating: 5.0,
        reviews: 89,
        price: 2.50,
        year_joined: "2023",
        phone: "+57 310 987 6543",
        tags: ["Blindado", "Turismo", "Seguridad"],
        bio: "Experta en seguridad y turismo vip. Ofrezco recorridos privados a zonas turísticas y transporte seguro para ejecutivos."
    },
    {
        id: 3,
        name: "Carlos Rodríguez",
        city: "Cali",
        area: "Sur / Pance",
        vehicle: "Kia Sportage",
        year: 2021,
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80",
        rating: 4.8,
        reviews: 56,
        price: 1.50,
        year_joined: "2022",
        phone: "+57 315 555 1212",
        tags: ["Viajes Largos", "Mensajería", "Mascotas"],
        bio: "Disponibilidad 24/7 para viajes expresos a otras ciudades. Pet friendly y amplia capacidad de equipaje."
    }
];
