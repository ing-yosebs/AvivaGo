import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DriverProfileCard } from '@/app/(panel)/dashboard/components/DriverProfileCard'
import { ProfileVisibilityCard } from '@/app/(panel)/dashboard/components/ProfileVisibilityCard'
import DriverMarketingKit from '@/app/components/marketing/DriverMarketingKit'
import PremiumUpsellModal from '@/app/components/PremiumUpsellModal'

interface VisibilitySectionProps {
    driverProfileId: string
    initialIsVisible: boolean
    profile: any
    hasMembership: boolean
    isPlataOrHigher: boolean
}

export default function VisibilitySection({ driverProfileId, initialIsVisible, profile, hasMembership, isPlataOrHigher }: VisibilitySectionProps) {
    const [isVisible, setIsVisible] = useState(initialIsVisible)
    const [updating, setUpdating] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (typeof window !== 'undefined' && profile?.referral_code) {
            setReferralLink(`${window.location.origin}/register?ref=${profile.referral_code}`)
        }
    }, [profile])

    const handleToggleVisibility = async (visible: boolean) => {
        if (!hasMembership && visible) {
            setIsPremiumModalOpen(true)
            return;
        }
        setUpdating(true)
        try {
            const { error } = await supabase
                .from('driver_profiles')
                .update({ is_visible: visible })
                .eq('id', driverProfileId)

            if (error) throw error
            setIsVisible(visible)
        } catch (error) {
            console.error('Error al actualizar la visibilidad', error)
        } finally {
            setUpdating(false)
        }
    }

    const marketingProfile = {
        id: profile?.id,
        full_name: profile?.full_name,
        display_avatar: profile?.driver_profile?.profile_photo_url || profile?.avatar_url,
        referral_code: profile?.referral_code
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <DriverProfileCard driverProfileId={driverProfileId} />
            <ProfileVisibilityCard
                isVisible={isVisible}
                onToggleVisibility={handleToggleVisibility}
                updating={updating}
            />

            <div className="pt-8 border-t border-gray-100 relative">
                <DriverMarketingKit
                    profile={marketingProfile}
                    referralLink={referralLink}
                    embedded={true}
                    hasMembership={hasMembership}
                    isPlataOrHigher={isPlataOrHigher}
                />
                {!hasMembership && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8">
                        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 max-w-md">
                            <h3 className="text-xl font-bold text-[#0F2137] mb-2">Kit de Marketing Profesional</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Descarga tarjetas de presentación, flyers y material para redes sociales con tu código QR único.
                            </p>
                            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Exclusivo Premium
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <PremiumUpsellModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                feature="Visibilidad en Catálogo"
                message="Para aparecer en el catálogo público de conductores y que los pasajeros te encuentren directamente, activa tu Membresía Premium."
            />
        </div>

    )
}
