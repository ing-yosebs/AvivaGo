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

            <div className="relative z-10 flex flex-col gap-6">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
                    <Share2 className="h-7 w-7 text-white" />
                    Tu Perfil Público como conductor
                </h2>

                <p className="text-blue-50 text-sm md:text-base max-w-2xl leading-relaxed">
                    Crea tu propia cartera de clientes con los pasajeros que abordan tu vehículo. Mantén tu información siempre actualizada para proyectar profesionalismo y comparte tu perfil personal con ellos para fidelizarlos y que puedan contactarte de nuevo directamente.
                </p>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex flex-row items-center gap-3 md:gap-4 w-full sm:w-auto">
                        <Link
                            href={`/driver/${driverProfileId}`}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95 text-white text-sm md:text-base"
                        >
                            <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
                            Ver Perfil
                        </Link>

                        <button
                            onClick={handleShare}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-bold transition-all shadow-lg text-sm md:text-base ${copied
                                ? 'bg-green-400 text-white'
                                : 'bg-white text-blue-600 hover:bg-blue-50 active:scale-95'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                                    Copiado
                                </>
                            ) : (
                                <>
                                    <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                                    Compartir
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20 whitespace-nowrap self-center lg:self-auto">
                        <span className="text-base">✅</span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-50">Tu perfil personal será siempre visible gratis</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
