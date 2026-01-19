'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    MessageSquare,
    Star,
    TrendingUp,
    User,
    Search,
    ThumbsUp,
    Share2,
    CheckCircle2
} from 'lucide-react'

export default function CommunityPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchPosts = async () => {
            // In a real scenario, we fetch from DB
            // For now, let's have some beautiful mock content to show the "Red Social" feel
            const mockPosts = [
                {
                    id: 1,
                    reviewer: 'Elena Rodriguez',
                    driver: 'Carlos Mendoza',
                    rating: 5,
                    comment: 'Excelente servicio, muy puntual y el vehículo estaba impecable. Recomendado para viajes al aeropuerto.',
                    time: 'Hace 2 horas',
                    city: 'Santa Tecla',
                    likes: 12,
                    isVerified: true
                },
                {
                    id: 2,
                    reviewer: 'Marco Tulio',
                    driver: 'Roberto Sanchez',
                    rating: 4,
                    comment: 'Buen conductor, conoce muy bien las rutas alternativas para evitar el tráfico de las horas pico.',
                    time: 'Hace 5 horas',
                    city: 'San Salvador',
                    likes: 8,
                    isVerified: true
                },
                {
                    id: 3,
                    reviewer: 'Ana Maria',
                    driver: 'Carlos Mendoza',
                    rating: 5,
                    comment: 'Muy amable y servicial, nos ayudó con todas las maletas. El viaje fue muy tranquilo.',
                    time: 'Ayer',
                    city: 'Antiguo Cuscatlán',
                    likes: 24,
                    isVerified: true
                }
            ]

            setPosts(mockPosts)
            setLoading(false)
        }
        fetchPosts()
    }, [])

    if (loading) return <div className="animate-pulse space-y-4">
        <div className="h-10 bg-white/5 rounded-xl w-1/3" />
        <div className="space-y-6">
            <div className="h-48 bg-white/5 rounded-3xl" />
            <div className="h-48 bg-white/5 rounded-3xl" />
        </div>
    </div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Comunidad</h1>
                    <p className="text-zinc-400">Descubre qué dicen otros usuarios sobre nuestros conductores.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Buscar comentarios..."
                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {posts.map((post) => (
                        <div key={post.id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold border border-white/5">
                                        {post.reviewer[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm flex items-center gap-1.5">
                                            {post.reviewer}
                                            <span className="text-zinc-500 font-normal">calificó a</span>
                                            {post.driver}
                                            {post.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
                                        </h4>
                                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{post.time} • {post.city}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg text-xs font-bold border border-yellow-500/20">
                                    <Star className="h-3 w-3 fill-current" />
                                    {post.rating}.0
                                </div>
                            </div>

                            <p className="text-zinc-300 mb-6 leading-relaxed">
                                "{post.comment}"
                            </p>

                            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-400 transition-colors">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Comentar</span>
                                </button>
                                <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors ml-auto">
                                    <Share2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="backdrop-blur-xl bg-gradient-to-br from-blue-600/10 to-transparent border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <h3 className="font-bold">Tendencias</h3>
                        </div>
                        <ul className="space-y-4">
                            <TrendingItem label="#ConductoresVerificados" count="128 posts" />
                            <TrendingItem label="Santa Tecla" count="85 posts" />
                            <TrendingItem label="Aeropuerto" count="42 posts" />
                            <TrendingItem label="#ViajeSeguro" count="31 posts" />
                        </ul>
                    </div>

                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="font-bold mb-4">Conductores del Mes</h3>
                        <div className="space-y-4">
                            <TopDriver name="Carlos Mendoza" rating="5.0" />
                            <TopDriver name="Roberto Sanchez" rating="4.9" />
                            <TopDriver name="Maria Julia" rating="4.9" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TrendingItem({ label, count }: any) {
    return (
        <li className="flex flex-col">
            <span className="text-sm font-bold text-zinc-200 hover:text-blue-400 cursor-pointer transition-colors">{label}</span>
            <span className="text-xs text-zinc-500">{count}</span>
        </li>
    )
}

function TopDriver({ name, rating }: any) {
    return (
        <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold border border-white/5">
                    {name[0]}
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                <Star className="h-3 w-3 fill-current" />
                {rating}
            </div>
        </div>
    )
}
