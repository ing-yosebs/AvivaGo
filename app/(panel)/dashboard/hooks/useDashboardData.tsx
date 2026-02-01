'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Unlock,
    Star,
    Heart,
    MessageSquare,
} from 'lucide-react'

export interface DashboardStats {
    views: number
    unlocks: number
    rating: number
    active_days: number
    favorites: number
    recent_views: number
}

export function useDashboardData() {
    const [user, setUser] = useState<any>(null)
    const [isDriver, setIsDriver] = useState(false)
    const [stats, setStats] = useState<DashboardStats>({
        views: 0,
        unlocks: 0,
        rating: 0,
        active_days: 0,
        favorites: 0,
        recent_views: 0
    })
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [driverProfileId, setDriverProfileId] = useState<string | null>(null)

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
                        setDriverProfileId(driverProfile.id)
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

    return { user, isDriver, stats, activities, loading, driverProfileId }
}
