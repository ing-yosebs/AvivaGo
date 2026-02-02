'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import QuoteList from '@/app/(panel)/solicitudes/components/QuoteList'

export default function QuoteRequestsSection({ driverProfileId }: { driverProfileId: string }) {
    const [quotes, setQuotes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const loadQuotes = async () => {
            const { data, error } = await supabase
                .from('quote_requests')
                .select(`
                    *,
                    passenger:passenger_id (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('driver_id', driverProfileId)
                .order('created_at', { ascending: false })

            if (!error && data) {
                // Transform data to match QuoteList interface
                const formattedQuotes = data.map((q: any) => ({
                    ...q,
                    passenger: q.passenger ? {
                        full_name: q.passenger.full_name || 'Usuario',
                        avatar_url: q.passenger.avatar_url,
                    } : null
                }))
                setQuotes(formattedQuotes)
            }
            setLoading(false)
        }

        if (driverProfileId) {
            loadQuotes()
        }
    }, [driverProfileId, supabase])

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-24 bg-gray-50 rounded-2xl w-full" />
                <div className="h-24 bg-gray-50 rounded-2xl w-full" />
                <div className="h-24 bg-gray-50 rounded-2xl w-full" />
            </div>
        )
    }

    // Reuse existing empty state from QuoteList if possible, but QuoteList handles it too.
    // However, if we pass empty array, QuoteList shows the empty state.

    return (
        <div className="space-y-6">

            <QuoteList quotes={quotes} />
        </div>
    )
}
