'use client'

import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import ReviewModal from '../../../components/ReviewModal'

// Hooks
import { usePaymentHistory } from './hooks/usePaymentHistory'
import { useDriverAppeal } from './hooks/useDriverAppeal'
import { useProfileValidation } from './hooks/useProfileValidation'
import { useMembershipPurchase } from './hooks/useMembershipPurchase'

// UI Components
import AppealModal from './ui/AppealModal'
import MembershipStatusCard from './ui/MembershipStatusCard'
import VerificationStatusPanel from './ui/VerificationStatusPanel'
import MembershipPurchaseFlow from './ui/MembershipPurchaseFlow'
import PaymentHistoryTable from './ui/PaymentHistoryTable'

interface PaymentsSectionProps {
    isDriver: boolean
    hasMembership: boolean
    driverStatus?: string
    driverProfileId?: string
    onPurchaseSuccess: () => void
    profile: any
    vehicles: any[]
    services: any
    pendingPayment?: any
}

import { createClient } from '@/lib/supabase/client'

// ... imports

export default function PaymentsSection({
    isDriver,
    hasMembership,
    driverStatus,
    driverProfileId,
    onPurchaseSuccess,
    profile,
    vehicles,
    services,
    pendingPayment
}: PaymentsSectionProps) {
    const [reviewModal, setReviewModal] = useState<{ open: boolean, driverId: string, driverName: string } | null>(null)
    const [price, setPrice] = useState(524)
    const [currency, setCurrency] = useState('MXN')
    const supabase = createClient()

    useEffect(() => {
        const fetchPrice = async () => {
            if (!isDriver || !profile?.driver_profile) return

            // 1. Try to find price by zone_id if exists
            if (profile.driver_profile.zone_id) {
                const { data } = await supabase.from('zone_prices')
                    .select('amount, currency')
                    .eq('zone_id', profile.driver_profile.zone_id)
                    .eq('type', 'membership')
                    .single()
                if (data) {
                    setPrice(data.amount / 100) // Cents to Unit
                    setCurrency(data.currency)
                    return
                }
            }

            // 2. Fallback: Find price by country_code (using "General" zone for that country)
            const countryCode = profile.driver_profile.country_code || 'MX'

            // Find the "General%" zone for this country
            // Alternatively, we can just find ANY zone for this country if we don't have specific logic yet,
            // or we assume a naming convention like 'General {CountryName}'
            // To be safe, let's look for a zone that belongs to the country and has a membership price.
            // Ideally we should have a 'is_default' flag on zones, but for now let's query:

            const { data: countriesZones } = await supabase
                .from('zones')
                .select('id, zone_prices!inner(amount, currency, type)')
                .eq('country_code', countryCode)
                .eq('zone_prices.type', 'membership')
                .limit(1)

            if (countriesZones && countriesZones.length > 0) {
                const p = countriesZones[0].zone_prices[0] // It's an array because of inner join? actually fetching logic might vary
                // zone_prices is an array in the response usually if it's 1:M, but here we filter.
                // Let's be careful with the shape.
                // Correct interaction: select('id, zone_prices(...)') returns { id, zone_prices: [...] }

                const priceData = Array.isArray(countriesZones[0].zone_prices)
                    ? countriesZones[0].zone_prices[0]
                    : countriesZones[0].zone_prices

                if (priceData) {
                    setPrice(priceData.amount / 100)
                    setCurrency(priceData.currency)
                }
            }
        }
        fetchPrice()
    }, [isDriver, profile, supabase])

    // Data Hooks
    const { unlocks, loading: historyLoading, refreshHistory } = usePaymentHistory({
        isDriver,
        hasMembership,
        onPurchaseSuccess,
        reviewModal
    })

    const { validateProfile } = useProfileValidation()

    const {
        appealModalOpen,
        setAppealModalOpen,
        appealReason,
        setAppealReason,
        submittingAppeal,
        handleRequestReview: initRequestReview,
        confirmRequestReview
    } = useDriverAppeal(driverProfileId)

    const {
        purchasing,
        paymentConsent,
        setPaymentConsent,
        handlePurchase,
        openStripeCheckout
    } = useMembershipPurchase(onPurchaseSuccess, price, currency)

    // Handlers
    const handleRequestReviewWrapper = () => {
        const errors = validateProfile(profile, vehicles, services)
        initRequestReview(errors)
    }

    const handleRateDriver = (driverId: string, driverName: string) => {
        setReviewModal({
            open: true,
            driverId,
            driverName
        })
    }

    if (historyLoading) return <div className="animate-pulse h-40 bg-gray-50 rounded-3xl border border-gray-100" />

    return (
        <div className="space-y-8">
            <AppealModal
                isOpen={appealModalOpen}
                onClose={() => setAppealModalOpen(false)}
                appealReason={appealReason}
                setAppealReason={setAppealReason}
                onConfirm={confirmRequestReview}
            />

            {isDriver ? (
                hasMembership ? (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden animate-in fade-in zoom-in duration-500 shadow-soft">
                        <MembershipStatusCard />

                        <VerificationStatusPanel
                            driverStatus={driverStatus}
                            profile={profile}
                            handleRequestReview={handleRequestReviewWrapper}
                            submittingAppeal={submittingAppeal} // Use appeal specific loading state for the panel actions
                        />
                    </div>
                ) : (
                    <MembershipPurchaseFlow
                        pendingPayment={pendingPayment}
                        openStripeCheckout={openStripeCheckout}
                        handlePurchase={handlePurchase}
                        purchasing={purchasing}
                        paymentConsent={paymentConsent}
                        setPaymentConsent={setPaymentConsent}
                        price={price}
                        currency={currency}
                    />
                )
            ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4 shadow-soft">
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                        <Info className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900">Transparencia en tus pagos</h4>
                        <p className="text-sm text-blue-900/60 mt-1">Aquí puedes ver el historial de conductores que has desbloqueado. Cada pago te garantiza acceso ilimitado a su contacto por tiempo indefinido.</p>
                    </div>
                </div>
            )}

            {(!isDriver || hasMembership) && (
                <div className="space-y-4 animate-in fade-in duration-700">
                    <h3 className="font-bold text-lg text-[#0F2137]">{isDriver ? 'Historial de Membresía' : 'Historial de Desbloqueos'}</h3>
                    <PaymentHistoryTable
                        isDriver={isDriver}
                        unlocks={unlocks}
                        onRate={handleRateDriver}
                    />
                </div>
            )}

            {reviewModal && (
                <ReviewModal
                    isOpen={reviewModal.open}
                    onClose={() => {
                        setReviewModal(null)
                        refreshHistory() // Ensure history is refreshed after review
                    }}
                    driverId={reviewModal.driverId}
                    driverName={reviewModal.driverName}
                />
            )}
        </div>
    )
}
