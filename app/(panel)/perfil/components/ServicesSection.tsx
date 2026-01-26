'use client'

import { useState, useEffect } from 'react'
import { FileText, User, Car, MapPin, Languages, CheckCircle2, Clock, BadgeCheck, ChevronRight, CreditCard, Globe, Save } from 'lucide-react'
import Link from 'next/link'

export default function ServicesSection({ services, onSave, saving }: any) {
    const zones = ['Zona Oriente', 'Zona Poniente', 'Zona Norte', 'Zona Sur', 'Zona Centro']
    const languagesList = ['Español', 'Inglés', 'Alemán', 'Francés', 'Japonés', 'Chino']
    const indigenousLanguagesList = ['Náhuatl', 'Maya', 'Tseltal', 'Tsotsil', 'Mixteco', 'Zapoteco', 'Otomí']

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
        payment_link: services?.payment_link || ''
    })

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
                payment_link: services.payment_link || ''
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
            {/* Reseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Professional Bio */}
                <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Reseña Profesional
                    </h4>
                    <div className="space-y-2">
                        <p className="text-sm text-zinc-400">Describe tu servicio con tus propias palabras.</p>
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
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-6 min-h-[120px] text-white focus:border-blue-500 transition-colors resize-none"
                        />
                    </div>
                </div>

                {/* Personal Bio */}
                <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <User className="h-4 w-4" /> Reseña Personal
                    </h4>
                    <div className="space-y-2">
                        <p className="text-sm text-zinc-400">Cuéntanos sobre tus gustos, pasatiempos y cosas de interés.</p>
                        <textarea
                            value={formData.personal_bio}
                            onChange={(e) => setFormData({ ...formData, personal_bio: e.target.value })}
                            placeholder="Ej. Me gusta el senderismo, la música clásica y conocer nuevos lugares..."
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-6 min-h-[120px] text-white focus:border-blue-500 transition-colors resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Platforms */}
            <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Car className="h-4 w-4" /> Plataformas de Transporte
                </h4>
                <div className="space-y-4">
                    <p className="text-sm text-zinc-400">Señala las plataformas donde ofreces tus servicios:</p>
                    <div className="flex flex-wrap gap-3">
                        {platformOptions.map(platform => (
                            <button
                                key={platform}
                                onClick={() => toggleItem('transport_platforms', platform)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${formData.transport_platforms.includes(platform)
                                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                    : 'bg-white/5 border border-white/10 text-zinc-500 hover:border-white/20'
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
                        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Zonas de Trabajo Preferente
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {zones.map(zone => (
                                <button
                                    key={zone}
                                    onClick={() => toggleItem('preferred_zones', zone)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.preferred_zones.includes(zone)
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white/5 border border-white/10 text-zinc-400 hover:border-white/20'
                                        }`}
                                >
                                    {zone}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Languages className="h-4 w-4" /> Idiomas de Comunicación
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {languagesList.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => toggleItem('languages', lang)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.languages.includes(lang)
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white/5 border border-white/10 text-zinc-400 hover:border-white/20'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Lenguas Indígenas</h4>
                        <div className="flex flex-wrap gap-2">
                            {indigenousLanguagesList.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => toggleItem('indigenous_languages', lang)}
                                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${formData.indigenous_languages.includes(lang)
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white/5 border border-white/10 text-zinc-500'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sign Language Question */}
                    <div className="pt-6 border-t border-white/10 space-y-6">
                        <div className="flex flex-col gap-4">
                            <p className="text-sm font-bold text-zinc-300">¿Conoces el lenguaje de señas para comunicarte con personas con discapacidad auditiva?</p>
                            <button
                                onClick={() => setFormData({ ...formData, knows_sign_language: !formData.knows_sign_language })}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all text-left w-full sm:w-fit ${formData.knows_sign_language
                                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                                    : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.knows_sign_language ? 'bg-blue-600 border-transparent' : 'border-white/20'}`}>
                                    {formData.knows_sign_language && <CheckCircle2 className="h-4 w-4 text-white" />}
                                </div>
                                <span className={`font-bold text-sm ${formData.knows_sign_language ? 'text-white' : ''}`}>Sí, domino el lenguaje de señas (LSM)</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <p className="text-sm font-bold text-zinc-300">Compromiso de Trato Igualitario</p>
                            <button
                                onClick={() => setFormData({ ...formData, social_commitment: !formData.social_commitment })}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all text-left w-full ${formData.social_commitment
                                    ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                    : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${formData.social_commitment ? 'bg-emerald-600 border-transparent' : 'border-white/20'}`}>
                                    {formData.social_commitment && <CheckCircle2 className="h-4 w-4 text-white" />}
                                </div>
                                <span className={`font-bold text-sm leading-relaxed ${formData.social_commitment ? 'text-white' : ''}`}>
                                    Me comprometo a brindar un trato cordial, respetuoso y equitativo a hombres, mujeres y a la comunidad LGBTQ+, sin distinción por ideologías o creencias religiosas de mis pasajeros.
                                </span>
                            </button>
                            <p className="text-xs text-zinc-500 leading-relaxed px-2">
                                Puedes marcar o no esta opción; sin embargo, al hacerlo te comprometes con la comunidad. Cualquier incumplimiento de esta verificación podrá ser considerado una falta a las normas y políticas de la comunidad.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Horario de Disponibilidad
                    </h4>
                    <div className="space-y-3 bg-white/5 p-4 md:p-6 rounded-3xl border border-white/5 overflow-hidden">
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 py-3 border-b border-white/5 last:border-0">
                                <span className="text-zinc-400 font-medium">{day}</span>
                                <div className="flex items-center gap-2 justify-end">
                                    <div className="relative group flex-1 sm:flex-none">
                                        <input
                                            type="time"
                                            className="w-full sm:w-auto bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={formData.work_schedule[day]?.start || '00:00'}
                                            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                        />
                                    </div>
                                    <span className="text-zinc-600">-</span>
                                    <div className="relative group flex-1 sm:flex-none">
                                        <input
                                            type="time"
                                            className="w-full sm:w-auto bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            value={formData.work_schedule[day]?.end || '00:00'}
                                            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Questionnaire Shortcut */}
            <div className="space-y-8 pt-8 border-t border-white/10">
                <div className="max-w-3xl">
                    <h3 className="text-2xl font-bold mb-4">Cuestionario Profesional</h3>
                    <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2rem] flex flex-col md:flex-row items-center gap-8">
                        <div className="p-6 bg-blue-600/20 rounded-3xl">
                            <BadgeCheck className="h-12 w-12 text-blue-400" />
                        </div>
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h4 className="text-xl font-bold">Perfilamiento de Servicio</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Completa el cuestionario para definir tu "Sello de Servicio" y atraer a los clientes que buscan tu estilo particular.
                            </p>
                            <div className="pt-4">
                                <Link
                                    href="/perfil/cuestionario"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
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
            <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Formas de Pago Aceptadas
                </h4>
                <div className="space-y-6">
                    <p className="text-sm text-zinc-400">Selecciona los métodos de pago que aceptas directamente.</p>
                    <div className="flex flex-wrap gap-3">
                        {['Efectivo', 'Transferencia Bancaria', 'Tarjeta de Crédito/Débito', 'Pago en Línea'].map(method => (
                            <button
                                key={method}
                                onClick={() => toggleItem('payment_methods', method)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${formData.payment_methods.includes(method)
                                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                    : 'bg-white/5 border border-white/10 text-zinc-500 hover:border-white/20'
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
                            <label className="text-[10px] font-bold uppercase text-blue-400 mb-2 block">Link de Pagos (Stripe, Paypal, MercadoPago, etc)</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                                <input
                                    type="url"
                                    value={formData.payment_link || ''}
                                    onChange={(e) => setFormData({ ...formData, payment_link: e.target.value })}
                                    placeholder="https://paypal.me/tu-usuario"
                                    className="w-full bg-zinc-900 border border-blue-500/30 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">
                                Este botón aparecerá en tu perfil público para que los clientes puedan pagarte directamente.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <button
                    onClick={() => onSave(formData)}
                    disabled={saving}
                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-2xl shadow-blue-600/30"
                >
                    <Save className="h-5 w-5" />
                    {saving ? 'Guardando...' : 'Guardar Configuración de Servicio'}
                </button>
            </div>
        </div>
    )
}
