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
    CheckCircle2,
    Calendar,
    ArrowRight,
    Share2,
    MapPin
} from 'lucide-react'
import Link from 'next/link'
import ReviewThread from '../../components/ReviewThread'

export default function CommunityPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
    const supabase = createClient()

    const [topDrivers, setTopDrivers] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            // 1. Fetch real session
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user
            setCurrentUserId(user?.id)

            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select(`
                    id,
                    rating,
                    comment,
                    created_at,
                    reviewer_id,
                    passenger_rating,
                    driver_reply,
                    driver_reply_at,
                    passenger_followup,
                    passenger_followup_at,
                    driver_final_reply,
                    driver_final_reply_at,
                    reviewer:users (
                        full_name,
                        avatar_url
                    ),
                    driver_profiles (
                        id,
                        average_rating,
                        users (
                            full_name,
                            avatar_url,
                            address_state
                        )
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(10)

            if (!reviewsError && reviewsData) {
                const formattedReviews = reviewsData.map((r: any) => ({
                    id: r.id,
                    reviewer_name: r.reviewer?.full_name || 'Usuario',
                    reviewer_avatar: r.reviewer?.avatar_url,
                    reviewer_id: r.reviewer_id,
                    driver_id: r.driver_profiles?.id,
                    driver_name: r.driver_profiles?.users?.full_name || 'Conductor',
                    driver_avatar: r.driver_profiles?.users?.avatar_url,
                    driver_user_id: r.driver_profiles?.users?.id, // Need this for permission check if not joined in query
                    rating: r.rating,
                    comment: r.comment,
                    passenger_rating: r.passenger_rating,
                    driver_avg_rating: Number((Array.isArray(r.driver_profiles) ? r.driver_profiles[0]?.average_rating : r.driver_profiles?.average_rating) || 5.0),
                    reviewer_avg_rating: r.passenger_rating ? Number(r.passenger_rating) : 0,
                    driver_reply: r.driver_reply,
                    driver_reply_at: r.driver_reply_at,
                    passenger_followup: r.passenger_followup,
                    passenger_followup_at: r.passenger_followup_at,
                    driver_final_reply: r.driver_final_reply,
                    driver_final_reply_at: r.driver_final_reply_at,
                    time: new Date(r.created_at).toLocaleDateString(),
                    city: r.driver_profiles?.users?.address_state || 'AvivaGo',
                    likes: 0, // Real likes would need a table, setting to 0 for now as requested
                    isVerified: true,
                    // Pass full review object for thread logic if needed, but manual constructing is safer
                    raw: r
                }))
                setPosts(formattedReviews)
            } else {
                console.error('Error fetching reviews:', reviewsError)
                // Fallback to mock if empty
                setPosts([])
            }

            // 2. Fetch top drivers of the week (simulated with top rated)
            const { data: driversData } = await supabase
                .from('driver_profiles')
                .select(`
                    id,
                    average_rating,
                    users (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('status', 'active')
                .order('average_rating', { ascending: false })
                .limit(3)

            if (driversData) {
                setTopDrivers(driversData)
            }

            setLoading(false)
        }
        fetchData()
    }, [supabase])

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
                            <div className="flex flex-col gap-4 mb-6">
                                {/* Top Header: Side-by-Side Horizontal Participants */}
                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                    <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                        {/* Passenger Side */}
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-800 border-2 border-white/10 overflow-hidden shadow-lg flex-shrink-0">
                                                {post.reviewer_avatar ? (
                                                    <img src={post.reviewer_avatar} alt={post.reviewer_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold bg-zinc-900 text-xs sm:text-sm">
                                                        {post.reviewer_name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[11px] sm:text-xs font-black text-white truncate max-w-[80px] sm:max-w-[120px]">
                                                {post.reviewer_name}
                                            </span>
                                        </div>

                                        {/* Connection Arrow */}
                                        <div className="flex-shrink-0 px-1">
                                            <ArrowRight className="h-4 w-4 text-blue-500/50" />
                                        </div>

                                        {/* Driver Side */}
                                        <Link href={`/driver/${post.driver_id}`} className="flex items-center gap-2 sm:gap-3 group/driver min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600/10 border-2 border-blue-500/20 overflow-hidden shadow-lg flex-shrink-0 group-hover/driver:border-blue-500/50 transition-all">
                                                {post.driver_avatar ? (
                                                    <img src={post.driver_avatar} alt={post.driver_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-blue-400 font-bold bg-blue-900/30 text-xs sm:text-sm">
                                                        {post.driver_name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[11px] sm:text-xs font-black text-blue-400 group-hover/driver:text-blue-300 transition-colors truncate max-w-[80px] sm:max-w-[120px]">
                                                {post.driver_name}
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Meta Info (Now between photos and ratings) */}
                                <div className="flex items-center gap-4 px-2">
                                    <div className="flex items-center gap-1.5 text-zinc-500">
                                        <Calendar className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{post.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-500/60">
                                        <MapPin className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{post.city}</span>
                                    </div>
                                </div>

                                {/* Consolidated Ratings Bar */}
                                <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-white/[0.03] rounded-2xl border border-white/5">
                                    {/* 1. Passenger Reputation (What driver said) */}
                                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all ${post.reviewer_avg_rating > 0 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-lg shadow-yellow-500/5' : 'bg-zinc-800/50 text-zinc-500 border-white/5'}`}>
                                        <Star className={`h-3 w-3 ${post.reviewer_avg_rating > 0 ? 'fill-current' : ''}`} />
                                        <span className="text-[10px] sm:text-xs font-black">
                                            {post.reviewer_avg_rating > 0 ? post.reviewer_avg_rating.toFixed(1) : 'S/C'}
                                        </span>
                                        <span className="text-[8px] opacity-50 font-black tracking-tighter uppercase">Pasajero</span>
                                    </div>

                                    {/* 2. Driver Reputation (Historical) */}
                                    <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="text-[10px] sm:text-xs font-black">{Number(post.driver_avg_rating || 5).toFixed(1)}</span>
                                        <span className="text-[8px] opacity-50 font-black tracking-tighter uppercase">Conductor</span>
                                    </div>

                                    {/* 3. Main Service Rating */}
                                    <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-xl border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="text-[10px] sm:text-xs font-black">{post.rating}.0</span>
                                        <span className="text-[8px] opacity-50 font-black tracking-tighter uppercase">Servicio</span>
                                    </div>
                                </div>
                            </div>

                            <ReviewThread
                                review={{
                                    ...post.raw, // Pass original structure or constructed one
                                    id: post.id,
                                    reviewer_id: post.reviewer_id,
                                    comment: post.comment,
                                    driver_reply: post.driver_reply,
                                    driver_reply_at: post.driver_reply_at,
                                    passenger_followup: post.passenger_followup,
                                    passenger_followup_at: post.passenger_followup_at,
                                    driver_final_reply: post.driver_final_reply,
                                    driver_final_reply_at: post.driver_final_reply_at,
                                    driver_profiles: post.raw.driver_profiles // Pass this for user_id check
                                }}
                                currentUserId={currentUserId}
                            />

                            <div className="flex items-center gap-6 pt-4 border-t border-white/5 mt-4">
                                <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-400 transition-colors">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{post.likes}</span>
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
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-zinc-200">Favoritos de la Semana</h3>
                            <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                                <Calendar className="h-4 w-4 text-yellow-500" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {topDrivers.length > 0 ? topDrivers.map(drv => (
                                <TopDriver
                                    key={drv.id}
                                    id={drv.id}
                                    name={drv.users?.full_name}
                                    rating={drv.average_rating || '5.0'}
                                    photo={drv.users?.avatar_url}
                                />
                            )) : (
                                <>
                                    <TopDriver name="Carlos Mendoza" rating="5.0" />
                                    <TopDriver name="Roberto Sanchez" rating="4.9" />
                                    <TopDriver name="Maria Julia" rating="4.9" />
                                </>
                            )}
                        </div>
                    </div>

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

function TopDriver({ id, name, rating, photo }: any) {
    return (
        <Link href={id ? `/driver/${id}` : '#'} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xs font-bold border border-white/5 overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all">
                    {photo ? (
                        <img src={photo} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        name[0]
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-300 group-hover:text-blue-400 transition-colors">{name}</span>
                    <span className="text-[10px] text-zinc-600 font-medium">Ver perfil <ArrowRight className="inline-block h-2 w-2" /></span>
                </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                <Star className="h-3 w-3 fill-current" />
                {Number(rating).toFixed(1)}
            </div>
        </Link>
    )
}
