'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { updateDriverStatus, toggleDriverVisibility } from '@/app/admin/users/actions'
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
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const router = useRouter()

    const handleStatusUpdate = async (newStatus: 'active' | 'suspended' | 'pending_approval' | 'rejected', reason?: string) => {
        setError(null)
        setLoading(true)
        console.log('CLIENT: Sending update', { driverProfileId, newStatus, reason })

        try {
            const result = await updateDriverStatus(driverProfileId, newStatus, reason)
            console.log('CLIENT: Received result', result)

            if (!result.success) {
                setError(result.error || 'Error desconocido')
                alert('Error: ' + result.error)
                setLoading(false) // Stop loading on error
            } else {
                // Redirect back to user list after successful update
                router.push('/admin/users')
                router.refresh()
            }
        } catch (err: any) {
            console.error('CLIENT: Update error', err)
            setError(err.message)
            alert('Error crítico: ' + err.message)
            setLoading(false)
        }
    }

    const handleRejectClick = () => {
        setRejectionReason('') // Reset reason
        setShowRejectModal(true)
    }

    const confirmReject = () => {
        if (!rejectionReason.trim()) {
            alert('Por favor escribe una razón para el rechazo/suspensión.')
            return
        }
        setShowRejectModal(false)
        const statusToApply = currentStatus === 'pending_approval' ? 'rejected' : 'suspended'
        handleStatusUpdate(statusToApply, rejectionReason)
    }

    const handleVisibilityToggle = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await toggleDriverVisibility(driverProfileId, !isVisible)
            if (!result.success) {
                setError(result.error || 'Error visible')
            } else {
                window.location.reload()
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                    {currentStatus !== 'active' && currentStatus !== 'rejected' && (
                        <button
                            type="button"
                            onClick={() => handleStatusUpdate('active')}
                            disabled={loading}
                            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-3 rounded-xl transition-colors disabled:opacity-50 font-bold shadow-sm"
                        >
                            {loading ? '...' : <Check className="h-4 w-4" />}
                            Aprobar / Activar
                        </button>
                    )}

                    {currentStatus !== 'suspended' && currentStatus !== 'rejected' && (
                        <button
                            type="button"
                            onClick={handleRejectClick}
                            disabled={loading}
                            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl transition-colors disabled:opacity-50 font-bold shadow-sm"
                        >
                            {loading ? '...' : <X className="h-4 w-4" />}
                            {currentStatus === 'pending_approval' ? 'Rechazar Solicitud' : 'Suspender Cuenta'}
                        </button>
                    )}

                    {currentStatus === 'active' && (
                        <button
                            type="button"
                            onClick={handleVisibilityToggle}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors border disabled:opacity-50 font-bold shadow-sm ${isVisible
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

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                        <AlertTriangle className="h-4 w-4" />
                        {error}
                    </div>
                )}
            </div>

            {/* Rejection Modal - Rendered via Portal to avoid stacking context issues */}
            {showRejectModal && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {currentStatus === 'pending_approval' ? 'Rechazar Solicitud' : 'Suspender Conductor'}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-4">
                            Por favor indica la razón para esta acción. Esta información será visible para el conductor.
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Ej: La licencia de conducir no es legible o ha expirado..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-zinc-500 min-h-[120px] focus:outline-none focus:border-white/20 transition-colors mb-6 resize-none"
                            autoFocus
                        />

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmReject}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-bold text-sm shadow-lg shadow-red-500/20"
                            >
                                Confirmar {currentStatus === 'pending_approval' ? 'Rechazo' : 'Suspensión'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </>
    )
}
