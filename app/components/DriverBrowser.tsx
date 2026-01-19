'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import DriverCard from './DriverCard';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Search, Filter } from 'lucide-react';

export default function DriverBrowser() {
    const [searchTerm, setSearchTerm] = useState('');
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchDrivers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('driver_profiles')
                .select(`
                    id,
                    bio,
                    profile_photo_url,
                    city,
                    average_rating,
                    users (
                        full_name,
                        email
                    ),
                    vehicles (
                        brand,
                        model,
                        year
                    )
                `)
                .eq('status', 'active')
                .eq('is_visible', true);

            if (error) {
                console.error('Error fetching drivers:', error);
            } else {
                setDrivers(data || []);
            }
            setLoading(false);
        };

        fetchDrivers();
    }, [supabase]);

    const filteredDrivers = drivers.filter(driver => {
        const term = searchTerm.toLowerCase();
        const fullName = driver.users?.full_name?.toLowerCase() || '';
        const city = driver.city?.toLowerCase() || '';
        const vehicle = driver.vehicles?.[0] ? `${driver.vehicles[0].brand} ${driver.vehicles[0].model}`.toLowerCase() : '';

        return (
            fullName.includes(term) ||
            city.includes(term) ||
            vehicle.includes(term) ||
            driver.bio?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <Header />

            {/* Search and Filter Section below Header */}
            <div className="pt-24 pb-6 px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 shadow-2xl">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="¿A quién buscas? (Nombre, ciudad o tipo de vehículo...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0 text-lg"
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all w-full md:w-auto justify-center">
                            <Filter className="h-4 w-4" />
                            <span>Filtros Avanzados</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex-1 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-10">
                        <h1 className="text-4xl font-bold tracking-tight mb-3">
                            Conductores Profesionales
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-2xl">
                            Encuentra conductores verificados en tu zona. Seguridad, confianza y trato directo.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 text-white animate-spin opacity-20" />
                            <p className="text-zinc-500 animate-pulse">Cargando conductores...</p>
                        </div>
                    ) : filteredDrivers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                            {filteredDrivers.map(driver => (
                                <DriverCard key={driver.id} driver={driver} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 backdrop-blur-xl bg-white/5 border border-dashed border-white/10 rounded-3xl">
                            <div className="flex justify-center mb-4 text-zinc-600">
                                <Search className="h-12 w-12" />
                            </div>
                            <p className="text-zinc-400 text-lg">No encontramos conductores que coincidan con tu búsqueda.</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-white font-medium hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
