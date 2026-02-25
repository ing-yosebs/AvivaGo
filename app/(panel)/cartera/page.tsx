'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Users, Search, MessageSquare, Save, Car, BookOpen, Clock, Loader2, Download } from 'lucide-react'
import Link from 'next/link'

export default function CarteraPage() {
    const [passengers, setPassengers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPassenger, setSelectedPassenger] = useState<any | null>(null)
    const [noteContent, setNoteContent] = useState('')
    const [savingNote, setSavingNote] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchPassengers = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Get referred users who are NOT drivers (i.e. passengers)
            const { data: referredUsers, error } = await supabase
                .from('users')
                .select(`
                    id,
                    full_name,
                    email,
                    avatar_url,
                    created_at,
                    roles,
                    address_state
                `)
                .eq('referred_by', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching referred passengers:', error)
                setLoading(false)
                return
            }
            const passengerRefs = (referredUsers || [])
                .filter(r => !r.roles?.includes('driver'))
                .map(r => ({ ...r, source: 'Invitado' }))

            // 2. Get passengers who requested quotes
            let requestedPassengers: any[] = []
            const { data: profile } = await supabase
                .from('driver_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (profile) {
                const { data: quotes } = await supabase
                    .from('quote_requests')
                    .select('passenger_id')
                    .eq('driver_id', profile.id)

                if (quotes && quotes.length > 0) {
                    const passengerIds = Array.from(new Set(quotes.map(q => q.passenger_id)))
                    const { data: reqUsers } = await supabase
                        .from('users')
                        .select(`
                            id,
                            full_name,
                            email,
                            avatar_url,
                            created_at,
                            roles,
                            address_state
                        `)
                        .in('id', passengerIds)

                    if (reqUsers) {
                        requestedPassengers = reqUsers
                            .filter(r => !r.roles?.includes('driver'))
                            .map(r => ({ ...r, source: 'Orgánico' }))
                    }
                }
            }

            // 3. Merge and deduplicate
            const allUsers = [...passengerRefs, ...requestedPassengers]
            const uniqueUsersMap = new Map()

            allUsers.forEach(u => {
                const existing = uniqueUsersMap.get(u.id)
                // If it already exists and was 'Invitado', keep it as 'Invitado' even if seen again as 'Orgánico'
                if (!existing || (existing.source === 'Orgánico' && u.source === 'Invitado')) {
                    uniqueUsersMap.set(u.id, u)
                }
            })

            let finalPassengers = Array.from(uniqueUsersMap.values())

            // Sort by created_at descending
            finalPassengers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            // 4. Fetch notes for these passengers
            const finalPassengerIds = finalPassengers.map(p => p.id)
            let notesData: any[] = []

            if (finalPassengerIds.length > 0) {
                const { data: notes } = await supabase
                    .from('driver_passenger_notes')
                    .select('passenger_id, note')
                    .eq('driver_id', user.id)
                    .in('passenger_id', finalPassengerIds)

                if (notes) notesData = notes
            }

            // 5. Fetch unread messages count for these passengers
            let unreadCounts: { [key: string]: number } = {}
            if (finalPassengerIds.length > 0) {
                const { data: messages } = await supabase
                    .from('messages')
                    .select('sender_id')
                    .eq('receiver_id', user.id)
                    .in('sender_id', finalPassengerIds)
                    .is('read_at', null)

                if (messages) {
                    messages.forEach(msg => {
                        unreadCounts[msg.sender_id] = (unreadCounts[msg.sender_id] || 0) + 1
                    })
                }
            }

            const processedRefs = finalPassengers.map(ref => {
                const noteObj = notesData.find(n => n.passenger_id === ref.id)
                return {
                    ...ref,
                    note: noteObj ? noteObj.note : '',
                    unread_count: unreadCounts[ref.id] || 0
                }
            })

            setPassengers(processedRefs)
            setLoading(false)
        }
        fetchPassengers()
    }, [supabase])

    const handleDownloadCSV = () => {
        if (passengers.length === 0) return

        // Create CSV Header
        const headers = ['Nombre', 'Ubicación', 'Origen', 'Fecha de Registro', 'Observaciones']

        // Map passengers to rows
        const rows = passengers.map(p => {
            const date = new Date(p.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
            // Escape quotes inside notes and wrap in quotes to handle commas
            const note = p.note ? `"${p.note.replace(/"/g, '""')}"` : ''
            const location = p.address_state ? `"${p.address_state.replace(/"/g, '""')}"` : ''
            const name = p.full_name ? `"${p.full_name.replace(/"/g, '""')}"` : ''

            return [name, location, p.source || 'N/A', date, note].join(',')
        })

        // Combine headers and rows
        const csvContent = [headers.join(','), ...rows].join('\n')

        // Add UTF-8 BOM for Excel
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        // Create download link
        const link = document.createElement('a')
        const dateString = new Date().toISOString().split('T')[0]
        link.href = url
        link.setAttribute('download', `cartera_pasajeros_${dateString}.csv`)
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const handleSaveNote = async () => {
        if (!selectedPassenger) return
        setSavingNote(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('driver_passenger_notes')
            .upsert({
                driver_id: user.id,
                passenger_id: selectedPassenger.id,
                note: noteContent,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'driver_id, passenger_id'
            })

        if (!error) {
            setPassengers(passengers.map(p =>
                p.id === selectedPassenger.id ? { ...p, note: noteContent } : p
            ))
            setSelectedPassenger(null)
            setNoteContent('')
        } else {
            console.error('Error saving note:', error)
        }
        setSavingNote(false)
    }

    const filteredPassengers = passengers.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address_state?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-4 md:p-8">
            <header className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-[#0F2137]">
                        <BookOpen className="h-10 w-10 text-blue-600" />
                        Cartera de Pasajeros
                    </h1>
                    <p className="text-gray-500 mt-2">Gestiona y comunícate con los pasajeros que has invitado a AvivaGo.</p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar pasajero o ciudad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={handleDownloadCSV}
                        disabled={passengers.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all whitespace-nowrap justify-center"
                        title="Exportar a CSV"
                    >
                        <Download className="h-5 w-5" />
                        Descargar Cartera de Pasajeros
                    </button>
                </div>
            </header>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-soft">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-black text-[#0F2137]">Mis Pasajeros Registrados</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Total: {passengers.length} pasajeros</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <Users className="h-5 w-5 text-blue-500" />
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    {filteredPassengers.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredPassengers.map(passenger => (
                                <div key={passenger.id} className="flex flex-col p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={passenger.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(passenger.full_name)}&background=random`}
                                                    alt={passenger.full_name}
                                                    className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-2 ring-white"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-blue-500" title="Pasajero" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#0F2137] text-lg leading-tight">{passenger.full_name}</h4>
                                                <p className="text-sm text-gray-500">{passenger.address_state || 'Ubicación no especificada'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                                                        Registrado: {new Date(passenger.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-left">
                                                    {passenger.source === 'Invitado' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            Invitado
                                                        </span>
                                                    ) : passenger.source === 'Orgánico' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                                            Orgánico
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex flex-col gap-2">
                                            <Link
                                                href={`?chat=${passenger.id}`}
                                                className="flex items-center justify-center p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md shadow-blue-600/20 group/btn relative"
                                                title="Enviar Mensaje"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                {passenger.unread_count > 0 && (
                                                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] text-white items-center justify-center font-black shadow-md border-2 border-white">
                                                            {passenger.unread_count > 9 ? '9+' : passenger.unread_count}
                                                        </span>
                                                    </span>
                                                )}
                                                <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Enviar Mensaje</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setSelectedPassenger(passenger)
                                                    setNoteContent(passenger.note)
                                                }}
                                                className={`p-2.5 rounded-xl transition-all border ${passenger.note ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-indigo-50 border-indigo-200 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700'} group/btn relative`}
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    {passenger.note ? 'Editar Observación' : 'Añadir Observación'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mostrar fragmento de nota si existe */}
                                    {passenger.note && (
                                        <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                            <p className="text-xs text-indigo-800/80 italic font-medium line-clamp-2">
                                                "{passenger.note}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                <Users className="h-10 w-10 text-gray-300" />
                            </div>
                            <h4 className="text-[#0F2137] font-black uppercase tracking-widest">No hay pasajeros</h4>
                            <p className="text-gray-500 text-sm mt-2">Aún no has invitado pasajeros o ninguno coincide con la búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para Observaciones */}
            {selectedPassenger && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2137]/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                                <BookOpen className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#0F2137]">Observación</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{selectedPassenger.full_name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nota privada (solo tú puedes verla)</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-[#0F2137] min-h-[120px] focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all resize-none"
                                    placeholder="Ej. Prefiere la música clásica, viaja seguido al aeropuerto..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={() => setSelectedPassenger(null)}
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
