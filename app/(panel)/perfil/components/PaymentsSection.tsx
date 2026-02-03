'use client'

import { useState } from 'react'
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
    } = useMembershipPurchase(onPurchaseSuccess)

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
