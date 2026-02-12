import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DriverProfileCard } from '@/app/(panel)/dashboard/components/DriverProfileCard'
import { ProfileVisibilityCard } from '@/app/(panel)/dashboard/components/ProfileVisibilityCard'
import DriverMarketingKit from '@/app/components/marketing/DriverMarketingKit'

interface VisibilitySectionProps {
    driverProfileId: string
    initialIsVisible: boolean
    profile: any
}

export default function VisibilitySection({ driverProfileId, initialIsVisible, profile }: VisibilitySectionProps) {
    const [isVisible, setIsVisible] = useState(initialIsVisible)
    const [updating, setUpdating] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const supabase = createClient()

    useEffect(() => {
        if (typeof window !== 'undefined' && profile?.referral_code) {
            setReferralLink(`${window.location.origin}/register?ref=${profile.referral_code}`)
        }
    }, [profile])

    const handleToggleVisibility = async (visible: boolean) => {
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

            <div className="pt-8 border-t border-gray-100">
                <DriverMarketingKit
                    profile={marketingProfile}
                    referralLink={referralLink}
                    embedded={true}
                />
            </div>
        </div>
    )
}
