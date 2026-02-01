'use client'

import { useState } from 'react'
import { createDriverProfile } from '../actions'
import { Car, Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BecomeDriverButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleInitialClick = () => {
        setError(null)
        setShowConfirm(true)
    }

    const handleConfirm = async () => {
        setLoading(true)
        setShowConfirm(false)
        try {
            const res = await createDriverProfile()
            if (res?.error) {
                setError(res.error)
            } else {
                router.refresh()
                window.location.reload()
            }
        } catch (error) {
            console.error(error)
            setError('Ocurrió un error al procesar tu solicitud')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={handleInitialClick}
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-left shadow-xl transition-all hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
            >
                {/* ... existing button content ... */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />

                <div className="relative flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-purple-100 mb-2">
                            <Car className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Modo Conductor</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">¿Quieres manejar con AvivaGo?</h3>
                        <p className="text-sm text-purple-100/80 max-w-[80%]">
                            Activa tu perfil de conductor ahora y comienza el proceso de registro para ganar dinero.
                        </p>
                    </div>

                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-purple-600">
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-white group-hover:text-purple-600" />
                        ) : (
                            <ArrowRight className="h-5 w-5 text-white group-hover:text-purple-600" />
                        )}
                    </div>
                </div>
            </button>

            {/* Custom Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

                        <div className="relative">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
                                <Car className="h-6 w-6" />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">Activación de Conductor</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Al activar tu perfil de conductor, habilitaremos nuevas secciones en tu menú para que puedas gestionar tus vehículos y viajes. ¿Deseas continuar?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                                >
                                    ¡Sí, activar!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message Toast/Modal */}
            {error && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-300">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Hubo un problema</h3>
                        <p className="text-sm text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
