'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Download, Tag, CreditCard, Truck, Shield, Award, Lock } from 'lucide-react'
import html2canvas from 'html2canvas'
import { createMarketingRequest, getMarketingRequest, type MarketingRequest } from '@/app/actions/user-requests'
import { useRouter } from 'next/navigation'
import MarketingRequestModal from './MarketingRequestModal'
import { MarketingTemplates } from './MarketingTemplates'

interface DriverMarketingKitProps {
    profile: {
        id: string
        full_name: string
        display_avatar: string | null
        referral_code: string
    }
    referralLink: string
    embedded?: boolean
    hasMembership?: boolean
    isPlataOrHigher?: boolean
}

export default function DriverMarketingKit({ profile, referralLink, embedded = false, hasMembership = false, isPlataOrHigher = false }: DriverMarketingKitProps) {
    const [downloading, setDownloading] = useState(false)
    const [activeTab, setActiveTab] = useState<'flyer' | 'sticker' | 'profile' | 'card' | 'seatback'>('profile')
    const contentRef = useRef<HTMLDivElement>(null)

    // Request State
    const [requestModalOpen, setRequestModalOpen] = useState(false)
    const [currentRequest, setCurrentRequest] = useState<MarketingRequest | null>(null)
    const [requestLoading, setRequestLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [address, setAddress] = useState('')
    const [driverNotes, setDriverNotes] = useState('')
    const [termsAccepted, setTermsAccepted] = useState({
        correctInfo: false,
        shippingCosts: false,
        noRefunds: false,
        deliveryDates: false
    })

    const router = useRouter()
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const profileLink = `${baseUrl}/driver/${profile.id}`
    const logoUrl = `${baseUrl}/images/logo.png`

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(referralLink)}`
    const profileQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileLink)}`

    useEffect(() => {
        loadRequestStatus()
    }, [profile.id])

    const loadRequestStatus = async () => {
        setRequestLoading(true)
        try {
            const req = await getMarketingRequest(profile.id)
            setCurrentRequest(req)
        } catch (error) {
            console.error('Error loading request:', error)
        } finally {
            setRequestLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!contentRef.current) return

        setDownloading(true)
        try {
            // Create a temporary hidden container for clean rendering
            const container = document.createElement('div')
            container.style.position = 'fixed'
            container.style.left = '-9999px'
            container.style.top = '0'
            container.style.zIndex = '-1'
            container.style.background = 'white'
            document.body.appendChild(container)

            // Clone the element to render it at its original size without CSS scale/transforms
            const clone = contentRef.current.cloneNode(true) as HTMLElement

            // Remove any potential transforms/scaling from the clone
            clone.style.transform = 'none'
            clone.style.scale = 'none'
            clone.style.transition = 'none'

            container.appendChild(clone)

            // Wait for images to be ready in the clone
            await new Promise(resolve => setTimeout(resolve, 1500))

            const canvas = await html2canvas(clone, {
                useCORS: true,
                scale: 3, // High quality
                backgroundColor: null,
                logging: false,
                allowTaint: true,
                width: 816,
                height: 528,
                onclone: (clonedDoc) => {
                    // Ensure the cloned target has no transforms and is fully visible
                    const target = clonedDoc.querySelector('[data-capture-container="true"]') as HTMLElement;
                    if (target) {
                        target.style.transform = 'none';
                        target.style.scale = 'none';
                        target.style.position = 'relative';
                        target.style.left = '0';
                        target.style.top = '0';
                    }
                }
            })

            const image = canvas.toDataURL("image/png", 1.0)
            const link = document.createElement('a')
            link.download = `AvivaGo_${activeTab}_${profile.referral_code}.png`
            link.href = image
            link.click()

            // Cleanup
            document.body.removeChild(container)
        } catch (error) {
            console.error('Error generating image:', error)
        } finally {
            setDownloading(false)
        }
    }

    const handleSubmitRequest = async () => {
        if (!termsAccepted.correctInfo || !termsAccepted.shippingCosts || !termsAccepted.noRefunds || !termsAccepted.deliveryDates) {
            alert('Debes aceptar todos los términos y condiciones para continuar.')
            return
        }
        if (!address.trim()) {
            alert('Por favor verifica tu dirección de envío.')
            return
        }

        setSubmitting(true)
        try {
            const res = await createMarketingRequest(profile.id, address, driverNotes)
            if (res.success) {
                setRequestModalOpen(false)
                loadRequestStatus()
                alert('Solicitud enviada con éxito. Te notificaremos el costo de envío pronto.')
            } else {
                alert(res.error || 'Error al enviar solicitud')
            }
        } catch (error) {
            console.error(error)
            alert('Ocurrió un error inesperado')
        } finally {
            setSubmitting(false)
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending_quote': return { label: 'Esperando Cotización', color: 'bg-yellow-100 text-yellow-800' }
            case 'quote_sent': return { label: 'Cotización Enviada', color: 'bg-blue-100 text-blue-800' }
            case 'paid': return { label: 'Pagado', color: 'bg-emerald-100 text-emerald-800' }
            case 'processing': return { label: 'En Proceso', color: 'bg-purple-100 text-purple-800' }
            case 'shipped': return { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' }
            case 'delivered': return { label: 'Entregado', color: 'bg-gray-100 text-gray-800' }
            case 'cancelled': return { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
            default: return { label: 'Desconocido', color: 'bg-gray-100 text-gray-800' }
        }
    }

    return (
        <div className={embedded ? "w-full" : "bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-soft"}>
            <div className={`${embedded ? "py-6" : "p-8"} border-b border-gray-100`}>
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-3xl font-black text-[#0F2137] flex items-center gap-4">
                                <Tag className="h-8 w-8 text-emerald-500" />
                                Kit de Marketing Personalizado
                            </h3>
                            <p className="text-gray-500 mt-2 text-lg">Genera herramientas impresas para promover tu red y perfil.</p>
                        </div>

                    </div>

                    <div className="flex flex-wrap bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100 gap-1.5 w-fit">
                        {[
                            { id: 'profile', label: 'Cabecera Asiento', exclusive: false },
                            { id: 'sticker', label: 'Sticker Ventana', exclusive: false },
                            { id: 'card', label: 'Tarjeta Presentación', exclusive: true },
                            { id: 'flyer', label: 'Sticker Tablero', exclusive: true },
                            { id: 'seatback', label: 'Respaldo Asiento', exclusive: true }
                        ].map((tab) => {
                            const isLocked = tab.exclusive && !hasMembership;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#0F2137] text-white shadow-lg shadow-[#0F2137]/20' : 'text-gray-500 hover:text-[#0F2137] hover:bg-white'}`}
                                >
                                    {isLocked && <Lock className="h-3 w-3 text-amber-500" />}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={`${embedded ? "py-8" : "p-8"} flex flex-col gap-12`}>
                {/* Preview Area - Now full width first row */}
                <div className="flex justify-center items-center bg-gray-50 rounded-[2.5rem] px-4 py-4 lg:px-12 lg:py-6 border border-gray-100 min-h-[300px] lg:min-h-[500px] relative overflow-hidden">
                    <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">Vista Previa</span>
                    </div>

                    <div className="w-full flex items-center justify-center overflow-auto py-4 custom-scrollbar">
                        <div className={`relative flex-shrink-0 origin-center transition-all duration-300 ${activeTab === 'seatback' ? 'scale-[0.5] lg:scale-[0.65]' : 'scale-[0.9] lg:scale-100'}`}>
                            {/* Restricted Overlay */}
                            {((activeTab === 'card' || activeTab === 'flyer' || activeTab === 'seatback') && !hasMembership) ? (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-300">
                                    <div className="bg-[#0F2137] p-6 rounded-full shadow-2xl mb-6 ring-8 ring-white/20">
                                        <Lock className="h-10 w-10 text-emerald-400" />
                                    </div>
                                    <p className="text-[#0F2137] font-black text-2xl mb-2 text-center">Diseño Premium</p>
                                    <p className="text-slate-600 font-bold text-base max-w-[280px] text-center leading-relaxed">
                                        Este material es exclusivo para socios con membresía activa.
                                    </p>
                                    <button
                                        onClick={() => router.push('/membership')}
                                        className="mt-8 px-8 py-3 bg-emerald-500 text-[#0F2137] font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-lg active:scale-95"
                                    >
                                        Obtener Membresía
                                    </button>
                                </div>
                            ) : null}

                            <div className={((activeTab === 'card' || activeTab === 'flyer' || activeTab === 'seatback') && !hasMembership) ? "blur-md opacity-40 select-none pointer-events-none" : ""}>
                                <MarketingTemplates
                                    ref={contentRef}
                                    profile={profile}
                                    qrUrl={qrUrl}
                                    profileQrUrl={profileQrUrl}
                                    logoUrl={logoUrl}
                                    activeTab={activeTab}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info & Action Area - Now second row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
                    {/* Tarjeta de Instrucciones */}
                    <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="space-y-6">
                            <h4 className="text-2xl font-black text-[#0F2137] flex items-center gap-3">
                                <CreditCard className="h-6 w-6 text-emerald-500" />
                                Cómo usar tu Kit
                            </h4>

                            <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 text-xs font-black">1</div>
                                    <p className="text-[#0F2137] font-bold text-sm">Descarga y guarda el archivo en tu celular.</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 text-xs font-black">2</div>
                                    <p className="text-[#0F2137] font-bold text-sm">Imprímelo en papel adhesivo o cartulina de alta calidad.</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 text-xs font-black">3</div>
                                    <p className="text-[#0F2137] font-bold text-sm">Colócalo en un lugar visible para tus pasajeros.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-slate-50 rounded-3xl relative overflow-hidden border border-slate-100">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full" />
                            <div className="relative z-10 flex items-start gap-4">
                                <Shield className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-[#0F2137] mb-1">Tip Profesional</p>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        El uso de material visual oficial aumenta la confianza del pasajero y facilita que escaneen tu código para unirse a tu red.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de Acción de Descarga */}
                    <div className="lg:col-span-2 bg-[#0F2137] rounded-[2.5rem] p-8 lg:p-10 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-xl shadow-[#0F2137]/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 rounded-full -ml-32 -mb-32" />

                        <div className="relative z-10 w-full">
                            <h5 className="text-xl font-black text-white mb-2">¿Todo listo?</h5>
                            <p className="text-sm text-slate-400 mb-8 max-w-[240px] mx-auto">Obtén tu diseño en alta resolución listo para imprimir.</p>

                            {activeTab !== 'profile' && activeTab !== 'sticker' && !hasMembership ? (
                                <div className="space-y-4">
                                    <div className="w-full py-6 rounded-[2rem] bg-white/5 border-2 border-dashed border-white/10 text-white/40 flex flex-col items-center gap-2">
                                        <Lock className="h-8 w-8" />
                                        <span className="font-bold">Contenido Premium</span>
                                    </div>
                                    <button
                                        onClick={() => router.push('/membership')}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0F2137] font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 uppercase text-xs tracking-widest"
                                    >
                                        Activar Membresía
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="w-full py-4 rounded-3xl bg-emerald-500 hover:bg-emerald-400 text-[#0F2137] font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {downloading ? (
                                        <>
                                            <div className="w-5 h-5 border-4 border-[#0F2137]/30 border-t-[#0F2137] rounded-full animate-spin" />
                                            <span className="text-base">Procesando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-6 w-6" />
                                            <span className="text-base">Descargar Diseño</span>
                                        </>
                                    )}
                                </button>
                            )}

                            <div className="w-full h-px bg-white/10 my-6" />

                            {/* Status / Request Button Area - Now below download */}
                            {!requestLoading && (
                                <div className="mt-6 w-full">
                                    {currentRequest ? (
                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-left">
                                            <div className="flex items-center justify-between gap-4 mb-3">
                                                <span className="text-xs font-bold text-slate-300">Solicitud de Impresión</span>
                                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${getStatusLabel(currentRequest.status).color}`}>
                                                    {getStatusLabel(currentRequest.status).label}
                                                </span>
                                            </div>
                                            {currentRequest.shipping_cost > 0 && (
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-slate-400">Costo de Envío:</span>
                                                    <span className="font-bold text-white">${currentRequest.shipping_cost} {currentRequest.currency}</span>
                                                </div>
                                            )}
                                            {currentRequest.admin_notes && (
                                                <div className="bg-emerald-500/10 p-3 rounded-2xl text-[11px] text-emerald-400 mt-3 border border-emerald-500/20 leading-relaxed">
                                                    <strong>AvivaGo:</strong> {currentRequest.admin_notes}
                                                </div>
                                            )}
                                            {currentRequest.status === 'quote_sent' && (
                                                <button className="w-full mt-4 py-3 bg-emerald-500 text-[#0F2137] text-xs font-black rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-wider">
                                                    Pagar Envío
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            {isPlataOrHigher ? (
                                                <button
                                                    onClick={() => setRequestModalOpen(true)}
                                                    className="w-full py-4 bg-white/10 border border-white/10 text-white hover:bg-white/20 rounded-3xl font-bold transition-all flex items-center justify-center gap-3 text-sm"
                                                >
                                                    <Truck className="h-5 w-5 text-emerald-400" />
                                                    Solicitar Kit Impreso
                                                </button>
                                            ) : (
                                                <div className="w-full group">
                                                    <button
                                                        disabled
                                                        className="w-full py-4 bg-white/5 border border-white/5 text-white/20 rounded-3xl font-bold flex items-center justify-center gap-3 text-sm cursor-not-allowed"
                                                    >
                                                        <Truck className="h-5 w-5" />
                                                        Solicitar Kit Impreso
                                                    </button>
                                                    <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                                                        <Award className="h-3 w-3" />
                                                        Requiere membresía Nivel Plata
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            {requestModalOpen && (
                <MarketingRequestModal
                    address={address}
                    setAddress={setAddress}
                    driverNotes={driverNotes}
                    setDriverNotes={setDriverNotes}
                    termsAccepted={termsAccepted}
                    setTermsAccepted={setTermsAccepted}
                    onSubmit={handleSubmitRequest}
                    onClose={() => setRequestModalOpen(false)}
                    submitting={submitting}
                />
            )}
        </div>
    )
}
