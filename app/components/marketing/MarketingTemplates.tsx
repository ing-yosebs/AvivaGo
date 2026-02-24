import React, { forwardRef } from 'react'

interface TemplateProps {
    profile: {
        full_name: string
        display_avatar: string | null
        referral_code: string
    }
    qrUrl: string
    profileQrUrl: string
    logoUrl: string
    activeTab: string
}

export const MarketingTemplates = forwardRef<HTMLDivElement, TemplateProps>(({ profile, qrUrl, profileQrUrl, logoUrl, activeTab }, ref) => {
    return (
        <>
            {/* Sticker Tablero Template */}
            {activeTab === 'flyer' && (
                <div
                    ref={ref}
                    style={{ width: '350px', height: '500px', minWidth: '350px', maxWidth: '350px', minHeight: '500px', maxHeight: '500px' }}
                    className={`bg-white text-black rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300`}
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
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">www.avivago.mx</p>
                    </div>
                </div>
            )}

            {/* Sticker Ventana Template (Solo Logo) */}
            {activeTab === 'sticker' && (
                <div
                    ref={ref}
                    data-template="sticker"
                    data-capture-container="true"
                    style={{ width: '400px', height: '400px', minWidth: '400px', maxWidth: '400px', minHeight: '400px', maxHeight: '400px' }}
                    className={`bg-white rounded-full shadow-2xl flex flex-col items-center justify-center transition-all duration-300 border-[8px] border-emerald-500 flex-shrink-0 relative overflow-hidden antialiased`}
                >
                    {/* El Logo como único protagonista */}
                    <div className="flex items-center justify-center w-full h-full p-4">
                        <img
                            src={logoUrl}
                            alt="Logo AvivaGo"
                            className="w-full h-full object-contain"
                            crossOrigin="anonymous"
                        />
                    </div>
                </div>
            )}

            {/* Cabecera Asiento Template (10cm x 15cm Portrait) */}
            {activeTab === 'profile' && (
                <div
                    ref={ref}
                    style={{ width: '380px', height: '650px', minWidth: '380px', maxWidth: '380px', minHeight: '650px', maxHeight: '650px' }}
                    className={`bg-white text-black rounded-lg overflow-hidden shadow-2xl flex flex-col transition-all duration-300 border border-zinc-200 flex-shrink-0`}
                >
                    {/* Header: Photo and Name */}
                    <div className="h-[300px] bg-[#0f172a] p-10 flex flex-col items-center justify-center relative flex-shrink-0 w-full overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-tr-full -ml-8 -mb-8" />

                        {/* Top Section: Logo (Left) and Photo (Right) - Mismo Tamaño */}
                        <div className="flex items-center justify-center gap-12 z-10 w-full mb-6">
                            {/* Logo Column */}
                            <div className="flex flex-col items-center">
                                <div className="bg-white w-24 h-24 rounded-3xl shadow-2xl border-2 border-emerald-50 flex items-center justify-center p-2">
                                    <img src={logoUrl} alt="Logo" className="h-18 w-auto block object-contain" crossOrigin="anonymous" />
                                </div>
                            </div>

                            {/* Separator Line */}
                            <div className="w-[1px] h-24 bg-white/10" />

                            {/* Photo Column */}
                            <img
                                src={profile.display_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                                alt="Avatar"
                                className="w-32 h-32 min-w-[128px] min-h-[128px] rounded-full object-cover border-4 border-emerald-500 shadow-2xl flex-shrink-0"
                                crossOrigin="anonymous"
                            />
                        </div>

                        {/* Bottom Section: Name and Status */}
                        <div className="text-center z-10 w-full mt-2">
                            <h3 className="text-[26px] font-black text-white uppercase tracking-tight leading-none mb-3 drop-shadow-md">
                                {profile.full_name}
                            </h3>
                            <div className="inline-block px-4 py-2 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conductor al volante</span>
                            </div>
                        </div>
                    </div>

                    {/* Body: QR and Instructions */}
                    <div className="h-[350px] w-full flex flex-col items-center justify-center pt-8 px-10 pb-12 bg-white flex-shrink-0">
                        <div className="text-center mb-4 w-full">
                            <p className="text-[14px] font-black text-zinc-800 uppercase tracking-tighter">Escanea para Ver Mi Perfil</p>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 px-4">Conoce mis calificaciones, trayectoria y servicios.</p>
                        </div>

                        <div className="bg-zinc-50 p-6 rounded-[2.5rem] shadow-inner border border-zinc-100 flex items-center justify-center mb-2 flex-shrink-0">
                            <img src={profileQrUrl} alt="QR Perfil" className="w-[180px] h-[180px] object-contain block" crossOrigin="anonymous" />
                        </div>

                        <div className="flex items-center justify-center w-full">
                            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em]">www.avivago.mx</span>
                        </div>

                    </div>
                </div>
            )}

            {/* Business Card Template (9cm x 5cm Standard) */}
            {activeTab === 'card' && (
                <div
                    ref={ref}
                    style={{ width: '510px', height: '283px', minWidth: '510px', maxWidth: '510px', minHeight: '283px', maxHeight: '283px' }}
                    className={`bg-white text-black rounded-sm overflow-hidden shadow-2xl flex flex-col transition-all duration-300 border border-zinc-200 flex-shrink-0`}
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
            )}

            {/* Seatback Template (Media Carta Horizontal - 8.5" x 5.5" -> ~816px x 528px) */}
            {activeTab === 'seatback' && (
                <div
                    ref={ref}
                    data-template="seatback"
                    data-capture-container="true"
                    style={{ width: '816px', height: '528px', minWidth: '816px', maxWidth: '816px', minHeight: '528px', maxHeight: '528px' }}
                    className={`bg-[#0f172a] text-white rounded-[2rem] overflow-hidden shadow-2xl flex transition-all duration-300 border border-zinc-800 flex-shrink-0 relative antialiased`}
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-tr-full" />

                    {/* Contenido Principal - Layout 2 Columnas */}

                    {/* Columna Izquierda: Perfil y CTA (60% del ancho) */}
                    <div className="w-[490px] h-full p-8 flex flex-col justify-between relative z-10 border-r border-zinc-800 flex-shrink-0 antialiased">
                        {/* Encabezado: Logo AvivaGo */}
                        <div className="flex items-center">
                            <div className="bg-white p-1.5 rounded-lg mr-3">
                                <img src={logoUrl} alt="Logo" className="h-6 w-auto block" crossOrigin="anonymous" />
                            </div>
                            <div className="flex flex-col justify-center overflow-visible">
                                <span className="font-black text-[24px] tracking-tighter text-white leading-none mb-1">AvivaGo</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-400 leading-none block">Catalogo de Conductores</span>
                            </div>
                        </div>

                        {/* Perfil del Conductor - Reordenado y más grande */}
                        <div className="flex flex-col items-center my-2">
                            <img
                                src={profile.display_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'}
                                alt="Avatar"
                                className="w-48 h-48 rounded-full object-cover border-4 border-[#10b981] shadow-2xl flex-shrink-0 mb-4"
                                crossOrigin="anonymous"
                            />
                            <div className="text-center w-full">
                                <p className="text-[16px] font-black text-[#10b981] uppercase tracking-[0.2em] mb-1">Tu Conductor al Volante</p>
                                <h2 className="text-[36px] font-black text-white uppercase leading-tight tracking-tight break-words max-w-[420px] mx-auto">
                                    {profile.full_name}
                                </h2>
                            </div>
                        </div>

                        {/* Call to Action Fuerte */}
                        <div className="mt-auto">
                            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
                                <h3 className="text-[24px] font-black text-emerald-400 leading-tight">
                                    ¿Te gustó tu viaje?
                                </h3>
                                <p className="text-[16px] text-zinc-300 font-medium mt-1 leading-snug">
                                    ¡Conóceme más y reserva tu próximo viaje seguro y confiable directamente conmigo!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Código QR e Instrucciones (40% del ancho) */}
                    <div className="w-[326px] h-full bg-white flex flex-col items-center justify-center p-8 relative z-10 antialiased">

                        <div className="text-center mb-6 w-full flex flex-col items-center">
                            <div className="bg-emerald-100 h-7 px-4 rounded-full flex items-center justify-center mb-3">
                                <span className="text-[12px] font-black uppercase tracking-[0.1em] text-emerald-800 leading-none">Revisa mi perfil digital</span>
                            </div>
                            <h4 className="text-[20px] font-black text-zinc-900 uppercase leading-none mb-1">
                                Escanea el código
                            </h4>
                            <p className="text-[12px] font-bold text-zinc-500 leading-none">Con la cámara de tu celular</p>
                        </div>

                        <div className="bg-zinc-50 p-4 rounded-[1.5rem] shadow-lg border-2 border-zinc-100 flex items-center justify-center mb-6">
                            <img src={profileQrUrl} alt="QR Perfil" className="w-[180px] h-[180px] object-contain block" crossOrigin="anonymous" />
                        </div>

                        <div className="text-center w-full">
                            <p className="text-[12px] text-zinc-600 font-medium leading-relaxed px-2 mb-3">
                                Revisa mis calificaciones, servicios y agenda tu siguiente viaje.
                            </p>
                            <div className="flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] leading-none">www.avivago.mx</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </>
    )
})

MarketingTemplates.displayName = 'MarketingTemplates'
