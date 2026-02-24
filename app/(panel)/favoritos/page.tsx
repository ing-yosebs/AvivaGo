'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Heart,
    Star,
    MapPin,
    ShieldCheck,
    ChevronRight,
    Search,
    Car,
    Trash2,
    MessageSquare,
    BookOpen,
    Save,
    Loader2,
    ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DriverCard from '../../components/DriverCard'

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDriver, setSelectedDriver] = useState<any | null>(null)
    const [noteContent, setNoteContent] = useState('')
    const [savingNote, setSavingNote] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchFavorites = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Join favorites with driver_profiles and users
            const { data } = await supabase
                .from('favorites')
                .select(`
                    id,
                    is_locked,
                    driver_profile_id,
                    driver_profiles (
                        *,
                        users (
                            full_name,
                            avatar_url,
                            address_state
                        ),
                        vehicles (*),
                        driver_services (*)
                    )
                `)
                .eq('user_id', user.id)

            let unreadCounts: { [key: string]: number } = {}

            if (data && data.length > 0) {
                // Fetch unread messages for this user
                const { data: messages } = await supabase
                    .from('messages')
                    .select('sender_id')
                    .eq('receiver_id', user.id)
                    .is('read_at', null)

                if (messages) {
                    messages.forEach(msg => {
                        unreadCounts[msg.sender_id] = (unreadCounts[msg.sender_id] || 0) + 1
                    })
                }

                // Fetch passenger notes for these drivers
                const driverIds = data.map(f => {
                    const prof = Array.isArray(f.driver_profiles) ? f.driver_profiles[0] : f.driver_profiles;
                    return prof?.user_id;
                }).filter(Boolean)
                let notesData: any[] = []
                if (driverIds.length > 0) {
                    const { data: notes } = await supabase
                        .from('passenger_driver_notes')
                        .select('driver_id, note')
                        .eq('passenger_id', user.id)
                        .in('driver_id', driverIds)
                    if (notes) notesData = notes
                }

                const flattened = data.map(fav => {
                    const profile = Array.isArray(fav.driver_profiles) ? fav.driver_profiles[0] : fav.driver_profiles
                    const noteObj = profile?.user_id ? notesData.find(n => n.driver_id === profile.user_id) : null
                    return {
                        ...fav,
                        driver_profiles: profile,
                        unread_count: profile?.user_id ? (unreadCounts[profile.user_id] || 0) : 0,
                        note: noteObj ? noteObj.note : ''
                    }
                })
                setFavorites(flattened)
            }
            setLoading(false)
        }
        fetchFavorites()
    }, [supabase])

    const handleUnfavorite = async (e: React.MouseEvent, favId: string) => {
        e.preventDefault()
        e.stopPropagation()
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favId)

        if (!error) {
            setFavorites(favorites.filter(f => f.id !== favId))
        }
    }

    const handleSaveNote = async () => {
        if (!selectedDriver) return
        setSavingNote(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const targetDriverId = selectedDriver.driver_profiles.user_id

        const { error } = await supabase
            .from('passenger_driver_notes')
            .upsert({
                passenger_id: user.id,
                driver_id: targetDriverId,
                note: noteContent,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'passenger_id, driver_id'
            })

        if (!error) {
            setFavorites(favorites.map(f =>
                f.id === selectedDriver.id ? { ...f, note: noteContent } : f
            ))
            setSelectedDriver(null)
            setNoteContent('')
        } else {
            console.error('Error saving note:', error)
        }
        setSavingNote(false)
    }

    if (loading) return <div className="animate-pulse space-y-4">
        <div className="h-10 bg-white/5 rounded-xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-white/5 rounded-3xl" />
            <div className="h-64 bg-white/5 rounded-3xl" />
        </div>
    </div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Conductores Favoritos</h1>
                    <p className="text-zinc-400">Acceso rápido a los conductores que mejor servicio te han brindado.</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-2xl">
                    <Heart className="h-6 w-6 text-red-500 fill-current" />
                </div>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {favorites.map((fav) => (
                        <div key={fav.id} className="relative group/fav">
                            <DriverCard
                                driver={fav.driver_profiles}
                                note={fav.note}
                                renderFooter={() => (
                                    <div className="flex items-center gap-2">
                                        {/* Botón de Observación */}
                                        {fav.driver_profiles?.user_id && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedDriver(fav)
                                                    setNoteContent(fav.note || '')
                                                }}
                                                className={`p-2 rounded-xl transition-all border flex items-center justify-center ${fav.note ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-indigo-50 text-indigo-500 border-indigo-100 hover:bg-indigo-100 hover:text-indigo-700'}`}
                                                title={fav.note ? 'Ver o editar nota' : 'Añadir nota'}
                                            >
                                                <BookOpen className="h-4 w-4" />
                                            </button>
                                        )}

                                        {/* Botón de Chat */}
                                        {fav.driver_profiles?.user_id && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    router.push(`?chat=${fav.driver_profiles.user_id}`);
                                                }}
                                                className="relative p-2 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                                                title="Chat"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                {fav.unread_count > 0 && (
                                                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] text-white items-center justify-center font-black shadow-md border-2 border-white">
                                                            {fav.unread_count > 9 ? '9+' : fav.unread_count}
                                                        </span>
                                                    </span>
                                                )}
                                            </button>
                                        )}

                                        <div className="flex items-center gap-1 text-aviva-primary text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all ml-1">
                                            Ver Perfil
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                )}
                            />

                            {fav.is_locked ? (
                                <div
                                    className="absolute top-4 right-4 z-20 p-2.5 bg-amber-500/10 backdrop-blur-md rounded-xl text-amber-600 border border-amber-500/20 shadow-xl cursor-help"
                                    title="Tu Referente: No se puede eliminar"
                                >
                                    <ShieldCheck className="h-4 w-4 fill-current" />
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => handleUnfavorite(e, fav.id)}
                                    className="absolute top-4 right-4 z-20 p-2.5 bg-red-500/10 hover:bg-red-500 backdrop-blur-md rounded-xl text-red-500 hover:text-white border border-red-500/20 transition-all shadow-xl"
                                    title="Eliminar de favoritos"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center bg-white/5 rounded-[40px] border border-dashed border-white/10">
                    <Heart className="h-16 w-16 text-zinc-800 mx-auto mb-6" />
                    <h3 className="text-xl font-bold mb-2">Aún no tienes favoritos</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                        Explora nuestro directorio y guarda a los mejores conductores para tenerlos siempre a la mano.
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        Explorar Directorio
                    </Link>
                </div>
            )}

            {/* Modal para Observaciones Locales (Pasajeros) */}
            {selectedDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 text-zinc-900">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                                <BookOpen className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#0F2137]">Observación Privada</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{selectedDriver.driver_profiles?.users?.full_name || 'Conductor'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nota privada (solo tú puedes verla)</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-[#0F2137] min-h-[120px] focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all resize-none"
                                    placeholder="Ej. Muy amable, conduce un sedán rojo, mejor llamarle por teléfono..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={() => setSelectedDriver(null)}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    disabled={savingNote}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
