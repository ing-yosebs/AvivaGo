'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/supabase/storage'
import Link from 'next/link'
import {
    User,
    Car,
    CreditCard,
    Lock,
    Camera,
    Save,
    Plus,
    Trash2,
    Calendar,
    ChevronRight,
    BadgeCheck,
    MapPin,
    FileText,
    Clock,
    Languages,
    CheckCircle2,
    AlertCircle,
    Info,
    Loader2,
    Check
} from 'lucide-react'

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('personal')
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [isDriver, setIsDriver] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [driverServices, setDriverServices] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const supabase = createClient()

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUser(user)

        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (userData) {
            setProfile(userData)
            setIsDriver(userData.roles?.includes('driver'))
            return userData
        }
    }

    const loadVehicles = async (userId: string) => {
        const { data: drvProfile } = await supabase
            .from('driver_profiles')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (drvProfile) {
            const { data: vhls } = await supabase
                .from('vehicles')
                .select('*')
                .eq('driver_profile_id', drvProfile.id)
            setVehicles(vhls || [])
        }
    }

    const loadServices = async (userId: string) => {
        const { data: drvProfile } = await supabase
            .from('driver_profiles')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (drvProfile) {
            const { data: services } = await supabase
                .from('driver_services')
                .select('*')
                .eq('driver_profile_id', drvProfile.id)
                .single()

            setDriverServices(services || {
                driver_profile_id: drvProfile.id,
                work_schedule: {},
                preferred_zones: [],
                languages: [],
                indigenous_languages: [],
                professional_questionnaire: {}
            })
        }
    }

    useEffect(() => {
        const init = async () => {
            const userData = await loadProfile()
            if (userData?.roles?.includes('driver')) {
                await loadVehicles(userData.id)
                await loadServices(userData.id)
            }
            setLoading(false)
        }
        init()
    }, [supabase])

    const handleSaveProfile = async (formData: any) => {
        setSaving(true)
        setMessage(null)
        try {
            const { error } = await supabase
                .from('users')
                .update(formData)
                .eq('id', user.id)

            if (error) throw error
            await loadProfile() // Refresh local state
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    const handleSaveServices = async (formData: any) => {
        setSaving(true)
        setMessage(null)
        try {
            const { error } = await supabase
                .from('driver_services')
                .upsert({
                    driver_profile_id: driverServices.driver_profile_id,
                    ...formData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'driver_profile_id' })

            if (error) throw error
            setMessage({ type: 'success', text: 'Servicios actualizados correctamente' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="animate-pulse space-y-4">
            <div className="h-12 bg-white/5 rounded-2xl w-1/4" />
            <div className="h-[400px] bg-white/5 rounded-3xl" />
        </div>
    )

    const tabs = [
        { id: 'personal', label: 'Datos Personales', icon: User },
        ...(isDriver ? [
            { id: 'vehicles', label: 'Mis Vehículos', icon: Car },
            { id: 'services', label: 'Mis Servicios', icon: Clock }
        ] : []),
        { id: 'payments', label: 'Pagos y Membresía', icon: CreditCard },
        { id: 'security', label: 'Seguridad', icon: Lock },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Configuración</h1>
                <p className="text-zinc-400">Gestiona tu información personal y preferencias de la cuenta.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit overflow-x-auto max-w-full no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">

                {activeTab === 'personal' && (
                    <PersonalDataSection profile={profile} onSave={handleSaveProfile} saving={saving} />
                )}

                {activeTab === 'vehicles' && (
                    <VehiclesSection vehicles={vehicles} onAdd={() => loadVehicles(user.id)} />
                )}

                {activeTab === 'services' && (
                    <ServicesSection services={driverServices} onSave={handleSaveServices} saving={saving} />
                )}

                {activeTab === 'payments' && (
                    <PaymentsSection isDriver={isDriver} />
                )}

                {activeTab === 'security' && (
                    <SecuritySection />
                )}
            </div>
        </div>
    )
}

function PersonalDataSection({ profile, onSave, saving }: any) {
    const educationLevels = ['Ninguno', 'Primaria', 'Secundaria', 'Medio superior', 'Superior (Licenciatura, Ingeniería)', 'Maestría', 'Doctorado']
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const idInputRef = useRef<HTMLInputElement>(null)
    const addressInputRef = useRef<HTMLInputElement>(null)

    const [uploading, setUploading] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || '',
        email: profile?.email || '',
        birthday: profile?.birthday || '',
        nationality: profile?.nationality || '',
        curp: profile?.curp || '',
        education_level: profile?.education_level || '',
        emergency_contact_name: profile?.emergency_contact_name || '',
        emergency_contact_relationship: profile?.emergency_contact_relationship || '',
        emergency_contact_phone: profile?.emergency_contact_phone || '',
        address_text: profile?.address_text || '',
        avatar_url: profile?.avatar_url || '',
        id_document_url: profile?.id_document_url || '',
        address_proof_url: profile?.address_proof_url || '',
    })

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone_number: profile.phone_number || '',
                email: profile.email || '',
                birthday: profile.birthday || '',
                nationality: profile.nationality || '',
                curp: profile.curp || '',
                education_level: profile.education_level || '',
                emergency_contact_name: profile.emergency_contact_name || '',
                emergency_contact_relationship: profile.emergency_contact_relationship || '',
                emergency_contact_phone: profile.emergency_contact_phone || '',
                address_text: profile.address_text || '',
                avatar_url: profile.avatar_url || '',
                id_document_url: profile.id_document_url || '',
                address_proof_url: profile.address_proof_url || '',
            })
        }
    }, [profile])

    const handleChange = (e: any) => {
        let value = e.target.value
        if (e.target.name === 'curp') {
            value = value.toUpperCase()
        }
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string, bucket: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(field)
        try {
            const path = `${profile.id}/${Date.now()}_${file.name}`
            const url = await uploadFile(bucket, path, file)
            setFormData(prev => ({ ...prev, [field]: url }))
        } catch (error: any) {
            alert('Error al subir archivo: ' + error.message)
        } finally {
            setUploading(null)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-zinc-800 border-2 border-white/10 overflow-hidden">
                        {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                <User className="h-10 w-10" />
                            </div>
                        )}
                        {uploading === 'avatar_url' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={avatarInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'avatar_url', 'avatars')}
                    />
                    <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-lg text-white shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                </div>
                <div>
                    <h3 className="font-bold text-lg">{formData.full_name || 'Nuevo Usuario'}</h3>
                    <p className="text-zinc-400 text-sm">{profile?.email}</p>
                    <div className="flex gap-2 mt-2">
                        {profile?.roles?.map((role: string) => (
                            <span key={role} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="h-3 w-3" /> Información Básica
                    </h4>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Nombre Completo *</label>
                        <input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Teléfono *</label>
                        <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Correo Electrónico *</label>
                        <input name="email" value={formData.email} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 opacity-50 cursor-not-allowed" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Fecha de Nacimiento</label>
                            <input name="birthday" type="date" value={formData.birthday} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Nacionalidad *</label>
                            <input name="nationality" value={formData.nationality} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Legal & Docs */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Documentación
                    </h4>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">CURP *</label>
                        <input name="curp" value={formData.curp} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Último Grado de Estudios</label>
                        <select name="education_level" value={formData.education_level} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 appearance-none">
                            <option value="">Seleccionar...</option>
                            {educationLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Identificación Oficial *</label>
                            <input
                                type="file"
                                ref={idInputRef}
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'id_document_url', 'documents')}
                            />
                            <button
                                onClick={() => idInputRef.current?.click()}
                                className={`w-full h-20 bg-white/5 border border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${formData.id_document_url ? 'border-emerald-500/50 text-emerald-500' : 'border-white/20 text-zinc-500 hover:border-blue-500/50'
                                    }`}
                            >
                                {uploading === 'id_document_url' ? <Loader2 className="h-4 w-4 animate-spin mb-1" /> : formData.id_document_url ? <CheckCircle2 className="h-4 w-4 mb-1" /> : <Plus className="h-4 w-4 mb-1" />}
                                <span className="text-[10px]">{formData.id_document_url ? 'Cambiar Documento' : 'Subir Archivo'}</span>
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Comprobante Domicilio *</label>
                            <input
                                type="file"
                                ref={addressInputRef}
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'address_proof_url', 'documents')}
                            />
                            <button
                                onClick={() => addressInputRef.current?.click()}
                                className={`w-full h-20 bg-white/5 border border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${formData.address_proof_url ? 'border-emerald-500/50 text-emerald-500' : 'border-white/20 text-zinc-500 hover:border-blue-500/50'
                                    }`}
                            >
                                {uploading === 'address_proof_url' ? <Loader2 className="h-4 w-4 animate-spin mb-1" /> : formData.address_proof_url ? <CheckCircle2 className="h-4 w-4 mb-1" /> : <Plus className="h-4 w-4 mb-1" />}
                                <span className="text-[10px]">{formData.address_proof_url ? 'Cambiar Comprobante' : 'Subir Archivo'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" /> Contacto de Emergencia
                    </h4>
                    <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Nombre Completo</label>
                            <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Parentesco</label>
                                <input name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Teléfono</label>
                                <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Map */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> Ubicación en el Mapa
                    </h4>
                    <div className="relative group">
                        <input
                            name="address_text"
                            value={formData.address_text}
                            onChange={handleChange}
                            placeholder="Buscar dirección en Google Maps..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
                        />
                        <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                    </div>

                    <div className="relative h-64 bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden group">
                        {/* Interactive UI Overlay for Map */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-75 brightness-50 opacity-40" />

                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40 animate-bounce">
                                <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-center px-6">
                                <p className="text-sm font-bold text-white uppercase tracking-widest mb-1">Confirmar Ubicación</p>
                                <p className="text-[10px] text-zinc-400 max-w-[200px]">Haz clic para fijar tu posición exacta y generar coordenadas GPS automáticas.</p>
                            </div>
                            <button className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-all active:scale-95">
                                Activar Localización
                            </button>
                        </div>

                        {/* Map controls visualization */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-400">+</div>
                            <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-400">-</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Latitud</p>
                            <p className="text-xs font-mono text-blue-400">{profile?.address_map_lat || '19.432608'}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Longitud</p>
                            <p className="text-xs font-mono text-blue-400">{profile?.address_map_lng || '-99.133209'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => onSave(formData)}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-600/20"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Guardar Información Personal'}
                </button>
            </div>
        </div>
    )
}

function VehiclesSection({ vehicles, onAdd }: any) {
    const supabase = createClient()
    const [isAdding, setIsAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState<string | null>(null)

    // Hidden refs for all vehicle document and photo uploads
    const vinPhotoRef = useRef<HTMLInputElement>(null)
    const invoiceRef = useRef<HTMLInputElement>(null)
    const verificationRef = useRef<HTMLInputElement>(null)
    const insuranceRef = useRef<HTMLInputElement>(null)
    const photoRefs = useRef<(HTMLInputElement | null)[]>([])

    const [form, setForm] = useState<any>({
        brand: '',
        model: '',
        color: '',
        year: new Date().getFullYear(),
        plate_number: '',
        registration_state: '',
        vin_number: '',
        vin_photo_url: '',
        invoice_url: '',
        verification_url: '',
        insurance_policy_url: '',
        photos: [] // Array of 6 photo URLs
    })

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, field: string, isPhotoArray: boolean = false, index: number = 0) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(field === 'photos' ? `photos-${index}` : field)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const path = `${user?.id}/vehicles/${Date.now()}_${file.name}`
            const url = await uploadFile('vehicles', path, file)

            if (isPhotoArray) {
                const newPhotos = [...form.photos]
                newPhotos[index] = url
                setForm({ ...form, photos: newPhotos })
            } else {
                setForm({ ...form, [field]: url })
            }
        } catch (error: any) {
            alert('Error al subir: ' + error.message)
        } finally {
            setUploading(null)
        }
    }

    const handleRegister = async () => {
        if (!form.brand || !form.model || !form.plate_number) {
            alert('Por favor completa los campos obligatorios.')
            return
        }

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: drvProfile } = await supabase.from('driver_profiles').select('id').eq('user_id', user?.id).single()

            const { error } = await supabase.from('vehicles').insert({
                driver_profile_id: drvProfile?.id,
                ...form,
                status: 'pending' // Vehicles start as pending verification
            })

            if (error) throw error
            setIsAdding(false)
            onAdd() // Refresh list
        } catch (error: any) {
            alert('Error al registrar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (isAdding) {
        return (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-400">
                        <ChevronRight className="h-6 w-6 rotate-180" />
                    </button>
                    <h3 className="text-xl font-bold">Detalles del Vehículo</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Marca *</label>
                                <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Ej. Toyota" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Modelo *</label>
                                <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Ej. Camry" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Color *</label>
                                <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Año *</label>
                                <input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Placas *</label>
                                <input value={form.plate_number} onChange={e => setForm({ ...form, plate_number: e.target.value })} placeholder="ABC-1234" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 font-mono" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Entidad de Registro</label>
                                <input value={form.registration_state} onChange={e => setForm({ ...form, registration_state: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Número NIV (VIN) *</label>
                                <input value={form.vin_number} onChange={e => setForm({ ...form, vin_number: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 font-mono" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Documentación del Auto</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { id: 'vin_photo_url', label: 'Foto NIV', ref: vinPhotoRef },
                                    { id: 'invoice_url', label: 'Factura', ref: invoiceRef },
                                    { id: 'verification_url', label: 'Verificación', ref: verificationRef },
                                    { id: 'insurance_policy_url', label: 'Póliza Seguro', ref: insuranceRef }
                                ].map(doc => (
                                    <div key={doc.id}>
                                        <input type="file" ref={doc.ref} className="hidden" onChange={(e) => handleFile(e, doc.id)} />
                                        <button
                                            onClick={() => doc.ref.current?.click()}
                                            className={`w-full aspect-square bg-white/5 border border-dashed rounded-2xl flex flex-col items-center justify-center text-[10px] gap-2 transition-all ${form[doc.id] ? 'border-emerald-500/50 text-emerald-500' : 'border-white/20 text-zinc-500 hover:border-blue-500/50'
                                                }`}
                                        >
                                            {uploading === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : form[doc.id] ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                            <span>{doc.label}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Fotos del Vehículo (6)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {['Frente', 'Trasera', 'Lateral', 'Interior 1', 'Interior 2', 'Interior 3'].map((label, idx) => (
                                <div key={label}>
                                    <input
                                        type="file"
                                        ref={el => { photoRefs.current[idx] = el }}
                                        className="hidden"
                                        onChange={(e) => handleFile(e, 'photos', true, idx)}
                                    />
                                    <button
                                        onClick={() => photoRefs.current[idx]?.click()}
                                        className="relative w-full aspect-video bg-zinc-900 border border-white/10 rounded-xl overflow-hidden group cursor-pointer hover:border-blue-500/50"
                                    >
                                        {form.photos[idx] ? (
                                            <img src={form.photos[idx]} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 transition-colors group-hover:bg-blue-600/10">
                                                {uploading === `photos-${idx}` ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <Camera className="h-4 w-4 text-zinc-600 mb-1" />}
                                                <span className="text-[8px] font-bold uppercase text-zinc-500 tracking-tighter">{label}</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                            <div className="flex gap-2 text-blue-400 mb-1">
                                <Info className="h-4 w-4 shrink-0" />
                                <span className="text-[10px] font-bold uppercase">Recomendación</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                                Sube fotos claras con buena iluminación. Un vehículo bien presentado atrae 3x más clientes.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-white/10 pt-8">
                    <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 rounded-xl font-bold text-zinc-400 hover:bg-white/5 transition-colors">Cancelar</button>
                    <button
                        onClick={handleRegister}
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {saving ? 'Registrando...' : 'Registrar Vehículo'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">Mis Vehículos registrados</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"
                >
                    <Plus className="h-4 w-4" />
                    Agregar Vehículo
                </button>
            </div>

            {vehicles?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles?.map((v: any) => (
                        <div key={v.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative group hover:border-blue-500/30 transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-600/10 rounded-xl">
                                    <Car className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold truncate">{v.brand} {v.model}</h4>
                                    <p className="text-zinc-500 text-sm">{v.year} • {v.color}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-mono text-zinc-400">
                                    {v.plate_number}
                                </span>
                                <div className="flex gap-2">
                                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <button className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <Car className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">No tienes vehículos registrados todavía.</p>
                </div>
            )}
        </div>
    )
}

function ServicesSection({ services, onSave, saving }: any) {
    const zones = ['Zona Oriente', 'Zona Poniente', 'Zona Norte', 'Zona Sur', 'Zona Centro']
    const languagesList = ['Español', 'Inglés', 'Alemán', 'Francés', 'Japonés', 'Chino']
    const indigenousLanguagesList = ['Náhuatl', 'Maya', 'Tseltal', 'Tsotsil', 'Mixteco', 'Zapoteco', 'Otomí']

    const [formData, setFormData] = useState({
        preferred_zones: services?.preferred_zones || [],
        languages: services?.languages || ['Español'],
        indigenous_languages: services?.indigenous_languages || [],
        work_schedule: services?.work_schedule || {},
        professional_questionnaire: services?.professional_questionnaire || {}
    })

    useEffect(() => {
        if (services) {
            setFormData({
                preferred_zones: services.preferred_zones || [],
                languages: services.languages || ['Español'],
                indigenous_languages: services.indigenous_languages || [],
                work_schedule: services.work_schedule || {},
                professional_questionnaire: services.professional_questionnaire || {}
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

    return (
        <div className="space-y-12 max-w-5xl">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold mb-2">Preferencias de Servicio</h3>
                <p className="text-zinc-400 text-sm">Define cómo y dónde prefieres trabajar para conectar con los clientes adecuados.</p>
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
                </div>

                {/* Schedule */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Horario de Disponibilidad
                    </h4>
                    <div className="space-y-3 bg-white/5 p-6 rounded-3xl border border-white/5">
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                            <div key={day} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
                                <span className="text-zinc-400">{day}</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs"
                                        value={formData.work_schedule[day]?.start || '00:00'}
                                        onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                    />
                                    <span className="text-zinc-600">-</span>
                                    <input
                                        type="time"
                                        className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs"
                                        value={formData.work_schedule[day]?.end || '00:00'}
                                        onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                    />
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


function PaymentsSection({ isDriver }: { isDriver: boolean }) {
    return (
        <div className="space-y-8">
            {isDriver && (
                <div className="backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <BadgeCheck className="h-32 w-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg text-white">Membresía Activa</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Plan Driver Premium</h3>
                        <p className="text-zinc-400 text-sm mb-6 max-w-md">Tu suscripción anual te permite aparecer en los resultados de búsqueda y recibir contactos directos.</p>

                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-400" />
                                <span>Próximo cobro: 15 de Octubre, 2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="font-bold text-lg">Historial de Transacciones</h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Concepto</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium">Pago de Membresía Anual</td>
                                <td className="px-6 py-4 text-zinc-500">15/01/2026</td>
                                <td className="px-6 py-4 text-right font-bold">$49.99</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function SecuritySection() {
    return (
        <div className="space-y-8 max-w-md">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Contraseña Actual</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Nueva Contraseña</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Confirmar Nueva Contraseña</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                </div>
            </div>

            <button className="w-full bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                Cambiar Contraseña
            </button>
        </div>
    )
}
