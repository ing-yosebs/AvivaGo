'use client'

import React, { useRef, useState } from 'react'
import { Download, Printer, Shield, Tag, CreditCard } from 'lucide-react'
import html2canvas from 'html2canvas'

interface DriverMarketingKitProps {
    profile: {
        id: string
        full_name: string
        display_avatar: string | null
        referral_code: string
    }
    referralLink: string
}

export default function DriverMarketingKit({ profile, referralLink }: DriverMarketingKitProps) {
    const [downloading, setDownloading] = useState(false)
    const [activeTab, setActiveTab] = useState<'flyer' | 'sticker' | 'profile' | 'card'>('flyer')
    const flyerRef = useRef<HTMLDivElement>(null)
    const stickerRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const profileLink = `${baseUrl}/driver/${profile.id}`
    const logoUrl = `${baseUrl}/images/logo.png`

    const handleDownload = async () => {
        let targetRef;
        if (activeTab === 'flyer') targetRef = flyerRef;
        else if (activeTab === 'sticker') targetRef = stickerRef;
        else if (activeTab === 'profile') targetRef = profileRef;
        else targetRef = cardRef;

        if (!targetRef?.current) return

        setDownloading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const canvas = await html2canvas(targetRef.current, {
                useCORS: true,
                scale: 3,
                backgroundColor: null,
                logging: false,
                allowTaint: true,
            })

            const image = canvas.toDataURL("image/png", 1.0)
            const link = document.createElement('a')
            link.download = `AvivaGo_${activeTab}_${profile.referral_code}.png`
            link.href = image
            link.click()
        } catch (error) {
            console.error('Error generating image:', error)
        } finally {
            setDownloading(false)
        }
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(referralLink)}`
    const profileQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileLink)}`

    return (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-soft">
            <div className="p-8 border-b border-gray-100">
                <div className="flex flex-col gap-8">
                    <div>
                        <h3 className="text-3xl font-black text-[#0F2137] flex items-center gap-4">
                            <Tag className="h-8 w-8 text-emerald-500" />
                            Kit de Marketing Personalizado
                        </h3>
                        <p className="text-gray-500 mt-2 text-lg">Genera herramientas impresas para promover tu red y perfil.</p>
                    </div>

                    <div className="flex flex-wrap bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100 gap-1.5 w-fit">
                        {[
                            { id: 'flyer', label: 'Flyer B2C' },
                            { id: 'sticker', label: 'Sticker Registro' },
                            { id: 'profile', label: 'Sticker Perfil' },
                            { id: 'card', label: 'Tarjeta Presentación' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-[#0F2137] text-white shadow-lg shadow-[#0F2137]/20' : 'text-gray-500 hover:text-[#0F2137] hover:bg-white'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Preview Area */}
                <div className="flex justify-center items-center bg-gray-50 rounded-[2rem] p-8 border border-gray-100 min-h-[550px] relative">
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">Vista Previa</span>
                    </div>

                    {/* Flyer Template */}
                    <div
                        ref={flyerRef}
                        style={{ width: '350px', height: '500px', minWidth: '350px', maxWidth: '350px', minHeight: '500px', maxHeight: '500px' }}
                        className={`bg-white text-black rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${activeTab === 'flyer' ? 'opacity-100 scale-100' : 'hidden opacity-0 scale-95'}`}
                    >
                        <div className="bg-[#10b981] h-[100px] flex flex-col justify-center items-center text-white text-center flex-shrink-0 w-full">
                            <div className="flex items-center justify-center gap-3 mb-1 w-full">
                                <div className="bg-white p-1 rounded-lg">
                                    <img src={logoUrl} alt="Logo" className="h-8 w-auto block" crossOrigin="anonymous" />
                                </div>
                                <span className="font-black text-[24px] tracking-tighter leading-none">AvivaGo</span>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-90 leading-tight">Seguridad, Confianza y Certeza.</p>
                        </div>

                        <div className="h-[360px] w-full px-8 pt-4 pb-8 flex flex-col items-center justify-between flex-shrink-0">
                            <div className="text-center w-full">
                                <h2 className="text-[40px] font-black text-[#065f46] leading-none uppercase tracking-tight">¡VIAJA SEGURO!</h2>
                                <p className="text-[14px] text-zinc-500 font-bold mt-2">Escanea y regístrate para tu primer viaje</p>
                            </div>

                            <div className="bg-zinc-50 p-6 rounded-[2.5rem] shadow-inner border border-zinc-100 flex items-center justify-center flex-shrink-0">
                                <img src={qrUrl} alt="QR" className="w-[160px] h-[160px] object-contain block" crossOrigin="anonymous" />
                            </div>

                            <div className="w-full space-y-4 flex-shrink-0">
                                <div className="flex items-center gap-4 w-full px-2">
                                    <div className="h-[2px] flex-1 bg-zinc-100" />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Tu Conductor</span>
                                    <div className="h-[2px] flex-1 bg-zinc-100" />
                                </div>

                                <div className="flex items-center gap-4 text-left w-full h-[85px] bg-zinc-50 p-4 rounded-3xl border border-zinc-100 flex-shrink-0">
                                    <img
                                        src={profile.display_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                                        alt="Avatar"
                                        className="w-14 h-14 rounded-full object-cover border-2 border-[#10b981] flex-shrink-0"
                                        crossOrigin="anonymous"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[18px] font-black text-[#065f46] uppercase leading-tight truncate">{profile.full_name}</p>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase">CÓDIGO:</span>
                                            <span className="text-[#10b981] font-black text-[18px] leading-none">{profile.referral_code}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[40px] bg-zinc-50 border-t border-zinc-100 flex items-center justify-center text-center flex-shrink-0 w-full">
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Seguridad por Fundación Aviva</p>
                        </div>
                    </div>

                    {/* Sticker Registration Template */}
                    <div
                        ref={stickerRef}
                        style={{ width: '360px', height: '360px', minWidth: '360px', maxWidth: '360px', minHeight: '360px', maxHeight: '360px' }}
                        className={`bg-white rounded-full shadow-2xl flex flex-col items-center justify-between px-12 pt-4 pb-10 transition-all duration-300 border-[15px] border-[#10b981] flex-shrink-0 ${activeTab === 'sticker' ? 'opacity-100 scale-100' : 'hidden opacity-0 scale-95'}`}
                    >
                        <div className="flex flex-col items-center mb-2 mt-4 flex-shrink-0">
                            <img src={logoUrl} alt="Logo" className="h-12 w-auto" crossOrigin="anonymous" />
                            <span className="text-[#065f46] font-black text-[24px] tracking-tighter leading-none text-center mt-[-6px]">AvivaGo</span>
                        </div>

                        <div className="bg-zinc-50 p-3 rounded-2xl shadow-inner border border-zinc-100 flex items-center justify-center flex-shrink-0">
                            <img src={qrUrl} alt="QR" className="w-[120px] h-[120px] object-contain block" crossOrigin="anonymous" />
                        </div>

                        <div className="text-center w-full px-4 mb-4 flex-shrink-0">
                            <div className="bg-[#10b981] text-white pt-1.5 pb-4 rounded-2xl shadow-lg shadow-emerald-900/20 w-full text-center flex flex-col items-center gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 leading-none">CÓDIGO PROMO</span>
                                <span className="font-black text-[24px] tracking-[0.1em] leading-none">
                                    {profile.referral_code}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ficha de Perfil Template (10cm x 15cm Portrait) */}
                    <div
                        ref={profileRef}
                        style={{ width: '380px', height: '570px', minWidth: '380px', maxWidth: '380px', minHeight: '570px', maxHeight: '570px' }}
                        className={`bg-white text-black rounded-lg overflow-hidden shadow-2xl flex flex-col transition-all duration-300 border border-zinc-200 flex-shrink-0 ${activeTab === 'profile' ? 'opacity-100 scale-100' : 'hidden opacity-0 scale-95'}`}
                    >
                        {/* Header: Photo and Name */}
                        <div className="h-[250px] bg-[#0f172a] p-8 flex flex-col items-center justify-center relative flex-shrink-0 w-full">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-[100px]" />

                            <img
                                src={profile.display_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                                alt="Avatar"
                                className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-2xl z-10"
                                crossOrigin="anonymous"
                            />
                            <div className="mt-3 text-center z-10 w-full">
                                <h3 className="text-[24px] font-black text-white uppercase tracking-tight leading-tight mb-2">
                                    {profile.full_name}
                                </h3>
                                <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Conductor Certificado</span>
                                </div>
                            </div>
                        </div>

                        {/* Body: QR and Instructions */}
                        <div className="h-[320px] w-full flex flex-col items-center justify-start pt-6 px-10 pb-10 bg-white flex-shrink-0">
                            <div className="text-center mb-4 w-full">
                                <p className="text-[14px] font-black text-zinc-800 uppercase tracking-tighter">Escanea para Ver Mi Perfil</p>
                                <p className="text-[10px] font-medium text-zinc-500 mt-1 px-4">Conoce mis calificaciones, trayectoria y servicios.</p>
                            </div>

                            <div className="bg-zinc-50 p-6 rounded-[2.5rem] shadow-inner border border-zinc-100 flex items-center justify-center mb-6 flex-shrink-0">
                                <img src={profileQrUrl} alt="QR Perfil" className="w-[180px] h-[180px] object-contain block" crossOrigin="anonymous" />
                            </div>

                            <div className="w-full h-[2px] bg-zinc-100 mb-6 flex-shrink-0" />

                            <div className="flex items-center justify-center gap-2 w-full flex-shrink-0">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em]">Seguridad & Confianza</span>
                            </div>
                        </div>
                    </div>

                    {/* Business Card Template (9cm x 5cm Standard) */}
                    <div
                        ref={cardRef}
                        style={{ width: '510px', height: '283px', minWidth: '510px', maxWidth: '510px', minHeight: '283px', maxHeight: '283px' }}
                        className={`bg-white text-black rounded-sm overflow-hidden shadow-2xl flex flex-col transition-all duration-300 border border-zinc-200 flex-shrink-0 ${activeTab === 'card' ? 'opacity-100 scale-100' : 'hidden opacity-0 scale-95'}`}
                    >
                        {/* Header Section - Explicit Height */}
                        <div className="h-[95px] w-full flex flex-col items-center justify-center bg-zinc-50 border-b-2 border-zinc-800 px-4 flex-shrink-0">
                            <h3 className="text-[22px] font-black text-[#333] tracking-tight uppercase leading-none text-center w-full mb-1">
                                {profile.full_name}
                            </h3>
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em]">Conductor AvivaGo</p>
                        </div>

                        {/* Body Section - Explicit Height */}
                        <div className="h-[188px] w-full flex flex-shrink-0">
                            {/* Left Column: Info (306px wide) */}
                            <div className="w-[306px] h-full p-6 flex flex-col justify-center bg-white border-r border-zinc-100 flex-shrink-0">
                                <div className="mb-4">
                                    <p className="text-[13px] font-black text-zinc-800 leading-tight mb-1">
                                        ¡Conoce más de mis servicios!
                                    </p>
                                    <p className="text-[10px] font-bold text-zinc-500 leading-snug">
                                        Escanea mi perfil certificado para ver mis calificaciones y regístrate con mi código.
                                    </p>
                                </div>

                                <div className="bg-zinc-100 px-4 py-3 rounded-lg border border-zinc-200 w-fit">
                                    <p className="text-[18px] font-black text-black tracking-[0.1em] leading-none m-0">
                                        {profile.referral_code}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: QR (204px wide) */}
                            <div className="w-[204px] h-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
                                <div className="bg-white p-2 rounded-lg shadow-xl w-[120px] h-[120px] flex items-center justify-center flex-shrink-0">
                                    <img
                                        src={profileQrUrl}
                                        alt="QR Perfil"
                                        className="w-full h-full object-contain block"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions Area */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-[#0F2137] flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            Finalización del Diseño
                        </h4>

                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 text-xs font-black">!</div>
                                <div>
                                    <p className="text-[#0F2137] font-bold text-sm">Identidad Reforzada</p>
                                    <p className="text-gray-500 text-xs mt-1">Cambiamos el subtítulo a "Conductor AvivaGo" para darte más autoridad y relación directa con la marca.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 text-xs font-black">!</div>
                                <div>
                                    <p className="text-[#0F2137] font-bold text-sm">Enfoque en Servicios</p>
                                    <p className="text-gray-500 text-xs mt-1">El nuevo texto invita a los clientes a conocer tu valor diferencial, no solo a ahorrar, generando conexiones de mayor calidad.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="h-5 w-5 text-emerald-600" />
                            <p className="text-sm font-black text-[#0F2137]">Soporte de Marketing</p>
                        </div>
                        <p className="text-xs text-emerald-800/70 leading-relaxed font-medium italic">
                            Este diseño está listo para ser entregado a cualquier imprenta profesional para su producción en serie.
                        </p>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full py-5 rounded-[2rem] bg-[#0F2137] hover:bg-[#0F2137]/90 text-white font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#0F2137]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
                    >
                        {downloading ? (
                            <>
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                Descargando...
                            </>
                        ) : (
                            <>
                                <Download className="h-6 w-6" />
                                Descargar
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">V 2.1 &bull; SECCIÓN DE SERVICIOS</p>
                </div>
            </div>
        </div>
    )
}
