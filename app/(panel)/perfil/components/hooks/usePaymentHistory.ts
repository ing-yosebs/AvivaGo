import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UsePaymentHistoryProps {
    isDriver: boolean
    hasMembership: boolean
    onPurchaseSuccess: () => void
    reviewModal: any
}

export const usePaymentHistory = ({ isDriver, hasMembership, onPurchaseSuccess, reviewModal }: UsePaymentHistoryProps) => {
    const supabase = createClient()
    const [unlocks, setUnlocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchHistory = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Fetch Membership (Mock for now, checking if there are membership payments)
            if (isDriver) {
                const { data: membershipData } = await supabase
                    .from('unlocks')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('amount_paid', 524) // Our membership price
                    .limit(1)

                if (membershipData && membershipData.length > 0) {
                    onPurchaseSuccess()
                }
            }

            // 1. Fetch Unlocks
            const { data: unlocksData, error: unlockError } = await supabase
                .from('unlocks')
                .select(`
                    id,
                    amount_paid,
                    created_at,
                    driver_profile_id,
                    driver_profiles (
                        users (full_name)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (unlockError) {
                console.error('Error fetching unlocks:', unlockError)
                setLoading(false)
                return
            }

            // 2. Fetch Reviews for these unlocks
            const unlockIds = (unlocksData || []).map(u => u.id)
            let reviewsData: any[] = []

            if (unlockIds.length > 0) {
                const { data, error: reviewError } = await supabase
                    .from('reviews')
                    .select('id, rating, passenger_rating, unlock_id')
                    .in('unlock_id', unlockIds)

                if (!reviewError && data) {
                    reviewsData = data
                }
            }

            // 3. Merge them
            const merged = (unlocksData || []).map(unlock => ({
                ...unlock,
                reviews: (reviewsData || []).filter(r => r.unlock_id === unlock.id)
            }))

            setUnlocks(merged)
        } catch (error) {
            console.error('Error in fetchHistory:', error)
        } finally {
            setLoading(false)
        }
    }, [isDriver, hasMembership, onPurchaseSuccess, supabase])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory, reviewModal, hasMembership])

    return { unlocks, loading, refreshHistory: fetchHistory }
}
