'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { toggleUserBan } from '@/app/admin/users/actions'
import { ShieldAlert, Ban, CheckCircle, X } from 'lucide-react'

export default function PassengerActions({
    userId,
    isBanned
}: {
    userId: string
    isBanned: boolean
}) {
    const [loading, setLoading] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleConfirmedAction = async () => {
        setLoading(true)
        setShowConfirmModal(false)

        try {
            console.log('Invocando server action para usuario:', userId)
            const result = await toggleUserBan(userId, !isBanned)
            console.log('Resultado server action:', result)

            if (result.success) {
                // Feedback inmediato
                alert(result.message || 'Estado actualizado correctamente')
                router.refresh()
            } else {
                alert(result.error || 'Error desconocido')
            }
        } catch (error) {
            console.error('Error en handleToggleBan:', error)
            alert('Error al actualizar el estado: ' + (error instanceof Error ? error.message : String(error)))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-purple-400" />
                    Acciones de Moderación
                </h3>

                <div className="flex flex-col gap-4">
                    <div className={`p-4 rounded-xl border ${isBanned ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            {isBanned ? (
                                <Ban className="h-5 w-5 text-red-400" />
                            ) : (
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                            )}
                            <span className={`font-bold ${isBanned ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isBanned ? 'Usuario Suspendido' : 'Usuario Activo'}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-400">
                            {isBanned
                                ? 'Este usuario no puede realizar compras ni acceder a datos de contacto.'
                                : 'El usuario tiene acceso completo a la plataforma.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isBanned
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Procesando...' : (
                            isBanned ? (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Reactivar Usuario
                                </>
                            ) : (
                                <>
                                    <Ban className="h-4 w-4" />
                                    Suspender Usuario
                                </>
                            )
                        )}
                    </button>
                </div>
            </div>

            {/* Confirmation Modal - Rendered via Portal */}
            {showConfirmModal && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative" onClick={(e) => e.stopPropagation()}>
                        {/* Close button */}
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex flex-col items-center text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isBanned
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {isBanned ? <CheckCircle className="h-8 w-8" /> : <Ban className="h-8 w-8" />}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {isBanned ? '¿Reactivar Usuario?' : '¿Suspender Usuario?'}
                            </h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {isBanned
                                    ? 'El usuario recuperará inmediatamente el acceso para realizar compras.'
                                    : 'Esta acción bloqueará inmediatamente al usuario. No podrá realizar nuevas compras.'}
                            </p>
                        </div>

                        <div className="flex gap-3 justify-center w-full">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm border border-transparent hover:border-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmedAction}
                                className={`flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-transform active:scale-95 ${isBanned
                                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                                        : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                    }`}
                            >
                                Sí, {isBanned ? 'Reactivar' : 'Suspender'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
