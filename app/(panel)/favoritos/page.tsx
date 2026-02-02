'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Heart,
    Star,
    MapPin,
    ShieldCheck,
    ChevronRight,
    Search,
    Car,
    Trash2
} from 'lucide-react'
import Link from 'next/link'
import DriverCard from '../../components/DriverCard'

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchFavorites = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Join favorites with driver_profiles and users
            const { data } = await supabase
                .from('favorites')
                .select(`
                    id,
                    is_locked,
                    driver_profile_id,
                    driver_profiles (
                        *,
                        users (
                            full_name,
                            avatar_url,
                            address_state
                        ),
                        vehicles (*),
                        driver_services (*)
                    )
                `)
                .eq('user_id', user.id)

            if (data) {
                const flattened = data.map(fav => ({
                    ...fav,
                    driver_profiles: Array.isArray(fav.driver_profiles) ? fav.driver_profiles[0] : fav.driver_profiles
                }))
                setFavorites(flattened)
            }
            setLoading(false)
        }
        fetchFavorites()
    }, [supabase])

    const handleUnfavorite = async (e: React.MouseEvent, favId: string) => {
        e.preventDefault()
        e.stopPropagation()
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favId)

        if (!error) {
            setFavorites(favorites.filter(f => f.id !== favId))
        }
    }

    if (loading) return <div className="animate-pulse space-y-4">
        <div className="h-10 bg-white/5 rounded-xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-white/5 rounded-3xl" />
            <div className="h-64 bg-white/5 rounded-3xl" />
        </div>
    </div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Mis Favoritos</h1>
                    <p className="text-zinc-400">Acceso rápido a los conductores que mejor servicio te han brindado.</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-2xl">
                    <Heart className="h-6 w-6 text-red-500 fill-current" />
                </div>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {favorites.map((fav) => (
                        <div key={fav.id} className="relative group/fav">
                            <DriverCard driver={fav.driver_profiles} />
                            {fav.is_locked ? (
                                <div
                                    className="absolute top-4 right-4 z-20 p-2.5 bg-amber-500/10 backdrop-blur-md rounded-xl text-amber-600 border border-amber-500/20 shadow-xl cursor-help"
                                    title="Tu Referente: No se puede eliminar"
                                >
                                    <ShieldCheck className="h-4 w-4 fill-current" />
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => handleUnfavorite(e, fav.id)}
                                    className="absolute top-4 right-4 z-20 p-2.5 bg-red-500/10 hover:bg-red-500 backdrop-blur-md rounded-xl text-red-500 hover:text-white border border-red-500/20 transition-all shadow-xl"
                                    title="Eliminar de favoritos"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center bg-white/5 rounded-[40px] border border-dashed border-white/10">
                    <Heart className="h-16 w-16 text-zinc-800 mx-auto mb-6" />
                    <h3 className="text-xl font-bold mb-2">Aún no tienes favoritos</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                        Explora nuestro directorio y guarda a los mejores conductores para tenerlos siempre a la mano.
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        Explorar Directorio
                    </Link>
                </div>
            )}
        </div>
    )
}
