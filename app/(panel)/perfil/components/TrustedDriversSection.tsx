'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, User, Car, MessageCircle, Star, ExternalLink } from 'lucide-react'
import Link from 'next/link'
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

        if (!user?.id) {
            console.error('No user ID found for fetching trusted drivers')
            return
        }

        console.log('Fetching trusted drivers for user:', user.id)
        const { data, error } = await supabase.rpc('get_trusted_drivers', { target_user_id: user.id })

        if (error) {
            console.error('RPC Error details:', JSON.stringify(error, null, 2))
        } else {
            const formatted = (data as any[] || []).map(row => ({
                id: row.id,
                created_at: row.created_at,
                driver_profile_id: row.driver_profile_id,
                driver_profiles: {
                    id: row.driver_profile_id,
                    whatsapp_number: row.driver_whatsapp,
                    profile_photo_url: row.driver_avatar_url,
                    bio: row.driver_bio,
                    users: {
                        full_name: row.driver_full_name,
                        avatar_url: row.user_avatar_url
                    },
                    vehicles: row.vehicle_brand ? [{
                        brand: row.vehicle_brand,
                        model: row.vehicle_model,
                        plate_number: row.vehicle_plate
                    }] : []
                },
                reviews: row.review_id ? {
                    id: row.review_id,
                    rating: row.review_rating,
                    comment: row.review_comment,
                    driver_reply: row.review_driver_reply,
                    driver_reply_at: row.review_driver_reply_at
                } : null
            }))
            setUnlocks(formatted)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchTrusted()
    }, [])

    const handleSubmitReview = async () => {
        if (!ratingModal?.unlock) return
        setSubmitting(true)

        try {
            const result = await submitReview({
                driver_profile_id: ratingModal.unlock.driver_profile_id,
                social_rating: rating,
                driving_rating: rating,
                assistance_rating: rating,
                comment
            })

            if (!result.success) {
                if (result.error?.includes('Ya has calificado')) {
                    setRatingModal(null)
                    setComment('')
                    setRating(5)
                    await fetchTrusted()
                    return
                }
                throw new Error(result.error || 'Failed to submit review')
            }

            setRatingModal(null)
            setComment('')
            setRating(5)
            setSuccessMessage('¡Gracias por tu calificación! Se ha publicado correctamente.')
            setTimeout(() => setSuccessMessage(null), 5000)
            await fetchTrusted()
        } catch (error: any) {
            alert('Error al calificar: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-white border border-gray-100 rounded-[2.5rem] animate-pulse" />
            ))}
        </div>
    )

    return (
        <div className="space-y-6">
            {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-sm font-medium">{successMessage}</p>
                </div>
            )}

            {unlocks.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {unlocks.map((unlock) => {
                        const driver = unlock.driver_profiles
                        const user = driver?.users
                        const vehicle = driver?.vehicles?.[0]
                        const reviewsData = unlock.reviews
                        const hasReview = !!reviewsData && (Array.isArray(reviewsData) ? reviewsData.length > 0 : !!reviewsData.id)
                        const review = hasReview ? (Array.isArray(reviewsData) ? reviewsData[0] : reviewsData) : null

                        return (
                            <div key={unlock.id} className="group relative bg-white border border-zinc-100 rounded-[2.5rem] p-6 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden isolate">
                                {/* Base Link Layer (Covers the whole card) */}
                                <Link
                                    href={`/driver/${driver.id}`}
                                    className="absolute inset-0 z-10"
                                    aria-label={`Ver perfil de ${user?.full_name}`}
                                />

                                {/* Content Layer */}
                                <div className="relative z-20 pointer-events-none">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-4">
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-zinc-50 border border-zinc-100 overflow-hidden shadow-sm pointer-events-auto relative shrink-0">
                                            {(driver.users?.avatar_url || driver.profile_photo_url) ? (
                                                <img
                                                    src={driver.users?.avatar_url || driver.profile_photo_url}
                                                    alt={user?.full_name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => {
                                                        const target = e.currentTarget as HTMLImageElement;
                                                        if (driver.profile_photo_url && target.src !== driver.profile_photo_url) {
                                                            target.src = driver.profile_photo_url;
                                                        } else {
                                                            target.style.display = 'none';
                                                            target.parentElement?.classList.add('fallback-active');
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 -z-10 bg-zinc-50">
                                                <User className="h-10 w-10" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xl sm:text-2xl font-black text-[#0F2137] tracking-tight truncate group-hover:text-blue-600 transition-colors">
                                                        {user?.full_name}
                                                    </h4>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-2" />
                                            </div>

                                            <div className="mb-6">
                                                <p className="text-sm text-zinc-500 line-clamp-2 italic leading-relaxed">
                                                    {driver.bio || "Este conductor no ha redactado su reseña profesional."}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-4 pointer-events-auto">
                                                {vehicle && (
                                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-600 w-fit">
                                                        <Car className="h-4 w-4 text-blue-500 opacity-70" />
                                                        <span className="uppercase tracking-wider">{vehicle.brand} {vehicle.model}</span>
                                                    </div>
                                                )}

                                                <a
                                                    href={`https://wa.me/${driver.whatsapp_number?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${user?.full_name}, te contacto desde AvivaGo para coordinar un servicio.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#128C7E] hover:scale-105 transition-all shadow-lg shadow-[#25D366]/20 active:scale-95 w-fit"
                                                >
                                                    <MessageCircle className="h-4 w-4 fill-current" />
                                                    Escribir al WhatsApp
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-zinc-50 w-full mb-4" />

                                    <div className="space-y-6">
                                        {hasReview ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-1.5 rounded-full w-fit shadow-lg shadow-yellow-400/20">
                                                    <Star className="h-3.5 w-3.5 fill-current" />
                                                    <span className="text-xs font-black">{review.rating}.0</span>
                                                    <div className="w-px h-3 bg-white/20 mx-1" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Tu Calificación</span>
                                                </div>

                                                <div className="bg-zinc-50/50 border border-zinc-200/50 rounded-[2rem] p-6 pointer-events-auto backdrop-blur-sm">
                                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        Seguimiento de Servicio
                                                    </div>
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
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-blue-50/40 rounded-[2rem] border border-blue-100/40 pointer-events-auto">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-blue-100/50 rounded-xl text-blue-600">
                                                        <Star className="h-5 w-5" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm text-blue-900 font-bold">¿Cómo fue tu viaje?</p>
                                                        <p className="text-[11px] text-blue-800/60 font-medium">Aún no has calificado este conductor.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setRatingModal({ open: true, unlock });
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3.5 bg-[#0F2137] text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-xl hover:bg-blue-600 hover:scale-105 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                                                >
                                                    Calificar Ahora
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="py-24 text-center bg-white border border-dashed border-zinc-200 rounded-[3rem]">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-10 w-10 text-zinc-200" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Sin conductores todavía</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mx-auto">Los conductores que desbloquees aparecerán aquí para que puedas contactarlos fácilmente.</p>
                </div>
            )}

            {/* Rating Modal */}
            {ratingModal?.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setRatingModal(null)} />
                    <div className="relative bg-white border border-zinc-100 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-4 mb-10">
                            <div className="w-24 h-24 rounded-3xl bg-yellow-400 shadow-xl shadow-yellow-400/20 flex items-center justify-center mx-auto transform -rotate-6 rotate-hover transition-transform">
                                <Star className="h-12 w-12 text-white fill-current" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-[#0F2137] tracking-tight">Calificar Servicio</h3>
                                <p className="text-zinc-500 text-sm font-medium">Estás calificando a <span className="text-blue-600 font-bold">{ratingModal.unlock.driver_profiles?.users?.full_name}</span></p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center block">¿Cuántas estrellas le das?</label>
                                <div className="flex justify-center gap-4">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setRating(num)}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform active:scale-90 ${rating >= num
                                                ? 'bg-yellow-400 text-white shadow-xl shadow-yellow-400/30 scale-110'
                                                : 'bg-zinc-50 text-zinc-200 hover:bg-zinc-100'
                                                }`}
                                        >
                                            <Star className={`h-7 w-7 ${rating >= num ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Comparte tu experiencia</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Ej. Excelente servicio, muy puntual y amable..."
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-[2rem] p-6 min-h-[140px] text-[#0F2137] font-medium focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all resize-none placeholder:text-zinc-300 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={() => setRatingModal(null)}
                                    className="flex-1 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting}
                                    className="flex-1 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-[#0F2137] text-white hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-[#0F2137]/10 active:scale-95"
                                >
                                    {submitting ? 'Enviando...' : 'Publicar Calificación'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
