'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { deleteUser } from '@/app/admin/users/actions'

export default function DeleteUserButton({ userId }: { userId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteUser(userId)
            
            if (result && !result.success) {
                setShowConfirm(false)
                setFeedbackMessage({ type: 'error', message: result.error || 'Error al intentar eliminar al usuario.' })
                setIsDeleting(false)
            }
            // If result.success is true, the redirect inside the action will handle it
        } catch (error: any) {
            // Next.js redirect throws a specific error that should be handled by the framework
            if (error?.message === 'NEXT_REDIRECT' || error?.digest?.includes('NEXT_REDIRECT')) {
                return;
            }
            console.error('Error in handleDelete:', error)
            setShowConfirm(false)
            setFeedbackMessage({ type: 'error', message: 'Error de red al intentar eliminar al usuario.' })
            setIsDeleting(false)
        }
    }

    const handleAcceptFeedback = () => {
        if (feedbackMessage?.type === 'success') {
            router.push('/admin/users')
        } else {
            setFeedbackMessage(null)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Trash2 className="h-5 w-5" />
                <span className="font-medium">
                    {isDeleting ? 'Borrando...' : 'Eliminar Usuario'}
                </span>
            </button>

            {/* Confirm Modal - Rendered via Portal to avoid stacking context issues */}
            {showConfirm && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Eliminar Usuario</h3>
                        </div>
                        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                            ¿Estás seguro de que deseas <b className="text-red-400">ELIMINAR PERMANENTEMENTE</b> a este usuario? Esta acción no se puede deshacer y borrará todos sus datos asociados.
                        </p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Eliminando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        <span>Sí, eliminar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Feedback Modal - Rendered via Portal */}
            {feedbackMessage && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                        {feedbackMessage.type === 'success' ? (
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                                <XCircle className="h-8 w-8" />
                            </div>
                        )}
                        <h3 className={`text-2xl font-bold mb-3 ${feedbackMessage.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {feedbackMessage.type === 'success' ? '¡Usuario Eliminado!' : 'Error'}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                            {feedbackMessage.message}
                        </p>
                        <button
                            onClick={handleAcceptFeedback}
                            className={`w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-colors ${feedbackMessage.type === 'success'
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            Aceptar y Continuar
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
