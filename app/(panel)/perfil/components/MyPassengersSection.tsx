'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, User, MessageSquare, Star, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { replyToReview, ratePassenger } from '@/app/actions/reviews'
import ReviewThread from '@/app/components/ReviewThread'

export default function MyPassengersSection() {
    const supabase = createClient()
    const [unlocks, setUnlocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Modal state
    const [interactionModal, setInteractionModal] = useState<{ open: boolean, unlock: any } | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [passRating, setPassRating] = useState(5)
    const [agreement, setAgreement] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const fetchPassengers = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get driver profile id and name
        const { data: profileData, error: profileError } = await supabase
            .from('driver_profiles')
            .select('id, users:user_id(full_name)')
            .eq('user_id', user.id)
            .single()

        let driverName = 'Conductor'
        let driverProfileId = null

        if (profileError || !profileData) {
            console.error('Error fetching driver profile:', profileError)
            // Try to get name directly from users table
            const { data: userData } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', user.id)
                .single()

            const rawUser = userData as any
            driverName = (Array.isArray(rawUser) ? rawUser[0]?.full_name : rawUser?.full_name) || 'Conductor'
        } else {
            const rawUsers = (profileData as any).users
            driverName = (Array.isArray(rawUsers) ? rawUsers[0]?.full_name : rawUsers?.full_name) || 'Conductor'
            driverProfileId = profileData.id
        }

        setCurrentUser({ ...user, full_name: driverName })

        if (!driverProfileId) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('unlocks')
            .select(`
                id,
                created_at,
                user_id,
                users!unlocks_user_id_fkey (full_name, avatar_url, phone_number),
                reviews (
                    id, 
                    rating, 
                    comment, 
                    driver_reply, 
                    driver_reply_at,
                    passenger_followup,
                    passenger_followup_at,
                    driver_final_reply,
                    driver_final_reply_at,
                    passenger_rating,
                    agreement_reached,
                    reviewer_id
                )
            `)
            .eq('driver_profile_id', driverProfileId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching passengers:', error)
        } else {
            setUnlocks(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchPassengers()
    }, [])

    const handleInteractionSubmit = async () => {
        if (!interactionModal?.unlock) return

        const reviewsData = interactionModal.unlock.reviews
        // Handle both Array and Single Object cases to be safe
        const review = Array.isArray(reviewsData) ? reviewsData[0] : reviewsData

        if (!review?.id) {
            alert('Error: No se encontró la reseña para responder.')
            return
        }

        const isFinalReply = !!review.passenger_followup;

        setSubmitting(true)
        try {
            // 1. Reply to review
            if (replyContent.trim()) {
                const replyRes = await replyToReview(review.id, replyContent, 'driver')
                if (!replyRes.success) throw new Error(replyRes.error)
            }

            // 2. Rate passenger - ONLY if NOT a final reply and not already rated
            if (!isFinalReply && !review.passenger_rating) {
                const rateRes = await ratePassenger(review.id, passRating, agreement)
                if (!rateRes.success) throw new Error(rateRes.error)
            }

            alert('¡Interacción publicada con éxito!')

            // Success reset
            setInteractionModal(null)
            setReplyContent('')
            setPassRating(5)
            setAgreement(true)
            await fetchPassengers()
        } catch (err: any) {
            console.error('Submit Error:', err)
            alert('Error al publicar: ' + (err.message || 'Error desconocido'))
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />)}</div>

    return (
        <div className="space-y-6">
            {unlocks.length > 0 ? (
                <div className={`grid gap-6 ${unlocks.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                    {unlocks.map((unlock) => {
                        const passenger = unlock.users
                        const reviewsData = unlock.reviews
                        const hasReview = !!reviewsData && (Array.isArray(reviewsData) ? reviewsData.length > 0 : !!reviewsData.id)
                        const review = hasReview ? (Array.isArray(reviewsData) ? reviewsData[0] : reviewsData) : null

                        return (
                            <div key={unlock.id} className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:bg-gray-50 transition-all duration-300 shadow-soft">
                                {/* Header */}
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
                                        {passenger?.avatar_url ? (
                                            <img src={passenger.avatar_url} alt={passenger.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xl font-bold text-[#0F2137] tracking-tight truncate">{passenger?.full_name}</h4>
                                        <p className="text-sm text-gray-500 font-medium mb-3">Pasajero • Te contactó el {new Date(unlock.created_at).toLocaleDateString()}</p>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <a
                                                href={`https://wa.me/${passenger?.phone_number?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${passenger?.full_name}, soy tu conductor de AvivaGo y te contacto para coordinar el servicio.`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 text-xs font-bold hover:bg-[#25D366]/20 transition-all font-black uppercase tracking-wider"
                                            >
                                                <MessageSquare className="h-4 w-4 fill-current opacity-70" />
                                                Escribir al WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 w-full my-6" />

                                <div className="space-y-6">
                                    {hasReview ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-4 py-2 rounded-2xl border border-yellow-100 w-fit">
                                                <Star className="h-4 w-4 fill-current" />
                                                <span className="text-sm font-black tracking-tight">{review.rating}.0</span>
                                                <span className="text-[11px] font-bold opacity-60 ml-1">Calificación Recibida</span>
                                            </div>

                                            <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 shadow-inner">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Seguimiento de Servicio</div>
                                                </div>
                                                <div className="scale-100 origin-top-left">
                                                    <ReviewThread
                                                        review={{
                                                            ...review,
                                                            driver_profiles: { user_id: currentUser?.id }
                                                        }}
                                                        currentUserId={currentUser?.id}
                                                        readOnly={true}
                                                        driverName={currentUser?.full_name}
                                                        passengerName={passenger?.full_name}
                                                    />
                                                </div>

                                                {(
                                                    !review.driver_reply ||
                                                    !review.passenger_rating ||
                                                    (review.passenger_followup && !review.driver_final_reply)
                                                ) && (
                                                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4">
                                                            <button
                                                                onClick={() => {
                                                                    setReplyContent('');
                                                                    setInteractionModal({ open: true, unlock });
                                                                }}
                                                                className="text-[10px] font-black text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors group/btn"
                                                            >
                                                                <MessageSquare className="h-4 w-4" />
                                                                {review.passenger_followup ? 'RESPUESTA FINAL' : 'RESPONDER'}
                                                            </button>
                                                            {review.passenger_followup && !review.driver_final_reply && (
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyContent('--- Conversación finalizada por el conductor ---');
                                                                        setInteractionModal({ open: true, unlock });
                                                                    }}
                                                                    className="text-[9px] font-black text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors border-l border-white/10 pl-4"
                                                                >
                                                                    FINALIZAR
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-4 py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-sm text-gray-500 italic font-medium">Aún no has recibido una calificación.</p>
                                            <div className="px-4 py-1.5 bg-gray-200 text-gray-600 text-[10px] font-black rounded-lg border border-gray-200 uppercase tracking-widest">
                                                Pendiente
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-soft">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aún ningún pasajero ha desbloqueado tu contacto.</p>
                </div>
            )}

            {/* Interaction Modal (Unified Responder y Calificar) */}
            {interactionModal?.open && (() => {
                const reviewsData = interactionModal.unlock.reviews
                const currentReview = Array.isArray(reviewsData) ? reviewsData[0] : reviewsData
                const isFinalReply = !!currentReview?.passenger_followup

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setInteractionModal(null)} />
                        <div className="relative bg-white border border-gray-100 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                            <div className="text-center space-y-4 mb-8">
                                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                                    <MessageSquare className="h-10 w-10 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0F2137]">
                                    {isFinalReply ? 'Respuesta Final' : 'Interactuar'} con {interactionModal.unlock.users?.full_name}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {isFinalReply
                                        ? 'Cierra la conversación con un mensaje final para este pasajero.'
                                        : 'Responde a su reseña y califica tu experiencia con este pasajero.'}
                                </p>
                            </div>

                            <div className="space-y-8">
                                {isFinalReply ? (
                                    /* ULTRA SIMPLIFIED VIEW FOR FINAL REPLY */
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-2">Tu Respuesta Final</label>
                                            <textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Escribe tu mensaje final aquí..."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 min-h-[150px] text-[#0F2137] focus:border-blue-500 transition-colors resize-none shadow-inner"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => setInteractionModal(null)}
                                                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleInteractionSubmit}
                                                disabled={submitting}
                                                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                                            >
                                                {submitting ? 'Publicando...' : 'Publicar'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* FULL VIEW FOR INITIAL RESPONSE & RATING */
                                    <>
                                        {/* 1. Context */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-2">Contexto de la conversación</label>
                                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 italic text-gray-600 text-sm space-y-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Pasajero dice:</p>
                                                    <p>"{currentReview?.passenger_followup || currentReview?.comment}"</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Rate Passenger Section */}
                                        {!currentReview?.passenger_rating && (
                                            <div className="space-y-6 bg-gray-50 border border-gray-100 p-6 rounded-3xl">
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-xs font-bold text-gray-500">¿Se concretó el servicio?</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setAgreement(true)}
                                                            className={`p-2 rounded-xl border transition-all ${agreement ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-200 text-gray-400'}`}
                                                        >
                                                            <ThumbsUp className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setAgreement(false)}
                                                            className={`p-2 rounded-xl border transition-all ${!agreement ? 'bg-red-50 border-red-500 text-red-600' : 'border-gray-200 text-gray-400'}`}
                                                        >
                                                            <ThumbsDown className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-bold uppercase text-gray-500 text-center block tracking-widest">¿Qué calificación le das al pasajero?</label>
                                                    <div className="flex justify-center gap-3">
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <button
                                                                key={num}
                                                                onClick={() => setPassRating(num)}
                                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${passRating >= num ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-white border border-gray-200 text-gray-300 hover:border-gray-300'}`}
                                                            >
                                                                <Star className={`h-6 w-6 ${passRating >= num ? 'fill-current' : ''}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 3. Driver Reply Section */}
                                        {!currentReview?.driver_reply && (
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-2">Tu Mensaje</label>
                                                <textarea
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="Escribe una respuesta cordial al pasajero..."
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 min-h-[120px] text-[#0F2137] focus:border-blue-500 transition-colors resize-none shadow-inner"
                                                />
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => setInteractionModal(null)}
                                                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleInteractionSubmit}
                                                disabled={submitting}
                                                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                                            >
                                                {submitting ? 'Publicando...' : 'Publicar'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
