import { useState, useEffect } from 'react'
import DriverMarketingKit from '@/app/components/marketing/DriverMarketingKit'

interface MarketingSectionProps {
    profile: any
    hasMembership: boolean
    isPlataOrHigher: boolean
}

export default function MarketingSection({ profile, hasMembership, isPlataOrHigher }: MarketingSectionProps) {
    const [referralLink, setReferralLink] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined' && profile?.referral_code) {
            setReferralLink(`${window.location.origin}/register?ref=${profile.referral_code}`)
        }
    }, [profile])

    const marketingProfile = {
        id: profile?.driver_profile?.id || profile?.id,
        full_name: profile?.full_name,
        display_avatar: profile?.driver_profile?.profile_photo_url || profile?.avatar_url,
        referral_code: profile?.referral_code
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="appearance-none border-none relative">
                <DriverMarketingKit
                    profile={marketingProfile}
                    referralLink={referralLink}
                    embedded={true}
                    hasMembership={hasMembership}
                    isPlataOrHigher={isPlataOrHigher}
                />
            </div>
        </div>
    )
}
