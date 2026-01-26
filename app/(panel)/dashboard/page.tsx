'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Users,
    TrendingUp,
    Star,
    Unlock,
    Calendar,
    Settings,
    MessageSquare,
    Eye,
    ChevronRight,
    Rocket,
    User,
    Heart,
    Car
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const [isDriver, setIsDriver] = useState(false)
    const [stats, setStats] = useState({
        views: 0,
        unlocks: 0,
        rating: 0,
        active_days: 0,
        favorites: 0,
        recent_views: 0
    })
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                setUser(user)

                if (!user) return

                // Check roles and profiles
                const { data: userData } = await supabase
                    .from('users')
                    .select('roles')
                    .eq('id', user.id)
                    .single()

                const isDriverRole = userData?.roles?.includes('driver')
                setIsDriver(isDriverRole)

                let dashboardStats = {
                    views: 0,
                    unlocks: 0,
                    rating: 0,
                    active_days: 0,
                    favorites: 0,
                    recent_views: 0
                }

                if (isDriverRole) {
                    // Fetch Driver Stats
                    const { data: driverProfile } = await supabase
                        .from('driver_profiles')
                        .select('id, created_at, average_rating, views')
                        .eq('user_id', user.id)
                        .single()

                    if (driverProfile) {
                        const createdDate = new Date(driverProfile.created_at)
                        const daysActive = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24))

                        // Get real count from unlocks table
                        const { count: realUnlockCount } = await supabase
                            .from('unlocks')
                            .select('*', { count: 'exact', head: true })
                            .eq('driver_profile_id', driverProfile.id)

                        // Get real average rating from reviews
                        const { data: driverReviews } = await supabase
                            .from('reviews')
                            .select('rating')
                            .eq('driver_profile_id', driverProfile.id)

                        let realAverageRating = parseFloat(driverProfile.average_rating) || 0

                        if (driverReviews && driverReviews.length > 0) {
                            const totalRating = driverReviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0)
                            realAverageRating = totalRating / driverReviews.length
                        }

                        dashboardStats = {
                            ...dashboardStats,
                            views: driverProfile.views || 0,
                            unlocks: realUnlockCount || 0,
                            rating: realAverageRating,
                            active_days: daysActive
                        }

                        // Fetch recent activity: Combined Unlocks + Reviews
                        const { data: unlocks } = await supabase
                            .from('unlocks')
                            .select('created_at, users:user_id(full_name)')
                            .eq('driver_profile_id', driverProfile.id)
                            .order('created_at', { ascending: false })
                            .limit(5)

                        const { data: recentReviewsWithUser } = await supabase
                            .from('reviews')
                            .select('created_at, rating, comment, users:reviewer_id(full_name)')
                            .eq('driver_profile_id', driverProfile.id)
                            .order('created_at', { ascending: false })
                            .limit(5)

                        let mixedActivity = []

                        if (unlocks) {
                            mixedActivity.push(...unlocks.map((u: any) => ({
                                type: 'unlock',
                                date: new Date(u.created_at),
                                rawDate: u.created_at,
                                icon: <Unlock className="h-4 w-4 text-purple-400" />,
                                text: `${u.users?.full_name || 'Un usuario'} desbloqueó tu contacto`,
                                passenger: u.users?.full_name
                            })))
                        }

                        if (recentReviewsWithUser) {
                            mixedActivity.push(...recentReviewsWithUser.map((r: any) => ({
                                type: 'review',
                                date: new Date(r.created_at),
                                rawDate: r.created_at,
                                icon: <Star className="h-4 w-4 text-yellow-400" />,
                                text: `${r.users?.full_name || 'Un usuario'} te calificó con ${r.rating} estrellas`,
                                subtext: r.comment ? `"${r.comment.substring(0, 40)}${r.comment.length > 40 ? '...' : ''}"` : undefined
                            })))
                        }

                        // Sort and limit
                        mixedActivity.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
                        const finalActivities = mixedActivity.slice(0, 6)

                        setActivities(finalActivities.map((item: any) => ({
                            icon: item.icon,
                            text: item.text + (item.subtext ? ` - ${item.subtext}` : ''),
                            time: item.rawDate
                        })))
                    }
                } else {
                    // Fetch Passenger Stats
                    // Favorites count
                    const { count: favoritesCount } = await supabase
                        .from('favorites')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)

                    // Unlocks made count
                    const { count: unlocksCount } = await supabase
                        .from('unlocks')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)

                    // Active days
                    const createdDate = new Date(user.created_at)
                    const daysActive = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24))

                    // Calculate real passenger rating
                    const { data: myRatedReviews } = await supabase
                        .from('reviews')
                        .select('passenger_rating')
                        .eq('reviewer_id', user.id)
                        .not('passenger_rating', 'is', null)

                    let myAvgRating = 5.0
                    if (myRatedReviews && myRatedReviews.length > 0) {
                        const total = myRatedReviews.reduce((acc: number, curr: any) => acc + (curr.passenger_rating || 0), 0)
                        myAvgRating = total / myRatedReviews.length
                    }

                    dashboardStats = {
                        ...dashboardStats,
                        favorites: favoritesCount || 0,
                        unlocks: unlocksCount || 0,
                        rating: myAvgRating,
                        active_days: daysActive
                    }

                    // Fetch recent activity
                    let mixedActivity: any[] = []

                    // 1. Favorites added
                    const { data: recentFavorites } = await supabase
                        .from('favorites')
                        .select('created_at, driver_profiles(users(full_name))')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(5)

                    if (recentFavorites) {
                        mixedActivity.push(...recentFavorites.map((f: any) => ({
                            type: 'favorite',
                            date: new Date(f.created_at),
                            rawDate: f.created_at,
                            icon: <Heart className="h-4 w-4 text-red-500" />,
                            text: `Agregaste a ${f.driver_profiles?.users?.full_name || 'un conductor'} a tus favoritos`
                        })))
                    }

                    // 2. Driver Interactions (Replies & Ratings) on my reviews
                    const { data: myReviews } = await supabase
                        .from('reviews')
                        .select('created_at, driver_reply, driver_reply_at, passenger_rating, driver_profiles(users(full_name))')
                        .eq('reviewer_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(20)

                    if (myReviews) {
                        myReviews.forEach((r: any) => {
                            const hasReply = r.driver_reply && r.driver_reply.trim().length > 0
                            const hasRating = r.passenger_rating && r.passenger_rating > 0

                            if (!hasReply && !hasRating) return

                            const driverName = r.driver_profiles?.users?.full_name || 'Un conductor'
                            // Use driver_reply_at as primary time, or created_at + some offset if missing (fallback)
                            const interactionDate = r.driver_reply_at ? new Date(r.driver_reply_at) : new Date(r.created_at)
                            const rawInteractionDate = r.driver_reply_at || r.created_at

                            if (hasReply) {
                                mixedActivity.push({
                                    type: 'reply',
                                    date: interactionDate,
                                    rawDate: rawInteractionDate,
                                    icon: <MessageSquare className="h-4 w-4 text-blue-400" />,
                                    text: `${driverName} comentó tu publicación`,
                                    subtext: r.driver_reply ? `"${r.driver_reply.substring(0, 40)}${r.driver_reply.length > 40 ? '...' : ''}"` : undefined
                                })
                            }

                            if (hasRating) {
                                mixedActivity.push({
                                    type: 'rating',
                                    date: interactionDate, // Assume same time roughly
                                    rawDate: rawInteractionDate,
                                    icon: <Star className="h-4 w-4 text-yellow-400" />,
                                    text: `${driverName} te calificó con ${r.passenger_rating} estrellas`
                                })
                            }
                        })
                    }

                    // 3. Unlocks (Purchases/Contact Unlocks)
                    const { data: myUnlocks } = await supabase
                        .from('unlocks')
                        .select('created_at, driver_profiles(users(full_name))')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(5)

                    if (myUnlocks) {
                        mixedActivity.push(...myUnlocks.map((u: any) => ({
                            type: 'unlock',
                            date: new Date(u.created_at),
                            rawDate: u.created_at,
                            icon: <Unlock className="h-4 w-4 text-green-500" />,
                            text: `Desbloqueaste el contacto de ${u.driver_profiles?.users?.full_name || 'un conductor'}`
                        })))
                    }

                    // Sort and limit
                    mixedActivity.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
                    const finalActivities = mixedActivity.slice(0, 6)

                    setActivities(finalActivities.map((item: any) => ({
                        icon: item.icon,
                        text: item.text + (item.subtext ? ` - ${item.subtext}` : ''),
                        time: item.rawDate
                    })))
                }

                setStats(dashboardStats)
            } catch (error) {
                console.error('Error loading dashboard:', error)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [supabase])

    if (loading) {
        return <div className="p-8 text-center text-zinc-400">Cargando panel...</div>
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isDriver ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {isDriver ? 'Perfil Conductor Activo' : 'Perfil Pasajero'}
                    </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    {isDriver ? 'Panel de Control' : 'Mi Actividad'}
                </h1>
                <p className="text-zinc-400">
                    Hola {user?.user_metadata?.full_name || (isDriver ? 'Conductor' : 'Pasajero')}, aquí está el resumen de tu actividad.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isDriver ? (
                    <>
                        <StatCard icon={<Eye className="h-5 w-5 text-blue-500" />} label="Visualizaciones" value={stats.views} />
                        <StatCard icon={<Unlock className="h-5 w-5 text-purple-500" />} label="Mis pasajeros" value={stats.unlocks} />
                        <StatCard icon={<Star className="h-5 w-5 text-yellow-500" />} label="Calificación Media" value={stats.rating.toFixed(1)} />
                        <StatCard icon={<Calendar className="h-5 w-5 text-green-500" />} label="Días Activo" value={stats.active_days} />
                    </>
                ) : (
                    <>
                        <StatCard icon={<Heart className="h-5 w-5 text-red-500" />} label="Conductores Favoritos" value={stats.favorites} />
                        <StatCard icon={<Car className="h-5 w-5 text-purple-500" />} label="Mis conductores" value={stats.unlocks || 0} />
                        <StatCard icon={<Star className="h-5 w-5 text-yellow-500" />} label="Calificación Promedio" value={stats.rating.toFixed(1)} />
                        <StatCard icon={<Rocket className="h-5 w-5 text-green-500" />} label="Días Activo" value={stats.active_days} />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                        <h3 className="text-xl font-bold mb-6">Actividad Reciente</h3>
                        <div className="space-y-6">
                            {activities.length > 0 ? (
                                activities.map((activity, index) => (
                                    <ActivityItem
                                        key={index}
                                        icon={activity.icon}
                                        text={activity.text}
                                        time={formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: es })}
                                    />
                                ))
                            ) : (
                                <p className="text-zinc-500">No hay actividad reciente.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, change }: any) {
    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-default">
            <div className="flex items-start justify-between mb-4">
                <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                    {icon}
                </div>
                {change && (
                    <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full">
                        {change}
                    </span>
                )}
            </div>
            <div>
                <p className="text-zinc-500 text-sm mb-1">{label}</p>
                <h4 className="text-2xl font-bold">{value}</h4>
            </div>
        </div>
    )
}

function ActivityItem({ icon, text, time }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-zinc-400">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-zinc-200">{text}</p>
                <p className="text-xs text-zinc-600">{time}</p>
            </div>
        </div>
    )
}

function QuickLink({ icon, text, href }: any) {
    return (
        <Link href={href || "#"} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white group">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm">{text}</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    )
}

