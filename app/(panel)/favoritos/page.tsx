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
    Car
} from 'lucide-react'
import Link from 'next/link'

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
                    driver_profile_id,
                    driver_profiles (
                        id,
                        city,
                        average_rating,
                        profile_photo_url,
                        users (
                            full_name
                        )
                    )
                `)
                .eq('user_id', user.id)

            // Mock data if empty to show the design
            if (!data || data.length === 0) {
                setFavorites([
                    {
                        id: 'mock-1',
                        driver_profiles: {
                            id: '1',
                            city: 'Santa Tecla',
                            average_rating: 5.0,
                            profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
                            users: { full_name: 'Carlos Mendoza' }
                        }
                    },
                    {
                        id: 'mock-2',
                        driver_profiles: {
                            id: '2',
                            city: 'San Salvador',
                            average_rating: 4.9,
                            profile_photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
                            users: { full_name: 'Roberto Sanchez' }
                        }
                    }
                ])
            } else {
                setFavorites(data)
            }
            setLoading(false)
        }
        fetchFavorites()
    }, [supabase])

    if (loading) return <div className="animate-pulse space-y-4">
        <div className="h-10 bg-white/5 rounded-xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => (
                        <div key={fav.id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:bg-white/[0.07] transition-all duration-300">
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <img
                                    src={fav.driver_profiles.profile_photo_url}
                                    alt={fav.driver_profiles.users.full_name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                                <button className="absolute top-4 right-4 p-2 bg-zinc-950/50 backdrop-blur-md rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <Heart className="h-4 w-4 fill-current" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg">{fav.driver_profiles.users.full_name}</h3>
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                        <Star className="h-4 w-4 fill-current" />
                                        {fav.driver_profiles.average_rating}.0
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-6">
                                    <MapPin className="h-4 w-4" />
                                    <span>{fav.driver_profiles.city}</span>
                                    <span className="mx-1">•</span>
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    <span className="text-emerald-500/80 font-medium">Verificado</span>
                                </div>

                                <Link
                                    href={`/driver/${fav.driver_profiles.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm hover:bg-white hover:text-black transition-all group/btn"
                                >
                                    Ver Perfil Completo
                                    <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
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
