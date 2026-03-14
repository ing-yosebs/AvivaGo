'use client'

import React from 'react'
import AvivaLogo from './AvivaLogo'

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F9FAF8]/80 backdrop-blur-md transition-all duration-500">
            {/* Background Decorative Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px] -z-10 animate-pulse" />
            
            <div className="relative flex flex-col items-center">
                {/* Logo with scale animation */}
                <div className="mb-10 animate-bounce transition-transform duration-1000">
                    <AvivaLogo className="h-16 w-auto" />
                </div>

                {/* Modern Spinner */}
                <div className="relative w-16 h-16">
                    {/* Outer ring */}
                    <div className="absolute inset-0 border-4 border-[#2563EB]/10 rounded-full" />
                    
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 border-4 border-t-[#2563EB] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                    
                    {/* Inner glowing dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-ping" />
                    </div>
                </div>

                {/* Text feedback */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    <span className="text-[#0F2137] font-black text-sm uppercase tracking-[0.3em] ml-[0.3em]">
                        Cargando
                    </span>
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Footer Tagline */}
            <div className="absolute bottom-12 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Seguridad y Confianza en cada Kilómetro
                </p>
            </div>
        </div>
    )
}
