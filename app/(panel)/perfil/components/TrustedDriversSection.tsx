'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, User, Car, MessageSquare, Star } from 'lucide-react'
import { submitReview } from '@/app/actions/reviews'
import ReviewThread from '@/app/components/ReviewThread'

export default function TrustedDriversSection() {
    const supabase = createClient()
    const [unlocks, setUnlocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [ratingModal, setRatingModal] = useState<{ open: boolean, unlock: any } | null>(null)
    const [comment, setComment] = useState('')
    const [rating, setRating] = useState(5)
    const [submitting, setSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)

    const fetchTrusted = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch passenger name
        const { data: userData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single()

        const passengerName = userData?.full_name || 'Pasajero'
        setCurrentUser({ ...user, full_name: passengerName })

        const { data, error } = await supabase
            .from('unlocks')
            .select(`
                id,
                created_at,
                driver_profile_id,
                driver_profiles!unlocks_driver_profile_id_fkey (
                    id,
                    users!driver_profiles_user_id_fkey (id, full_name, avatar_url, phone_number),
                    vehicles (brand, model, plate_number)
                ),
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
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching trusted drivers:', error)
        } else {
            setUnlocks(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchTrusted()
    }, [])

    const handleSubmitReview = async () => {
        if (!ratingModal?.unlock) return
        setSubmitting(true)
        setSuccessMessage(null)

        try {
            const result = await submitReview({
                driver_profile_id: ratingModal.unlock.driver_profile_id,
                social_rating: rating,
                driving_rating: rating,
                assistance_rating: rating,
                comment
            })

            if (!result.success) {
                if (result.error.includes('Ya has calificado')) {
                    setRatingModal(null)
                    setComment('')
                    setRating(5)
                    await fetchTrusted()
                    return
                }
                throw new Error(result.error)
            }

            // Optimistic update to hide button immediately
            setUnlocks(prev => prev.map(u => {
                if (u.id === ratingModal.unlock.id) {
                    return {
                        ...u,
                        reviews: [{ id: 'temp', rating, comment }]
                    }
                }
                return u
            }))

            // Close modal and clear inputs
            setRatingModal(null)
            setComment('')
            setRating(5)

            // Show success message
            setSuccessMessage('¡Gracias por tu calificación! Se ha publicado correctamente.')
            setTimeout(() => setSuccessMessage(null), 5000)

            // Refresh data from server to ensure sync
            await fetchTrusted()
        } catch (error: any) {
            alert('Error al calificar: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Conductores de Confianza</h2>
                    <p className="text-zinc-400 text-sm">Conductores que has desbloqueado y con los que puedes contactar.</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500 opacity-20" />
            </div>

            {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-sm font-medium">{successMessage}</p>
                </div>
            )}

            {unlocks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unlocks.map((unlock) => {
                        const driver = unlock.driver_profiles
                        const user = driver?.users
                        const vehicle = driver?.vehicles?.[0]
                        // Supabase might return an array or a single object depending on the relationship
                        const reviewsData = unlock.reviews
                        const hasReview = !!reviewsData && (Array.isArray(reviewsData) ? reviewsData.length > 0 : !!reviewsData.id)
                        const review = hasReview ? (Array.isArray(reviewsData) ? reviewsData[0] : reviewsData) : null

                        return (
                            <div key={unlock.id} className="group relative bg-[#121214] border border-white/[0.05] rounded-[2.5rem] p-8 hover:bg-[#161619] transition-all duration-300">
                                {/* Header */}
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-zinc-800 border border-white/10 overflow-hidden shadow-2xl">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                <User className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xl font-bold text-white tracking-tight truncate">{user?.full_name}</h4>
                                        <p className="text-sm text-zinc-500 font-medium mb-3">Conductor • Desbloqueado el {new Date(unlock.created_at).toLocaleDateString()}</p>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <a
                                                href={`https://wa.me/${user?.phone_number?.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 text-xs font-bold hover:bg-[#25D366]/20 transition-all"
                                            >
                                                <MessageSquare className="h-4 w-4 fill-current opacity-70" />
                                                WhatsApp
                                            </a>
                                            {vehicle && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-zinc-400">
                                                    <Car className="h-3 w-3" />
                                                    {vehicle.brand} {vehicle.model}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5 w-full my-6" />

                                <div className="space-y-6">
                                    {hasReview ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 bg-yellow-500/5 text-yellow-500 px-4 py-2 rounded-2xl border border-yellow-500/10 w-fit">
                                                <Star className="h-4 w-4 fill-current" />
                                                <span className="text-sm font-black tracking-tight">{review.rating}.0</span>
                                                <span className="text-[11px] font-bold opacity-60 ml-1">Tu Calificación</span>
                                            </div>

                                            <div className="bg-white/[0.03] border border-white/[0.05] rounded-[2rem] p-6 shadow-inner">
                                                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6">Seguimiento de Servicio</div>
                                                <div className="scale-100 origin-top-left">
                                                    <ReviewThread
                                                        review={{
                                                            ...review,
                                                            driver_profiles: unlock.driver_profiles
                                                        }}
                                                        currentUserId={currentUser?.id}
                                                        driverName={user?.full_name}
                                                        passengerName={currentUser?.full_name}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-4 py-4 px-6 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                                            <p className="text-sm text-zinc-500 italic font-medium">Aún no has calificado a este conductor.</p>
                                            <button
                                                onClick={() => setRatingModal({ open: true, unlock })}
                                                className="px-6 py-2.5 bg-white text-black text-xs font-black rounded-xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
                                            >
                                                CALIFICAR AHORA
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <Shield className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">Aún no tienes conductores de confianza.</p>
                </div>
            )}

            {/* Rating Modal */}
            {ratingModal?.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setRatingModal(null)} />
                    <div className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-4 mb-8">
                            <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
                                <Star className="h-10 w-10 text-yellow-500" />
                            </div>
                            <h3 className="text-2xl font-bold">Calificar a {ratingModal.unlock.driver_profiles?.users?.full_name}</h3>
                            <p className="text-zinc-400 text-sm">Tu opinión ayuda a mantener la comunidad segura y confiable.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase text-zinc-500 text-center block">¿Qué calificación le das?</label>
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setRating(num)}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${rating >= num ? 'bg-yellow-500 text-black' : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                                                }`}
                                        >
                                            <Star className={`h-6 w-6 ${rating >= num ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">¿Tienes algún comentario? (Opcional)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Ej. Excelente servicio, muy puntual y amable..."
                                    className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 min-h-[100px] text-white focus:border-yellow-500 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setRatingModal(null)}
                                    className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold bg-white/5 text-zinc-400 hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold bg-yellow-500 text-black hover:bg-yellow-600 transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20"
                                >
                                    {submitting ? 'Enviando...' : 'Publicar Reseña'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
