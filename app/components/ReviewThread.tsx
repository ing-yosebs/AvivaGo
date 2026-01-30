'use client'

import { useState } from 'react'

import { replyToReview, ratePassenger } from '@/app/actions/reviews'
import { MessageSquare, Send, CheckCircle2, Star, ThumbsUp, ThumbsDown } from 'lucide-react'

interface ReviewThreadProps {
    review: any
    currentUserId?: string
    readOnly?: boolean
    driverName?: string
    passengerName?: string
}

export default function ReviewThread({
    review,
    currentUserId,
    readOnly = false,
    driverName = 'Conductor',
    passengerName = 'Pasajero'
}: ReviewThreadProps) {
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [loading, setLoading] = useState(false)

    // Driver rating state
    const [rateOpen, setRateOpen] = useState(false)
    const [passRating, setPassRating] = useState(5)
    const [agreement, setAgreement] = useState(true)

    // Determine roles
    const isReviewer = !!currentUserId && currentUserId === review.reviewer_id
    const isDriver = !!currentUserId && currentUserId === (review.driver_profiles?.user_id || review.driver_profiles?.users?.id)

    // Determine next step
    let canReply = false
    let replyRole: 'driver' | 'passenger' | null = null
    let placeholder = ''

    if (isDriver) {
        if (!review.driver_reply) {
            canReply = true
            replyRole = 'driver'
            placeholder = 'Responde a la reseña del pasajero...'
        } else if (review.passenger_followup && !review.driver_final_reply) {
            canReply = true
            replyRole = 'driver'
            placeholder = 'Escribe tu respuesta final / conclusión...'
        }
    } else if (isReviewer) {
        if (review.driver_reply && !review.passenger_followup) {
            canReply = true
            replyRole = 'passenger'
            placeholder = 'Responde al comentario del conductor...'
        }
    }

    const handleReply = async (isFinalizing = false) => {
        const content = isFinalizing ? '--- Conversación finalizada por el usuario ---' : replyContent
        if (!content.trim() || !replyRole) return

        setLoading(true)
        const res = await replyToReview(review.id, content, replyRole)
        setLoading(false)

        if (res.success) {
            setIsReplying(false)
            setReplyContent('')
        } else {
            alert(res.error)
        }
    }

    const handleRatePassenger = async () => {
        setLoading(true)
        const res = await ratePassenger(review.id, passRating, agreement)
        setLoading(false)
        if (res.success) {
            setRateOpen(false)
        } else {
            alert(res.error)
        }
    }

    return (
        <div className="space-y-4 w-full">
            {!readOnly && isDriver && !review.passenger_rating && (
                <div className="mb-4">
                    {!rateOpen ? (
                        <button
                            onClick={() => setRateOpen(true)}
                            className="bg-gray-100 hover:bg-gray-200 text-[#0F2137] text-xs px-3 py-1.5 rounded-lg border border-gray-200 transition-colors font-medium shadow-sm"
                        >
                            Calificar Experiencia con Pasajero
                        </button>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 shadow-soft">
                            <h4 className="text-sm font-bold text-[#0F2137]">Calificar al Pasajero</h4>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">¿Se concretó el acuerdo?</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAgreement(true)}
                                        className={`p-1.5 rounded-lg border transition-all ${agreement ? 'bg-green-50 border-green-200 text-green-600' : 'border-gray-200 text-gray-400'}`}
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setAgreement(false)}
                                        className={`p-1.5 rounded-lg border transition-all ${!agreement ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-400'}`}
                                    >
                                        <ThumbsDown className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-gray-500">Calificación</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setPassRating(star)}
                                            className={`${star <= passRating ? 'text-yellow-500' : 'text-gray-300'} hover:scale-110 transition-transform`}
                                        >
                                            <Star className="h-5 w-5 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleRatePassenger}
                                disabled={loading}
                                className="w-full bg-[#0F2137] hover:bg-[#0F2137]/90 text-white text-xs font-bold py-2 rounded-lg"
                            >
                                {loading ? 'Enviando...' : 'Enviar Calificación'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 1. Original Review */}
            <div className="text-gray-600 leading-relaxed italic">
                "{review.comment}"
            </div>

            {/* 2. Driver Reply */}
            {review.driver_reply && (
                <div className="ml-4 pl-4 border-l-2 border-blue-100 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600">{driverName}</span>
                        <span className="text-[10px] text-gray-400">{new Date(review.driver_reply_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                    <p className="text-sm text-gray-500">{review.driver_reply}</p>
                </div>
            )}

            {/* 3. Passenger Follow-up */}
            {review.passenger_followup && (
                <div className="ml-8 pl-4 border-l-2 border-gray-200 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F2137]">{passengerName}</span>
                        <span className="text-[10px] text-gray-400">{new Date(review.passenger_followup_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                    <p className="text-sm text-gray-500">{review.passenger_followup}</p>
                </div>
            )}

            {/* 4. Driver Final Reply */}
            {review.driver_final_reply && (
                <div className="ml-12 pl-4 border-l-2 border-green-200 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-600">Conclusión de {driverName}</span>
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-500">{review.driver_final_reply}</p>
                </div>
            )}

            {/* Reply Input Area */}
            {!readOnly && canReply && (
                <div className="pt-2">
                    {!isReplying ? (
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsReplying(true)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1.5 transition-colors"
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                                {replyRole === 'driver' ? 'Contestar Reseña' : `Responder a ${driverName}`}
                            </button>
                            <button
                                onClick={() => handleReply(true)}
                                disabled={loading}
                                className="text-[10px] font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest transition-colors border-l border-gray-200 pl-4"
                            >
                                Finalizar Conversación
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={placeholder}
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50 transition-all text-[#0F2137] shadow-sm"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleReply(false)}
                                />
                                <button
                                    onClick={() => handleReply(false)}
                                    disabled={loading || !replyContent.trim()}
                                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                            <button
                                onClick={() => setIsReplying(false)}
                                className="text-[10px] font-bold text-gray-400 hover:text-gray-600"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
