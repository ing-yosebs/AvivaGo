'use client'

import { useState, useEffect } from 'react'
import { FileText, User, Car, MapPin, Languages, CheckCircle2, Clock, BadgeCheck, ChevronRight, CreditCard, Globe, Save, Lock } from 'lucide-react'
import Link from 'next/link'
import PremiumUpsellModal from '@/app/components/PremiumUpsellModal'
import { createClient } from '@/lib/supabase/client'
import { DriverProfileCard } from '@/app/(panel)/dashboard/components/DriverProfileCard'
import { ProfileVisibilityCard } from '@/app/(panel)/dashboard/components/ProfileVisibilityCard'

export default function ServicesSection({ services, onSave, saving, hasMembership, driverProfileId, initialIsVisible }: any) {
    const zones = ['Zona Oriente', 'Zona Poniente', 'Zona Norte', 'Zona Sur', 'Zona Centro']
    const languagesList = ['Español', 'Inglés', 'Alemán', 'Francés', 'Japonés', 'Chino']
    const indigenousLanguagesList = ['Náhuatl', 'Maya', 'Tseltal', 'Tsotsil', 'Mixteco', 'Zapoteco', 'Otomí']

    // Visibility State
    const [isVisible, setIsVisible] = useState(hasMembership ? initialIsVisible : false)
    const [updatingVisibility, setUpdatingVisibility] = useState(false)
    const supabase = createClient()

    const [formData, setFormData] = useState({
        preferred_zones: services?.preferred_zones || [],
        languages: services?.languages || ['Español'],
        indigenous_languages: services?.indigenous_languages || [],
        work_schedule: services?.work_schedule || {},
        professional_questionnaire: services?.professional_questionnaire || { bio: '' },
        personal_bio: services?.personal_bio || '',
        transport_platforms: services?.transport_platforms || [],
        knows_sign_language: services?.knows_sign_language || false,
        social_commitment: services?.social_commitment || false,
        payment_methods: services?.payment_methods || [],
        payment_link: services?.payment_link || '',
        records_video: services?.records_video || false,
        video_notice_accepted_at: services?.video_notice_accepted_at || null
    })

    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
    const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false)
    const [videoCommitment, setVideoCommitment] = useState(services?.records_video || false)
    const [modalConfig, setModalConfig] = useState({ feature: '', message: '' })

    const triggerPremiumModal = (feature: string, message: string) => {
        setModalConfig({ feature, message })
        setIsPremiumModalOpen(true)
    }

    const handleToggleVisibility = async (visible: boolean) => {
        if (!hasMembership && visible) {
            triggerPremiumModal("Aparecer en Catálogo Nacional", "Únete a Premium para ser descubierto por pasajeros en tu ciudad que pronto usarán AvivaGo. ¡Tu perfil y enlace personal gratuito funcionarán siempre!")
            return;
        }
        setUpdatingVisibility(true)
        try {
            const { error } = await supabase
                .from('driver_profiles')
                .update({ is_visible: visible })
                .eq('id', driverProfileId)

            if (error) throw error
            setIsVisible(visible)
        } catch (error) {
            console.error('Error al actualizar la visibilidad', error)
        } finally {
            setUpdatingVisibility(false)
        }
    }

    useEffect(() => {
        setIsVisible(hasMembership ? initialIsVisible : false)
    }, [hasMembership, initialIsVisible])

    useEffect(() => {
        if (services) {
            setFormData({
                preferred_zones: services.preferred_zones || [],
                languages: services.languages || ['Español'],
                indigenous_languages: services.indigenous_languages || [],
                work_schedule: services.work_schedule || {},
                professional_questionnaire: services.professional_questionnaire || { bio: '' },
                personal_bio: services.personal_bio || '',
                transport_platforms: services.transport_platforms || [],
                knows_sign_language: services.knows_sign_language || false,
                social_commitment: services.social_commitment || false,
                payment_methods: services.payment_methods || [],
                payment_link: services.payment_link || '',
                records_video: services.records_video || false,
                video_notice_accepted_at: services.video_notice_accepted_at || null
            })
        }
    }, [services])

    const handleTimeChange = (day: string, type: 'start' | 'end', value: string) => {
        setFormData({
            ...formData,
            work_schedule: {
                ...formData.work_schedule,
                [day]: {
                    ...((formData.work_schedule as any)[day] || { start: '00:00', end: '00:00' }),
                    [type]: value
                }
            }
        })
    }

    const toggleItem = (listName: string, item: string) => {
        const list = [...(formData as any)[listName]]
        const idx = list.indexOf(item)
        if (idx > -1) list.splice(idx, 1)
        else list.push(item)
        setFormData({ ...formData, [listName]: list })
    }

    const platformOptions = ['Uber', 'Didi', 'inDrive', 'Cabify', 'Bolt', 'Taxi tradicional']

    return (
        <div className="space-y-12 max-w-5xl">
            {/* Visibility & Profile Link Section */}
            <div className="space-y-8 w-full">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        Tu Enlace Público
                    </h4>
                    <DriverProfileCard driverProfileId={driverProfileId} />
                </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* Reseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Professional Bio */}
                <div className="space-y-6 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Reseña Profesional
                    </h4>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-400">Describe tu servicio con tus propias palabras.</p>
                        <textarea
                            value={formData.professional_questionnaire?.bio || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                professional_questionnaire: {
                                    ...formData.professional_questionnaire,
                                    bio: e.target.value
                                }
                            })}
                            placeholder="Ej. Soy un conductor con 10 años de experiencia..."
                            className="w-full bg-white border border-gray-200 rounded-2xl p-6 min-h-[120px] text-[#0F2137] focus:border-blue-500 transition-colors resize-none focus:outline-none"
                        />
                    </div>
                </div>

                {/* Personal Bio */}
                <div className="space-y-6 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <User className="h-4 w-4" /> Reseña Personal
                    </h4>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-400">Cuéntanos sobre tus gustos, pasatiempos y cosas de interés.</p>
                        <textarea
                            value={formData.personal_bio}
                            onChange={(e) => setFormData({ ...formData, personal_bio: e.target.value })}
                            placeholder="Ej. Me gusta el senderismo, la música clásica y conocer nuevos lugares..."
                            className="w-full bg-white border border-gray-200 rounded-2xl p-6 min-h-[120px] text-[#0F2137] focus:border-blue-500 transition-colors resize-none focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Sign Language & Social Commitment MOVED HERE */}
            <div className="space-y-6 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft">
                <div className="flex flex-col gap-6">
                    {/* Social Commitment */}
                    <div className="flex flex-col gap-4">
                        <p className="text-sm font-bold text-[#0F2137]">Compromiso de Trato Igualitario</p>
                        <button
                            onClick={() => setFormData({ ...formData, social_commitment: !formData.social_commitment })}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all text-left w-full ${formData.social_commitment
                                ? 'bg-violet-50 border-violet-200 text-violet-700 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${formData.social_commitment ? 'bg-violet-600 border-transparent' : 'border-gray-300'}`}>
                                {formData.social_commitment && <CheckCircle2 className="h-4 w-4 text-white" />}
                            </div>
                            <span className={`font-bold text-sm leading-relaxed ${formData.social_commitment ? 'text-violet-900' : ''}`}>
                                Me comprometo a brindar un trato cordial, respetuoso y equitativo a hombres, mujeres y a la comunidad LGBTQ+, sin distinción por ideologías o creencias religiosas de mis pasajeros.
                            </span>
                        </button>
                        <p className="text-xs text-gray-500 leading-relaxed px-2">
                            Puedes marcar o no esta opción; sin embargo, al hacerlo te comprometes con la comunidad. Cualquier incumplimiento de esta verificación podrá ser considerado una falta a las normas y políticas de la comunidad.
                        </p>
                    </div>

                    <div className="w-full h-px bg-gray-100" />

                    {/* Sign Language */}
                    <div className="flex flex-col gap-4">
                        <p className="text-sm font-bold text-[#0F2137]">¿Conoces el lenguaje de señas para comunicarte con personas con discapacidad auditiva?</p>
                        <button
                            onClick={() => setFormData({ ...formData, knows_sign_language: !formData.knows_sign_language })}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all text-left w-full sm:w-fit ${formData.knows_sign_language
                                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.knows_sign_language ? 'bg-blue-600 border-transparent' : 'border-gray-300'}`}>
                                {formData.knows_sign_language && <CheckCircle2 className="h-4 w-4 text-white" />}
                            </div>
                            <span className={`font-bold text-sm ${formData.knows_sign_language ? 'text-blue-900' : ''}`}>Sí, domino el lenguaje de señas (LSM)</span>
                        </button>
                    </div>

                    <div className="w-full h-px bg-gray-100" />

                    {/* Video Recording */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-2">
                            <div>
                                <p className="text-sm font-bold text-[#0F2137]">¿Cuentas con grabación de video en tu vehículo?</p>
                                <p className="text-xs text-gray-400 mt-1">Dashcam (Seguridad y contenido anonimizado)</p>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, records_video: !formData.records_video })}
                                className={`relative inline-flex h-7 w-16 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner ${formData.records_video ? 'bg-amber-500' : 'bg-gray-200'
                                    }`}
                            >
                                <span className="sr-only">Habilitar grabación</span>
                                <span className={`absolute text-[10px] font-bold uppercase transition-all duration-300 ${formData.records_video ? 'left-2 text-white opacity-100' : 'left-8 text-gray-400 opacity-0'}`}>
                                    Sí
                                </span>
                                <span className={`absolute text-[10px] font-bold uppercase transition-all duration-300 ${formData.records_video ? 'right-8 text-white opacity-0' : 'right-2 text-gray-400 opacity-100'}`}>
                                    No
                                </span>
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${formData.records_video ? 'translate-x-10' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {formData.records_video && (
                            <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500 space-y-4">
                                <div className="flex gap-3">
                                    <div className="mt-0.5">
                                        <div className="bg-amber-500 p-1 rounded-full text-white">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-amber-900 leading-relaxed font-medium italic">
                                        "Declaro que utilizo la grabación primordialmente por seguridad. En caso de utilizar fragmentos para redes sociales, me comprometo a la anonimización total (borrar rostros y voces) de los pasajeros. Acepto ser el único responsable legal del uso de estos videos y eximo totalmente a AvivaGo de cualquier reclamo por privacidad o daño moral."
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-amber-200/50">
                                    <button
                                        onClick={() => setVideoCommitment(!videoCommitment)}
                                        className="flex items-center gap-2 group transition-all"
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${videoCommitment ? 'bg-amber-600 border-amber-600' : 'bg-white border-amber-300'}`}>
                                            {videoCommitment && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </div>
                                        <span className={`text-xs font-bold ${videoCommitment ? 'text-amber-900' : 'text-amber-700'} group-hover:text-amber-800`}>
                                            Sí, acepto el compromiso y las normas de privacidad.
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Platforms */}
            <div className="space-y-6 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Car className="h-4 w-4" /> Plataformas de Transporte
                </h4>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Señala las plataformas donde ofreces tus servicios:</p>
                    <div className="flex flex-wrap gap-3">
                        {platformOptions.map(platform => (
                            <button
                                key={platform}
                                onClick={() => toggleItem('transport_platforms', platform)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${formData.transport_platforms.includes(platform)
                                    ? 'bg-gray-700 text-white shadow-lg shadow-gray-700/20'
                                    : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">


                {/* Zones & Languages */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Zonas de Trabajo Preferente
                            </h4>
                            {!hasMembership && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Premium</span>}
                        </div>

                        <div
                            className={`relative ${!hasMembership ? 'opacity-50 cursor-pointer select-none grayscale' : ''}`}
                            onClick={() => !hasMembership && triggerPremiumModal("Zonas de Cobertura", "Elige las zonas donde prefieres trabajar para que los clientes te contacten según tu proximidad.")}
                        >
                            <div className="flex flex-wrap gap-2">
                                {zones.map(zone => (
                                    <button
                                        key={zone}
                                        onClick={() => toggleItem('preferred_zones', zone)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.preferred_zones.includes(zone)
                                            ? 'bg-amber-800 text-white border-transparent shadow-md shadow-amber-800/20'
                                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {zone}
                                    </button>
                                ))}
                            </div>
                            {!hasMembership && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Lock className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                        {!hasMembership && <p className="text-xs text-amber-600 font-medium">Actualiza a Premium para definir tus zonas de cobertura.</p>}
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Languages className="h-4 w-4" /> Idiomas de Comunicación
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {languagesList.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => toggleItem('languages', lang)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.languages.includes(lang)
                                        ? 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-600/20'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Lenguas Indígenas</h4>
                        <div className="flex flex-wrap gap-2">
                            {indigenousLanguagesList.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => toggleItem('indigenous_languages', lang)}
                                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${formData.indigenous_languages.includes(lang)
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>


                </div>

                {/* Schedule */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Horario de Disponibilidad
                        </h4>
                        {!hasMembership && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Premium</span>}
                    </div>

                    <div
                        className={`space-y-3 bg-white border border-gray-100 p-4 md:p-6 rounded-3xl overflow-hidden shadow-soft relative ${!hasMembership ? 'opacity-50 cursor-pointer select-none grayscale' : ''}`}
                        onClick={() => !hasMembership && triggerPremiumModal("Horario de Disponibilidad", "Muestra tus horas activas para que los pasajeros reserven tus servicios en los momentos que tú decidas.")}
                    >
                        {!hasMembership && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
                                <Lock className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 py-3 border-b border-gray-100 last:border-0">
                                <span className="text-[#0F2137] font-medium">{day}</span>
                                <div className="flex items-center gap-2 justify-end">
                                    <div className="relative group flex-1 sm:flex-none">
                                        <input
                                            type="time"
                                            className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#0F2137] focus:outline-none focus:border-blue-500 transition-colors"
                                            value={formData.work_schedule[day]?.start || '00:00'}
                                            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                        />
                                    </div>
                                    <span className="text-gray-400">-</span>
                                    <div className="relative group flex-1 sm:flex-none">
                                        <input
                                            type="time"
                                            className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#0F2137] focus:outline-none focus:border-blue-500 transition-colors"
                                            value={formData.work_schedule[day]?.end || '00:00'}
                                            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {!hasMembership && <p className="text-xs text-amber-600 font-medium">Actualiza a Premium para mostrar tu horario.</p>}
                </div>
            </div>

            {/* Questionnaire Shortcut */}
            <div className="space-y-8 pt-8 border-t border-gray-100">
                <div className="max-w-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-[#0F2137]">Cuestionario Profesional</h3>
                        {!hasMembership && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Premium</span>}
                    </div>

                    <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        {!hasMembership && (
                            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                <BadgeCheck className="h-12 w-12 text-amber-500 mb-4" />
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Característica Premium</h4>
                                <p className="text-sm text-gray-600 max-w-sm mb-4">
                                    El perfilamiento profesional te ayuda a conectar con clientes específicos (Ej. Pet Friendly, Turismo, Ejecutivo).
                                </p>
                                <Link href="/perfil?tab=payments" className="bg-aviva-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">
                                    Adquirir Membresía
                                </Link>
                            </div>
                        )}

                        <div className="p-6 bg-white rounded-3xl shadow-sm">
                            <BadgeCheck className="h-12 w-12 text-blue-600" />
                        </div>
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h4 className="text-xl font-bold text-[#0F2137]">Perfilamiento de Servicio</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Completa el cuestionario para definir tu "Sello de Servicio" y atraer a los clientes que buscan tu estilo particular.
                            </p>
                            <div className="pt-4">
                                <Link
                                    href={hasMembership ? "/perfil/cuestionario" : "#"}
                                    className={`inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 ${!hasMembership ? 'pointer-events-none opacity-50' : ''}`}
                                >
                                    Abrir Cuestionario 1.1
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-6 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Formas de Pago Aceptadas
                </h4>
                <div className="space-y-6">
                    <p className="text-sm text-gray-400">Selecciona los métodos de pago que aceptas directamente.</p>
                    <div className="flex flex-wrap gap-3">
                        {['Efectivo', 'Transferencia Bancaria', 'Tarjeta de Crédito/Débito', 'Pago en Línea'].map(method => (
                            <button
                                key={method}
                                onClick={() => toggleItem('payment_methods', method)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${formData.payment_methods.includes(method)
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                    : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {method === 'Efectivo' && <span className="text-lg">💵</span>}
                                {method === 'Transferencia Bancaria' && <span className="text-lg">🏦</span>}
                                {method === 'Tarjeta de Crédito/Débito' && <span className="text-lg">💳</span>}
                                {method === 'Pago en Línea' && <span className="text-lg">🌐</span>}
                                {method}
                            </button>
                        ))}
                    </div>

                    {/* Online Payment Link Input */}
                    {formData.payment_methods.includes('Pago en Línea') && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold uppercase text-blue-600 block">Link de Pagos (Stripe, Paypal, MercadoPago, etc)</label>
                                {!hasMembership && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Premium</span>}
                            </div>

                            {hasMembership ? (
                                <>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="url"
                                            value={formData.payment_link || ''}
                                            onChange={(e) => setFormData({ ...formData, payment_link: e.target.value })}
                                            placeholder="https://paypal.me/tu-usuario"
                                            className="w-full bg-white border border-blue-200 rounded-xl pl-10 pr-4 py-3 text-[#0F2137] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Este botón aparecerá en tu perfil público para que los clientes puedan pagarte directamente.
                                    </p>
                                </>
                            ) : (
                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                    <p className="text-sm text-gray-500">Solo los miembros Premium pueden habilitar el botón de pago directo en su perfil.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            <div className="space-y-6 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1 w-full">
                        <h4 className="text-sm font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                            <BadgeCheck className="h-4 w-4" />
                            <span>El catálogo público es un potenciador Premium</span>
                        </h4>
                        <p className="text-xs text-gray-400 text-center sm:text-left w-full">
                            Muy pronto los pasajeros de tu ciudad entrarán a AvivaGo para buscar conductores como tú. Activa esta opción para destacar en nuestro catálogo general y captar clientes nuevos.
                        </p>
                    </div>
                    {!hasMembership && (
                        <div className="flex justify-center sm:justify-end">
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <BadgeCheck className="h-3 w-3" /> Premium
                            </span>
                        </div>
                    )}
                </div>

                <div
                    className="relative rounded-3xl overflow-hidden cursor-pointer"
                    onClick={() => !hasMembership && triggerPremiumModal("Aparecer en Catálogo Nacional", "Únete a Premium para ser descubierto por pasajeros en tu ciudad que pronto usarán AvivaGo. ¡Tu perfil y enlace personal gratuito funcionarán siempre!")}
                >
                    <div className={!hasMembership ? 'pointer-events-none' : ''}>
                        <ProfileVisibilityCard
                            isVisible={isVisible}
                            onToggleVisibility={handleToggleVisibility}
                            updating={updatingVisibility}
                            disabled={!hasMembership}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <button
                    onClick={() => {
                        if (formData.records_video && !videoCommitment) {
                            setIsCommitmentModalOpen(true)
                            return
                        }
                        onSave(formData)
                    }}
                    disabled={saving}
                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-2xl shadow-blue-600/30"
                >
                    <Save className="h-5 w-5" />
                    {saving ? 'Guardando...' : 'Guardar Configuración de Servicio'}
                </button>
            </div>

            <PremiumUpsellModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                feature={modalConfig.feature}
                message={modalConfig.message}
            />

            {/* Commitment Warning Modal */}
            {isCommitmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-amber-100 p-4 rounded-full">
                                <Lock className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F2137]">Compromiso Obligatorio</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Para poder activar tu aviso de privacidad y el uso de cámaras en tu perfil, debes de <strong>aceptar el compromiso</strong> marcando la casilla de aceptación.
                            </p>
                            <button
                                onClick={() => setIsCommitmentModalOpen(false)}
                                className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                            >
                                Entendido, revisar compromiso
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
