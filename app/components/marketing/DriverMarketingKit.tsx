'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Download, Tag, CreditCard, Truck, Shield, Award } from 'lucide-react'
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
    const [activeTab, setActiveTab] = useState<'flyer' | 'sticker' | 'profile' | 'card'>('flyer')
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
            await new Promise(resolve => setTimeout(resolve, 1000))

            const canvas = await html2canvas(contentRef.current, {
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

                        {/* Status / Request Button Area */}
                        {!requestLoading && (
                            <div className="flex flex-col items-end gap-2">
                                {currentRequest ? (
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 max-w-sm">
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <span className="text-sm font-bold text-gray-700">Estado de Solicitud de Impresión</span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${getStatusLabel(currentRequest.status).color}`}>
                                                {getStatusLabel(currentRequest.status).label}
                                            </span>
                                        </div>
                                        {currentRequest.shipping_cost > 0 && (
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-500">Costo de Envío:</span>
                                                <span className="font-bold text-[#0F2137]">${currentRequest.shipping_cost} {currentRequest.currency}</span>
                                            </div>
                                        )}
                                        {currentRequest.admin_notes && (
                                            <div className="bg-blue-50 p-2 rounded-lg text-xs text-blue-800 mt-2 border border-blue-100">
                                                <strong>Mensaje de AvivaGo:</strong> {currentRequest.admin_notes}
                                            </div>
                                        )}
                                        {currentRequest.status === 'quote_sent' && (
                                            <button className="w-full mt-3 py-1.5 bg-[#0F2137] text-white text-xs font-bold rounded-lg hover:bg-black transition-colors">
                                                Pagar Envío
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-end gap-1">
                                        {isPlataOrHigher ? (
                                            <button
                                                onClick={() => setRequestModalOpen(true)}
                                                className="px-6 py-3 bg-white border-2 border-[#0F2137] text-[#0F2137] hover:bg-[#0F2137] hover:text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                                            >
                                                <Truck className="h-5 w-5" />
                                                Solicitar Kit Impreso
                                            </button>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <button
                                                    disabled
                                                    className="px-6 py-3 bg-gray-100 border-2 border-gray-200 text-gray-400 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed"
                                                >
                                                    <Truck className="h-5 w-5" />
                                                    Solicitar Kit Impreso
                                                </button>
                                                <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                                    <Award className="h-3 w-3" />
                                                    Requiere Nivel Plata
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
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

            <div className={`${embedded ? "py-8" : "p-8"} grid grid-cols-1 xl:grid-cols-2 gap-12 items-center`}>
                {/* Preview Area */}
                <div className="flex justify-center items-center bg-gray-50 rounded-[2rem] p-8 border border-gray-100 min-h-[550px] relative">
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">Vista Previa</span>
                    </div>

                    <MarketingTemplates
                        ref={contentRef}
                        profile={profile}
                        qrUrl={qrUrl}
                        profileQrUrl={profileQrUrl}
                        logoUrl={logoUrl}
                        activeTab={activeTab}
                    />
                </div>

                {/* Instructions Area */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-[#0F2137] flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            Cómo usar tu Kit de Marketing
                        </h4>

                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 text-xs font-black">1</div>
                                <div>
                                    <p className="text-[#0F2137] font-bold text-sm">Imprime y Coloca</p>
                                    <p className="text-gray-500 text-xs mt-1">Coloca el sticker en tu vehículo y entrega tarjetas a tus pasajeros. Un material profesional genera confianza inmediata y facilita el registro.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 text-xs font-black">2</div>
                                <div>
                                    <p className="text-[#0F2137] font-bold text-sm">Comparte Digitalmente</p>
                                    <p className="text-gray-500 text-xs mt-1">Descarga las imágenes y compártelas en tus estados de WhatsApp o grupos de vecinos. ¡Tu código QR funciona igual en pantalla!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="h-5 w-5 text-emerald-600" />
                            <p className="text-sm font-black text-[#0F2137]">Tip Profesional</p>
                        </div>
                        <p className="text-xs text-emerald-800/70 leading-relaxed font-medium italic">
                            Los conductores que utilizan su Kit de Marketing aumentan sus referidos en un 40%. La confianza visual es clave para convertir pasajeros ocasionales en clientes recurrentes.
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
                                Descargar Imagen
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">HERRAMIENTAS OFICIALES AVIVAGO</p>
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
