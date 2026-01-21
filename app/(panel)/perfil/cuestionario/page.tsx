'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    ChevronLeft,
    Save,
    CheckCircle2,
    Shield,
    User,
    Zap,
    Heart,
    Stethoscope,
    Users,
    Languages,
    Map,
    Globe
} from 'lucide-react'

export default function QuestionnairePage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [driverProfileId, setDriverProfileId] = useState<string | null>(null)
    const [formData, setFormData] = useState<any>({
        social: '',
        driving: '',
        assistance: '',
        tags: [],
        languages: [], // array of language strings
        indigenous: [], // array of indigenous language strings
        schedule: '', // free text or JSON representation of schedule
        agreement: false
    })

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            const { data: drvProfile } = await supabase
                .from('driver_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (!drvProfile) {
                router.push('/perfil')
                return
            }

            setDriverProfileId(drvProfile.id)

            const { data: services } = await supabase
                .from('driver_services')
                .select('professional_questionnaire')
                .eq('driver_profile_id', drvProfile.id)
                .single()

            if (services?.professional_questionnaire) {
                setFormData(services.professional_questionnaire)
            }
            setLoading(false)
        }
        loadData()
    }, [supabase, router])

    const handleRadio = (field: string, val: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: val }))
    }

    const handleCheck = (item: string) => {
        const tags = [...(formData.tags || [])]
        const idx = tags.indexOf(item)
        if (idx > -1) tags.splice(idx, 1)
        else tags.push(item)
        setFormData((prev: any) => ({ ...prev, tags }))
    }

    const handleSave = async () => {
        if (!formData.agreement) {
            alert('Debes aceptar el compromiso de validación del perfil.')
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase
                .from('driver_services')
                .upsert({
                    driver_profile_id: driverProfileId,
                    professional_questionnaire: formData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'driver_profile_id' })

            if (error) throw error
            router.push('/perfil?tab=services&success=true')
        } catch (error: any) {
            alert('Error al guardar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-black p-8 flex items-center justify-center text-white">Cargando cuestionario...</div>

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Volver a configuración
                        </button>
                        <h1 className="text-4xl font-bold tracking-tight">Cuestionario Profesional</h1>
                        <p className="text-zinc-400 mt-2">Versión 1.2 - Directorio de Servicios Personalizados</p>
                    </div>
                </div>

                {/* Intro */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Shield className="h-32 w-32" />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Bienvenido a nuestra Comunidad de Servicios Personalizados
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            En este espacio, no buscamos conductores promedio; buscamos especialistas en servicio. Sabemos que cada viaje es distinto y que cada conductor tiene su propia forma de trabajar. Por ello, hemos diseñado este cuestionario de perfilamiento.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Evita fricciones', desc: 'El sistema solo te conectará con personas que buscan lo que tú ya estás dispuesto a ofrecer.' },
                                { title: 'Valoramos tu especialidad', desc: 'Tu "Sello de Servicio" te permitirá atraer clientes recurrentes que valoren tu trabajo.' },
                                { title: 'Protegemos tu entorno', desc: 'Al declarar tus capacidades, construyes un espacio de trabajo donde te sientes cómodo.' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="text-blue-400 font-bold text-sm">• {item.title}</div>
                                    <p className="text-xs text-zinc-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BLOQUE 1 */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500 font-bold">1</div>
                        <h3 className="text-2xl font-bold uppercase tracking-wider text-zinc-400">Personalidad y Atmósfera</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-12 pl-14">
                        {/* Q1 */}
                        <div className="space-y-6">
                            <p className="text-lg font-medium flex items-center gap-3">
                                <User className="h-5 w-5 text-zinc-500" />
                                1. Interacción social:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: '1a', label: 'Privacidad', desc: 'Ambiente de absoluta reserva y silencio.' },
                                    { id: '1b', label: 'Empático', desc: 'Saludo cordial y adaptación al ritmo del cliente.' },
                                    { id: '1c', label: 'Anfitrión', desc: 'Disfruto conversar y dar recomendaciones locales.' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleRadio('social', opt.id)}
                                        className={`p-6 rounded-3xl border text-left transition-all duration-300 ${formData.social === opt.id ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="font-bold text-lg mb-1">{opt.label}</div>
                                        <p className={`text-xs ${formData.social === opt.id ? 'text-blue-100' : 'text-zinc-500'}`}>{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Q2 */}
                        <div className="space-y-6">
                            <p className="text-lg font-medium flex items-center gap-3">
                                <Zap className="h-5 w-5 text-zinc-500" />
                                2. Estilo de conducción y normas:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: '2a', label: 'Zen', desc: 'Suavidad absoluta y velocidad constante por debajo del límite.' },
                                    { id: '2b', label: 'Dinámico', desc: 'Enfoque en puntualidad y optimización de tiempos.' },
                                    { id: '2c', label: 'Normativo', desc: 'Cumplimiento estricto de reglas (no fumar, no comer).' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleRadio('driving', opt.id)}
                                        className={`p-6 rounded-3xl border text-left transition-all duration-300 ${formData.driving === opt.id ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="font-bold text-lg mb-1">{opt.label}</div>
                                        <p className={`text-xs ${formData.driving === opt.id ? 'text-blue-100' : 'text-zinc-500'}`}>{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Q3 */}
                        <div className="space-y-6">
                            <p className="text-lg font-medium flex items-center gap-3">
                                <Heart className="h-5 w-5 text-zinc-500" />
                                3. Nivel de asistencia:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: '3a', label: 'Directo', desc: 'El cliente gestiona su propio acceso y equipaje.' },
                                    { id: '3b', label: 'Asistido', desc: 'Ayuda activa con maletas y apoyo en el ascenso/descenso.' },
                                    { id: '3c', label: 'Espera / Circuitos', desc: 'Disponibilidad para múltiples paradas y esperas.' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleRadio('assistance', opt.id)}
                                        className={`p-6 rounded-3xl border text-left transition-all duration-300 ${formData.assistance === opt.id ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="font-bold text-lg mb-1">{opt.label}</div>
                                        <p className={`text-xs ${formData.assistance === opt.id ? 'text-blue-100' : 'text-zinc-500'}`}>{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BLOQUE 2 & 3 */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-500 font-bold">2</div>
                        <h3 className="text-2xl font-bold uppercase tracking-wider text-zinc-400">Especialidades y Equipamiento</h3>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 ml-0 md:ml-14">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                            {/* Technical */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="h-4 w-4" /> Capacidad Técnica
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { id: 'cargo', label: 'Carga de Alto Volumen (Cajuela extra grande / camioneta)' },
                                        { id: 'sport', label: 'Equipo Deportivo/Especializado (Bicicletas, surf, golf, etc.)' },
                                        { id: 'rack', label: 'Canastilla o Rack exterior' },
                                        { id: 'baby', label: 'Silla para bebé / Asiento elevador' },
                                        { id: 'charge', label: 'Kit de carga para diversos celulares' },
                                        { id: 'ac', label: 'Aire acondicionado funcional' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleCheck(item.id)}
                                            className="flex items-start gap-4 group w-full text-left"
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${(formData.tags || []).includes(item.id) ? 'bg-blue-600 border-transparent' : 'border-white/20 group-hover:border-white/40'
                                                }`}>
                                                {(formData.tags || []).includes(item.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                                            </div>
                                            <span className={`text-sm transition-colors ${(formData.tags || []).includes(item.id) ? 'text-white font-medium' : 'text-zinc-400'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Medical */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4" /> Inclusión y Salud
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { id: 'mobility', label: 'Movilidad Reducida (Silla de ruedas o andaderas)' },
                                        { id: 'sensory', label: 'Asistencia Sensorial (Discapacidad visual o auditiva)' },
                                        { id: 'medical', label: 'Soporte Médico Pasivo (Tanques de oxígeno o equipo portátil)' },
                                        { id: 'plus', label: 'Espacio de Confort (Vehículo amplio para personas Plus Size)' },
                                        { id: 'neuro', label: 'Neurodiversidad (Bajo estímulo: sin música ni fragancias)' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleCheck(item.id)}
                                            className="flex items-start gap-4 group w-full text-left"
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${(formData.tags || []).includes(item.id) ? 'bg-red-600 border-transparent' : 'border-white/20 group-hover:border-white/40'
                                                }`}>
                                                {(formData.tags || []).includes(item.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                                            </div>
                                            <span className={`text-sm transition-colors ${(formData.tags || []).includes(item.id) ? 'text-white font-medium' : 'text-zinc-400'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lifestyle */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Logística y Estilo de Vida
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { id: 'pet', label: 'Pet-Friendly (Acepto mascotas)' },
                                        { id: 'move', label: 'Mudanza Ligera (Ayuda con cajas o muebles pequeños)' },
                                        { id: 'shopping', label: 'Turismo de Compras (Paciencia para múltiples paquetes)' },
                                        { id: 'party', label: 'Traslado de Fiesta / Eventos (Tolerancia en horarios nocturnos)' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleCheck(item.id)}
                                            className="flex items-start gap-4 group w-full text-left"
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${(formData.tags || []).includes(item.id) ? 'bg-emerald-600 border-transparent' : 'border-white/20 group-hover:border-white/40'
                                                }`}>
                                                {(formData.tags || []).includes(item.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                                            </div>
                                            <span className={`text-sm transition-colors ${(formData.tags || []).includes(item.id) ? 'text-white font-medium' : 'text-zinc-400'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tourism */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                    <Map className="h-4 w-4" /> Turismo y Cultura
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { id: 'native', label: 'Anfitrión para Extranjeros (Idiomas definidos en perfil)' },
                                        { id: 'guide', label: 'Guía e Información (Conocedor de historia y gastronomía)' },
                                        { id: 'roads', label: 'Traslados Foráneos (Disponibilidad para carretera)' },
                                        { id: 'universal', label: 'Compromiso de Convivencia (Respeto Universal)' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleCheck(item.id)}
                                            className="flex items-start gap-4 group w-full text-left"
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${(formData.tags || []).includes(item.id) ? 'bg-amber-600 border-transparent' : 'border-white/20 group-hover:border-white/40'
                                                }`}>
                                                {(formData.tags || []).includes(item.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                                            </div>
                                            <span className={`text-sm transition-colors ${(formData.tags || []).includes(item.id) ? 'text-white font-medium' : 'text-zinc-400'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Validation */}
                <div className="space-y-8 pb-32">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-500 font-bold">4</div>
                        <h3 className="text-2xl font-bold uppercase tracking-wider text-zinc-400">Validación y Compromiso</h3>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600/10 to-blue-600/10 border border-emerald-500/20 rounded-[2.5rem] p-8 md:p-12 ml-0 md:ml-14">
                        <label className="flex items-start gap-6 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-8 h-8 rounded-xl border-white/20 bg-white/5 text-emerald-600 focus:ring-emerald-500"
                                checked={formData.agreement || false}
                                onChange={(e) => handleRadio('agreement', e.target.checked)}
                            />
                            <div className="space-y-2">
                                <p className="text-lg md:text-xl font-bold group-hover:text-emerald-400 transition-colors">
                                    ¿Estás de acuerdo en que el usuario califique la veracidad de estas etiquetas?
                                </p>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Entiendo que el incumplimiento de lo aquí declarado pueda afectar mi permanencia en el directorio y que la calidad de mi "Sello de Servicio" depende de mi honestidad.
                                </p>
                                <div className="pt-2 flex items-center gap-2 text-emerald-500 font-bold">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span>Sí, acepto el compromiso.</span>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="hidden md:block">
                            <p className="text-xs text-zinc-500">AvivaGo Professional Driver Questionnaire v1.1</p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => router.back()}
                                className="px-8 py-4 rounded-2xl font-bold text-zinc-400 hover:bg-white/5 transition-colors flex-1 md:flex-none"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-blue-600/30 flex-1 md:flex-none disabled:opacity-50"
                            >
                                <Save className="h-5 w-5" />
                                {saving ? 'Guardando...' : 'Finalizar y Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
