'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DriverProfileCard } from '@/app/(panel)/dashboard/components/DriverProfileCard'
import { ProfileVisibilityCard } from '@/app/(panel)/dashboard/components/ProfileVisibilityCard'

interface VisibilitySectionProps {
    driverProfileId: string
    initialIsVisible: boolean
}

export default function VisibilitySection({ driverProfileId, initialIsVisible }: VisibilitySectionProps) {
    const [isVisible, setIsVisible] = useState(initialIsVisible)
    const [updating, setUpdating] = useState(false)
    const supabase = createClient()

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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-xl font-bold text-[#0F2137] mb-4">Configuración de Visibilidad</h2>
            <DriverProfileCard driverProfileId={driverProfileId} />
            <ProfileVisibilityCard
                isVisible={isVisible}
                onToggleVisibility={handleToggleVisibility}
                updating={updating}
            />
        </div>
    )
}
