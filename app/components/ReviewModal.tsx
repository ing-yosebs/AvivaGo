'use client'

import { useState } from 'react'
import { Star, X, CheckCircle } from 'lucide-react'
import { submitReview } from '@/app/actions/reviews'

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    driverId: string
    driverName: string
}

export default function ReviewModal({ isOpen, onClose, driverId, driverName }: ReviewModalProps) {
    const [loading, setLoading] = useState(false)
    const [social, setSocial] = useState(0)
    const [driving, setDriving] = useState(0)
    const [assistance, setAssistance] = useState(0)
    const [comment, setComment] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async () => {
        setError(null)
        if (social === 0 || driving === 0 || assistance === 0) {
            setError('Por favor califica todos los aspectos')
            return
        }
        if (!comment.trim()) {
            setError('Por favor escribe un comentario')
            return
        }

        setLoading(true)
        const res = await submitReview({
            driver_profile_id: driverId,
            social_rating: social,
            driving_rating: driving,
            assistance_rating: assistance,
            comment
        })

        setLoading(false)
        if (res.success) {
            setShowSuccess(true)
            // Auto close after 3 seconds or via button
        } else {
            setError(res.error || 'Error al enviar reseña')
        }
    }

    const StarRating = ({ value, onChange, label }: any) => (
        <div className="space-y-2">
            <span className="text-sm font-medium text-zinc-300">{label}</span>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`transition-all hover:scale-110 ${value >= star ? 'text-yellow-500' : 'text-zinc-600'}`}
                    >
                        <Star className="h-6 w-6 fill-current" />
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                {showSuccess ? (
                    <div className="p-12 text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-10 w-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white">¡Gracias por tu reseña!</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
                                La comunidad <span className="text-blue-400 font-bold">AvivaGo</span> agradece tus comentarios. Esto nos permite construir una comunidad más segura, sólida y transparente.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
                        >
                            Volver al sitio
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white">Calificar a {driverName}</h2>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Tu opinión importa para la comunidad</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="h-5 w-5 text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm animate-shake">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-6">
                                <StarRating
                                    label="Interacción Social (Ambiente)"
                                    value={social}
                                    onChange={setSocial}
                                />
                                <StarRating
                                    label="Estilo de Conducción"
                                    value={driving}
                                    onChange={setDriving}
                                />
                                <StarRating
                                    label="Nivel de Asistencia"
                                    value={assistance}
                                    onChange={setAssistance}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Tu experiencia</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="¿Qué tal estuvo el viaje? ¿El conductor cumplió con sus etiquetas?"
                                    className="w-full h-32 bg-zinc-950 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 resize-none transition-colors"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 text-zinc-400 hover:text-white font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {loading ? 'Enviando...' : 'Publicar Reseña'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
