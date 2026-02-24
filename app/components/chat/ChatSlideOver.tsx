'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, Send, Loader2, User, MessageSquare } from 'lucide-react'

export default function ChatSlideOver() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const otherUserId = searchParams.get('chat')

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [otherUser, setOtherUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    // Manejar apertura/cierre basado en query param
    useEffect(() => {
        if (otherUserId) {
            setIsOpen(true)
            loadChatData(otherUserId)
        } else {
            setIsOpen(false)
            setMessages([])
            setOtherUser(null)
        }
    }, [otherUserId])

    // Scroll automático al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Suscripción a nuevos mensajes
    useEffect(() => {
        if (!isOpen || !currentUser || !otherUserId) return

        const channel = supabase.channel('chat_messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new
                    // Si el mensaje es parte de esta conversación
                    if (
                        (newMsg.sender_id === currentUser.id && newMsg.receiver_id === otherUserId) ||
                        (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUser.id)
                    ) {
                        setMessages((prev) => {
                            if (prev.find(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        })

                        // Marcar como leído si lo recibimos nosotros
                        if (newMsg.receiver_id === currentUser.id && !newMsg.read_at) {
                            markAsRead(newMsg.id)
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [isOpen, currentUser, otherUserId, supabase])

    const loadChatData = async (targetUserId: string) => {
        setLoading(true)

        // 1. Obtener usuario actual
        let me = currentUser
        if (!me) {
            const { data: { user } } = await supabase.auth.getUser()
            me = user
            setCurrentUser(user)
        }

        if (!me) {
            setLoading(false)
            return
        }

        // 2. Obtener datos del otro usuario
        const { data: otherUserData } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .eq('id', targetUserId)
            .single()

        setOtherUser(otherUserData)

        // 3. Obtener historial de mensajes
        const { data: chatHistory } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${me.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${me.id})`)
            .order('created_at', { ascending: true })

        if (chatHistory) {
            setMessages(chatHistory)

            // Marcar mensajes no leídos como leídos
            const unreadIds = chatHistory
                .filter(m => m.receiver_id === me.id && !m.read_at)
                .map(m => m.id)

            if (unreadIds.length > 0) {
                await supabase
                    .from('messages')
                    .update({ read_at: new Date().toISOString() })
                    .in('id', unreadIds)
            }
        }

        setLoading(false)
    }

    const markAsRead = async (messageId: string) => {
        await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', messageId)
    }

    const handleClose = () => {
        // Remover el param 'chat' sin recargar la página
        const params = new URLSearchParams(searchParams.toString())
        params.delete('chat')
        const newUrl = `${pathname}${params.toString() ? '?' + params.toString() : ''}`
        router.push(newUrl)
        setIsOpen(false)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUser || !otherUserId || sending) return

        setSending(true)
        const msgContent = newMessage.trim()
        setNewMessage('') // Optimizamos respuesta visual

        // Actualización Optimista UI
        const tempId = `temp-${Date.now()}`
        const optimisticMsg = {
            id: tempId,
            sender_id: currentUser.id,
            receiver_id: otherUserId,
            content: msgContent,
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, optimisticMsg])

        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: currentUser.id,
                receiver_id: otherUserId,
                content: msgContent
            })
            .select()
            .single()

        if (error) {
            console.error('Error enviando mensaje:', error)
            // Revertir en caso de error
            setNewMessage(msgContent)
            setMessages(prev => prev.filter(m => m.id !== tempId))
        } else if (data) {
            setMessages(prev => {
                if (prev.find(m => m.id === data.id)) {
                    return prev.filter(m => m.id !== tempId)
                }
                return prev.map(m => m.id === tempId ? data : m)
            })
        }

        setSending(false)
    }

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
                    onClick={handleClose}
                />
            )}

            {/* Slide-over Panel */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#0F2137] text-white">
                    <div className="flex items-center gap-3">
                        {otherUser ? (
                            <img
                                src={otherUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.full_name)}&background=random`}
                                alt={otherUser.full_name}
                                className="w-10 h-10 rounded-full border border-gray-600 object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-sm tracking-wide text-white">
                                {loading && !otherUser ? 'Cargando...' : otherUser?.full_name || 'Usuario Extraviado'}
                            </h3>
                            {otherUser && <span className="text-[10px] text-green-400 font-medium">Chat Seguro</span>}
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FAF8] flex flex-col gap-4">
                    {loading && messages.length === 0 ? (
                        <div className="flex-1 flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm font-medium">No hay mensajes aún.</p>
                            <p className="text-xs text-gray-400">Envía un saludo para comenzar.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === currentUser?.id
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${isMe
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-[#0F2137] border border-gray-100 rounded-bl-none'
                                        }`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            disabled={sending || loading || !otherUserId}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending || loading || !otherUserId}
                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20"
                        >
                            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </button>
                    </form>
                </div>

            </div>
        </>
    )
}


