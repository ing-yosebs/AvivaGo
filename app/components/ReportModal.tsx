'use client'

import { useState } from 'react'
import { AlertTriangle, X, CheckCircle, ShieldAlert } from 'lucide-react'
import { submitReport } from '@/app/driver/actions'

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    driverId: string
    driverName: string
}

export default function ReportModal({ isOpen, onClose, driverId, driverName }: ReportModalProps) {
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async () => {
        setError(null)
        if (!reason.trim() || reason.length < 10) {
            setError('Por favor describe el motivo del reporte con al menos 10 caracteres.')
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('driverProfileId', driverId)
        formData.append('reason', reason)

        try {
            const res = await submitReport(formData)

            if (res.success) {
                setShowSuccess(true)
            } else {
                setError(res.error || 'Error al enviar reporte')
            }
        } catch (err) {
            setError('Ocurrió un error inesperado dueante el envío.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-gray-200 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X className="h-5 w-5 text-gray-400" />
                </button>

                {showSuccess ? (
                    <div className="p-10 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">¡Reporte Enviado!</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Gracias por ayudarnos a mantener segura la comunidad <span className="text-blue-600 font-bold">AvivaGo</span>. Nuestro equipo revisará tu reporte a la brevedad.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <div className="p-8 sm:p-10">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                                <ShieldAlert className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Reportar a {driverName}</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Si detectaste algo sospechoso o inapropiado, por favor háznoslo saber. Tu reporte es anónimo para el conductor.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-pulse">
                                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Motivo del reporte</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Describe detalladamente qué sucedió..."
                                    className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100 resize-none transition-all"
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 text-gray-500 hover:text-gray-900 font-bold transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Reporte'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
