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
import { useRouter } from 'next/navigation'
import { toggleLike } from '@/app/actions/reviews'
import ReviewThread from '../../components/ReviewThread'

export default function CommunityPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
    const supabase = createClient()
    const router = useRouter()

    const [topDrivers, setTopDrivers] = useState<any[]>([])
    const [trends, setTrends] = useState<any[]>([])

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
                        user_id,
                        users (
                            full_name,
                            avatar_url,
                            address_state
                        )
                    ),
                    review_likes (
                        user_id
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
                    time: new Date(r.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    city: r.driver_profiles?.users?.address_state || 'AvivaGo',
                    likes: r.review_likes?.length || 0,
                    hasLiked: r.review_likes?.some((l: any) => l.user_id === user?.id),
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

            // 2. Fetch top drivers and trends based on reviews (30 days window)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            thirtyDaysAgo.setHours(0, 0, 0, 0)

            const { data: recentReviews, error: recentError } = await supabase
                .from('reviews')
                .select(`
                    id,
                    rating,
                    created_at,
                    driver_profiles (
                        id,
                        users (
                            id,
                            full_name,
                            avatar_url,
                            address_state
                        )
                    )
                `)
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: false })
                .limit(20)

            if (recentError) {
                console.error('Error in community ranking query:', recentError.message)
            }

            if (recentReviews && recentReviews.length > 0) {
                const driverStats: Record<string, { total: number, count: number, driver: any }> = {}
                const cityStats: Record<string, number> = {}

                recentReviews.forEach((rev: any) => {
                    const dProfile = Array.isArray(rev.driver_profiles) ? rev.driver_profiles[0] : rev.driver_profiles
                    const dId = dProfile?.id

                    if (dId && dProfile) {
                        if (!driverStats[dId]) {
                            driverStats[dId] = { total: 0, count: 0, driver: dProfile }
                        }
                        driverStats[dId].total += rev.rating
                        driverStats[dId].count += 1

                        const city = dProfile.users?.address_state
                        if (city) {
                            cityStats[city] = (cityStats[city] || 0) + 1
                        }
                    }
                });

                const sortedDrivers = Object.values(driverStats)
                    .map(stat => ({
                        id: stat.driver.id,
                        average_rating: stat.total / stat.count,
                        users: Array.isArray(stat.driver.users) ? stat.driver.users[0] : stat.driver.users,
                        count: stat.count
                    }))
                    .sort((a, b) => b.average_rating - a.average_rating || b.count - a.count)
                    .slice(0, 3)

                setTopDrivers(sortedDrivers)

                const sortedCities = Object.entries(cityStats)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([label, count]) => ({
                        label: label,
                        count: `${count} publicaciones`
                    }))

                setTrends([
                    ...sortedCities,
                    { label: '#AvivaGoComunidad', count: `${recentReviews.length} reseñas totales` }
                ])
            } else {
                // Fallback to absolute top drivers if NO reviews exist in 30 days
                const { data: fallbackDrivers } = await supabase
                    .from('driver_profiles')
                    .select('id, average_rating, review_count, users(full_name, avatar_url)')
                    .eq('status', 'active')
                    .order('average_rating', { ascending: false })
                    .limit(3)

                if (fallbackDrivers) {
                    setTopDrivers(fallbackDrivers.map(d => ({
                        id: d.id,
                        average_rating: d.average_rating || 5.0,
                        users: Array.isArray(d.users) ? d.users[0] : d.users,
                        count: d.review_count || 0
                    })))
                }
                setTrends([{ label: '#ConductoresVerificados', count: 'Únete hoy' }])
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

    const handleLike = async (postId: string) => {
        if (!currentUserId) {
            router.push('/auth/login')
            return
        }

        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const newHasLiked = !p.hasLiked
                return {
                    ...p,
                    hasLiked: newHasLiked,
                    likes: newHasLiked ? p.likes + 1 : p.likes - 1
                }
            }
            return p
        }))

        const res = await toggleLike(postId)
        if (!res.success) {
            alert(res.error)
        }
    }

    const handleShare = async (post: any) => {
        const shareData = {
            title: `Reseña de ${post.driver_name} en AvivaGo`,
            text: `Mira lo que dicen sobre el conductor ${post.driver_name}: "${post.comment}"`,
            url: window.location.origin + `/driver/${post.driver_id}`
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(shareData.url)
                alert('¡Enlace del perfil copiado al portapapeles!')
            }
        } catch (err) {
            console.error('Error sharing:', err)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#0F2137]">Comunidad</h1>
                    <p className="text-gray-500">Descubre qué dicen otros usuarios sobre nuestros conductores.</p>
                </div>
                <div className="relative max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ciudad o mensaje..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all w-full text-[#0F2137] placeholder-gray-400 shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {posts.filter(post =>
                        post.reviewer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.city?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((post) => (
                        <div key={post.id} className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-soft transition-all duration-300 group">
                            <div className="flex flex-col gap-4 mb-6">
                                {/* Top Header: Side-by-Side Horizontal Participants */}
                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                    <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                        {/* Passenger Side */}
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
                                                {post.reviewer_avatar ? (
                                                    <img src={post.reviewer_avatar} alt={post.reviewer_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold bg-zinc-900 text-xs sm:text-sm">
                                                        {post.reviewer_name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[11px] sm:text-xs font-black text-[#0F2137] truncate max-w-[80px] sm:max-w-[120px]">
                                                {post.reviewer_name}
                                            </span>
                                        </div>

                                        {/* Connection Arrow */}
                                        <div className="flex-shrink-0 px-1">
                                            <ArrowRight className="h-4 w-4 text-gray-300" />
                                        </div>

                                        {/* Driver Side */}
                                        <Link href={`/driver/${post.driver_id}`} className="flex items-center gap-2 sm:gap-3 group/driver min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 border-2 border-blue-100 overflow-hidden shadow-sm flex-shrink-0 group-hover/driver:border-blue-500/50 transition-all">
                                                {post.driver_avatar ? (
                                                    <img src={post.driver_avatar} alt={post.driver_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold bg-blue-100 text-xs sm:text-sm">
                                                        {post.driver_name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[11px] sm:text-xs font-black text-blue-600 group-hover/driver:text-blue-700 transition-colors truncate max-w-[80px] sm:max-w-[120px]">
                                                {post.driver_name}
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Meta Info (Now between photos and ratings) */}
                                <div className="flex items-center gap-4 px-2">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <Calendar className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{post.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-600/70">
                                        <MapPin className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{post.city}</span>
                                    </div>
                                </div>

                                {/* Consolidated Ratings Bar */}
                                <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                                    {/* 1. Passenger Reputation (What driver said) */}
                                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all ${post.reviewer_avg_rating > 0 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                        <Star className={`h-3 w-3 ${post.reviewer_avg_rating > 0 ? 'fill-current' : ''}`} />
                                        <span className="text-[10px] sm:text-xs font-black">
                                            {post.reviewer_avg_rating > 0 ? post.reviewer_avg_rating.toFixed(1) : 'S/C'}
                                        </span>
                                        <span className="text-[8px] opacity-70 font-black tracking-tighter uppercase">Pasajero</span>
                                    </div>

                                    {/* 2. Driver Reputation (Historical) */}
                                    <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-xl border border-blue-100">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="text-[10px] sm:text-xs font-black">{Number(post.driver_avg_rating || 5).toFixed(1)}</span>
                                        <span className="text-[8px] opacity-70 font-black tracking-tighter uppercase">Conductor</span>
                                    </div>

                                    {/* 3. Main Service Rating */}
                                    <div className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-xl border border-yellow-100">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="text-[10px] sm:text-xs font-black">{post.rating}.0</span>
                                        <span className="text-[8px] opacity-70 font-black tracking-tighter uppercase">Servicio</span>
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
                                readOnly={true}
                                driverName={post.driver_name}
                                passengerName={post.reviewer_name}
                            />

                            <div className="flex items-center gap-6 pt-4 border-t border-gray-100 mt-4">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-2 text-sm transition-colors group/like ${post.hasLiked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                                >
                                    <ThumbsUp className={`h-4 w-4 transition-transform group-hover/like:scale-110 ${post.hasLiked ? 'fill-current' : ''}`} />
                                    <span>{post.likes}</span>
                                </button>
                                <button
                                    onClick={() => handleShare(post)}
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors ml-auto"
                                >
                                    <Share2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[#0F2137]">Favoritos de la Semana</h3>
                            <div className="p-1.5 bg-yellow-50 rounded-lg">
                                <Calendar className="h-4 w-4 text-yellow-600" />
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
                                    count={drv.count}
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

                    <div className="bg-gradient-to-br from-blue-50 to-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-[#0F2137]">Tendencias</h3>
                        </div>
                        <ul className="space-y-4">
                            {trends.map((trend, i) => (
                                <TrendingItem key={i} label={trend.label} count={trend.count} />
                            ))}
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
            <span className="text-sm font-bold text-[#0F2137] hover:text-blue-600 cursor-pointer transition-colors">{label}</span>
            <span className="text-xs text-gray-500">{count}</span>
        </li>
    )
}

function TopDriver({ id, name, rating, photo, count }: any) {
    return (
        <Link href={id ? `/driver/${id}` : '#'} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold border border-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all text-gray-500">
                    {photo ? (
                        <img src={photo} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        name[0]
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#0F2137] group-hover:text-blue-600 transition-colors">{name}</span>
                    <span className="text-[10px] text-gray-500 font-medium">
                        {count || 0} publicaciones • Ver perfil <ArrowRight className="inline-block h-2 w-2" />
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                <Star className="h-3 w-3 fill-current" />
                {Number(rating).toFixed(1)}
            </div>
        </Link>
    )
}
