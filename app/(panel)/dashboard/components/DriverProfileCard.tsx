'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Share2, ExternalLink, Check } from 'lucide-react'

interface DriverProfileCardProps {
    driverProfileId: string
}

export function DriverProfileCard({ driverProfileId }: DriverProfileCardProps) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const url = `${window.location.origin}/driver/${driverProfileId}`
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Mi perfil de conductor en AvivaGo',
                    text: 'Mira mi perfil y calificaciones en AvivaGo:',
                    url: url
                })
            } else {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        } catch (err) {
            console.error('Error sharing:', err)
        }
    }

    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
                        <Share2 className="h-7 w-7 text-white" />
                        Tu Perfil Público
                    </h2>
                    <p className="text-blue-50 text-sm md:text-base max-w-lg leading-relaxed">
                        Aquí puedes ver cómo tus pasajeros verán tu perfil, tu reputación y tus servicios antes de solicitar un viaje contigo. ¡Asegúrate de tenerlo siempre actualizado!
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <Link
                        href={`/driver/${driverProfileId}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95 text-white"
                    >
                        <ExternalLink className="h-5 w-5" />
                        Ver Perfil
                    </Link>

                    <button
                        onClick={handleShare}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${copied
                            ? 'bg-green-400 text-white'
                            : 'bg-white text-blue-600 hover:bg-blue-50 active:scale-95'
                            }`}
                    >
                        {copied ? (
                            <>
                                <Check className="h-5 w-5" />
                                Copiado
                            </>
                        ) : (
                            <>
                                <Share2 className="h-5 w-5" />
                                Compartir
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
