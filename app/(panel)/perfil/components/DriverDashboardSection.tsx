'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, Unlock, Star, Calendar, FileText } from 'lucide-react'
import { StatCard } from '@/app/(panel)/dashboard/components/StatCard'

interface DriverStats {
    views: number
    received_quotes: number
    rating: number
    active_days: number
}

interface DriverDashboardSectionProps {
    userId: string
}

export default function DriverDashboardSection({ userId }: DriverDashboardSectionProps) {
    const [stats, setStats] = useState<DriverStats>({
        views: 0,
        received_quotes: 0,
        rating: 0,
        active_days: 0
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchDriverStats = async () => {
            try {
                // Fetch Driver Profile
                const { data: driverProfile } = await supabase
                    .from('driver_profiles')
                    .select('id, created_at, average_rating, views')
                    .eq('user_id', userId)
                    .single()

                if (driverProfile) {
                    const createdDate = new Date(driverProfile.created_at)
                    const daysActive = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24))


                    // Get count of received quotes
                    const { count: receivedQuotesCount } = await supabase
                        .from('quote_requests')
                        .select('*', { count: 'exact', head: true })
                        .eq('driver_id', driverProfile.id)

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

                    setStats({
                        views: driverProfile.views || 0,
                        received_quotes: receivedQuotesCount || 0,
                        rating: realAverageRating,
                        active_days: daysActive
                    })
                }
            } catch (error) {
                console.error('Error fetching driver stats:', error)
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            fetchDriverStats()
        }
    }, [userId, supabase])

    if (loading) {
        return <div className="p-8 text-center text-zinc-400">Cargando métricas de conductor...</div>
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-2xl font-bold text-[#0F2137]">Panel de Conductor</h2>
                <p className="text-gray-500">Resumen de tu actividad y métricas como conductor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Eye className="h-5 w-5 text-blue-500" />}
                    label="Visualizaciones"
                    value={stats.views}
                />
                <StatCard
                    icon={<FileText className="h-5 w-5 text-purple-500" />}
                    label="Cotizaciones Recibidas"
                    value={stats.received_quotes}
                />
                <StatCard
                    icon={<Star className="h-5 w-5 text-yellow-500" />}
                    label="Calificación Media"
                    value={stats.rating.toFixed(1)}
                />
                <StatCard
                    icon={<Calendar className="h-5 w-5 text-green-500" />}
                    label="Días Activo"
                    value={stats.active_days}
                />
            </div>
        </div>
    )
}
