'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, User, Car, MessageSquare, Star } from 'lucide-react'

export default function TrustedDriversSection() {
    const supabase = createClient()
    const [unlocks, setUnlocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [ratingModal, setRatingModal] = useState<{ open: boolean, unlock: any } | null>(null)
    const [comment, setComment] = useState('')
    const [rating, setRating] = useState(5)
    const [submitting, setSubmitting] = useState(false)

    const fetchTrusted = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('unlocks')
            .select(`
                id,
                created_at,
                driver_profile_id,
                driver_profiles (
                    id,
                    users (full_name, avatar_url, phone_number),
                    vehicles (brand, model, plate_number)
                ),
                reviews (id, rating, comment)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (!error) setUnlocks(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchTrusted()
    }, [])

    const handleSubmitReview = async () => {
        if (!ratingModal?.unlock) return
        setSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase.from('reviews').insert({
                unlock_id: ratingModal.unlock.id,
                driver_profile_id: ratingModal.unlock.driver_profile_id,
                reviewer_id: user?.id,
                rating,
                comment
            })

            if (error) throw error
            setRatingModal(null)
            setComment('')
            setRating(5)
            fetchTrusted()
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

            {unlocks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unlocks.map((unlock) => {
                        const driver = unlock.driver_profiles
                        const user = driver?.users
                        const vehicle = driver?.vehicles?.[0]
                        const hasReview = unlock.reviews && unlock.reviews.length > 0
                        const review = hasReview ? unlock.reviews[0] : null

                        return (
                            <div key={unlock.id} className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 border-2 border-white/10 overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                <User className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white truncate">{user?.full_name}</h4>
                                        <p className="text-xs text-zinc-500 mb-2">Desbloqueado el {new Date(unlock.created_at).toLocaleDateString()}</p>

                                        {vehicle && (
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono bg-white/5 px-2 py-1 rounded-md w-fit">
                                                <Car className="h-3 w-3" />
                                                {vehicle.brand} {vehicle.model} • {vehicle.plate_number}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                                    <a
                                        href={`https://wa.me/${user?.phone_number?.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        Contactar WhatsApp
                                    </a>

                                    {hasReview ? (
                                        <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                                            <Star className="h-3 w-3 fill-current" />
                                            <span className="text-xs font-black">{review.rating}.0</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setRatingModal({ open: true, unlock })}
                                            className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                                        >
                                            Calificar
                                        </button>
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
