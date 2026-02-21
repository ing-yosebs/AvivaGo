'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowRight, ShieldAlert, X } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

interface MissingInfoModalProps {
    user: any
}

export default function MissingInfoModal({ user }: MissingInfoModalProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [userPhone, setUserPhone] = useState<string | null>(null)

    const hasEmail = user?.email && user.email.trim() !== ''

    useEffect(() => {
        if (!user) return

        const checkData = async () => {
            const supabase = createClient()

            // Get phone from users table
            const { data: profile } = await supabase
                .from('users')
                .select('phone')
                .eq('id', user.id)
                .single()

            const phone = user?.phone || profile?.phone
            setUserPhone(phone)

            const hasPhone = phone && phone.trim() !== ''
            const missingData = !hasEmail || !hasPhone

            // Don't show if already on profile page
            const isProfilePage = pathname === '/perfil'
            const hasSeenModal = sessionStorage.getItem(`missingInfoModalShown_${user.id}`) === 'true';

            if (missingData && !isProfilePage && !hasSeenModal) {
                setIsVisible(true)
                sessionStorage.setItem(`missingInfoModalShown_${user.id}`, 'true');
            } else {
                setIsVisible(false)
            }
            setIsLoading(false)
        }

        checkData()
    }, [user, pathname, hasEmail])

    if (!isVisible || isLoading) return null

    const missingFields = []
    if (!hasEmail) missingFields.push('correo electrónico')
    if (!(userPhone && userPhone.trim() !== '')) missingFields.push('teléfono')

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-red-100 animate-in zoom-in-95 duration-300 relative">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 border border-red-500 hover:border-red-700 rounded-full transition-all z-20 hover:scale-110"
                    title="Cerrar"
                >
                    <X className="h-4 w-4" />
                </button>
                <div className="bg-yellow-50 p-6 border-b border-yellow-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-[#0F2137]">¡Tu seguridad es primero!</h3>
                        <p className="text-yellow-700 text-sm font-medium">Completa tu información básica</p>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-gray-600 text-base leading-relaxed text-center md:text-left">
                        Para ayudar a mejorar la seguridad de la comunidad y habilitar todas las funciones de tu perfil, necesitamos validar tu{' '}
                        {missingFields.map((field, index) => (
                            <span key={field}>
                                <strong className="text-[#0F2137]">{field}</strong>
                                {index < missingFields.length - 2 ? ', ' : index === missingFields.length - 2 ? ' y ' : ''}
                            </span>
                        ))}
                        .
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push('/perfil')}
                            className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all flex justify-center items-center gap-2 shadow-lg shadow-black/20 group"
                        >
                            <span>Vincular y Validar Datos</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

