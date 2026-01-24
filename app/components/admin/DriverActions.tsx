'use client'

import { useState } from 'react'
import { updateDriverStatus, toggleDriverVisibility } from '../../admin/users/actions' // Adjust import path
import { Check, X, Eye, EyeOff, AlertTriangle } from 'lucide-react'

export default function DriverActions({
    driverProfileId,
    currentStatus,
    isVisible
}: {
    driverProfileId: string
    currentStatus: string
    isVisible: boolean
}) {
    const [loading, setLoading] = useState(false)

    const handleStatusUpdate = async (newStatus: 'active' | 'suspended' | 'pending_approval') => {
        if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return

        setLoading(true)
        await updateDriverStatus(driverProfileId, newStatus)
        setLoading(false)
    }

    const handleVisibilityToggle = async () => {
        setLoading(true)
        await toggleDriverVisibility(driverProfileId, !isVisible)
        setLoading(false)
    }

    return (
        <div className="flex flex-wrap gap-3">
            {currentStatus !== 'active' && (
                <button
                    onClick={() => handleStatusUpdate('active')}
                    disabled={loading}
                    className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                    <Check className="h-4 w-4" />
                    Aprobar / Activar
                </button>
            )}

            {currentStatus !== 'suspended' && (
                <button
                    onClick={() => handleStatusUpdate('suspended')}
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                    <X className="h-4 w-4" />
                    Suspender / Rechazar
                </button>
            )}

            {currentStatus === 'active' && (
                <button
                    onClick={handleVisibilityToggle}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors border disabled:opacity-50 ${isVisible
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                            : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                        }`}
                >
                    {isVisible ? (
                        <>
                            <EyeOff className="h-4 w-4" />
                            Ocultar Perfil
                        </>
                    ) : (
                        <>
                            <Eye className="h-4 w-4" />
                            Hacer Visible
                        </>
                    )}
                </button>
            )}
        </div>
    )
}
