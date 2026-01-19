import { createClient } from '@/lib/supabase/client';
import ProfileView from '../../components/ProfileView';
import Header from '../../components/Header';

export default async function DriverPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    // Fetch driver profile from Supabase
    const { data: driver, error } = await supabase
        .from('driver_profiles')
        .select(`
            *,
            users (
                full_name,
                email,
                avatar_url
            ),
            vehicles (*)
        `)
        .eq('id', params.id)
        .single();

    if (error || !driver) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <Header />
                <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] max-w-sm backdrop-blur-xl">
                    <h1 className="text-2xl font-bold text-white mb-2">Conductor no encontrado</h1>
                    <p className="text-zinc-500 mb-6">El perfil que buscas no existe o ha sido desactivado.</p>
                    <a href="/" className="inline-block bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                        Volver al Inicio
                    </a>
                </div>
            </div>
        );
    }

    // Convert Supabase driver data to the format expected by ProfileView
    const formattedDriver = {
        id: driver.id,
        name: driver.users?.full_name || 'Conductor AvivaGo',
        city: driver.city,
        area: driver.city, // Using city as area for now
        vehicle: driver.vehicles?.[0] ? `${driver.vehicles[0].brand} ${driver.vehicles[0].model}` : 'Vehículo Confort',
        year: driver.vehicles?.[0]?.year || 2022,
        photo: driver.profile_photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop',
        rating: Number(driver.average_rating) || 5.0,
        reviews: driver.total_reviews || 0,
        price: 2.00, // Fixed price for now
        year_joined: new Date(driver.created_at).getFullYear().toString(),
        tags: ["Verificado", "Seguro"], // Mock tags for now
        bio: driver.bio || "Conductor profesional comprometido con tu seguridad y puntualidad.",
        phone: driver.whatsapp_number
    };

    return <ProfileView driver={formattedDriver} />;
}
