'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/supabase/storage'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
    Check,
    Search
} from 'lucide-react'
import { GoogleMap, useJsApiLoader, Autocomplete, MarkerF } from '@react-google-maps/api'

const LIBRARIES: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places']

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ProfileContent />
        </Suspense>
    )
}

function ProfileContent() {
    const searchParams = useSearchParams()
    const urlTab = searchParams.get('tab')
    const [activeTab, setActiveTab] = useState(urlTab || 'personal')
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
        if (urlTab) {
            setActiveTab(urlTab)
        }
    }, [urlTab])

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
        address_street: profile?.address_street || '',
        address_number_ext: profile?.address_number_ext || '',
        address_number_int: profile?.address_number_int || '',
        address_suburb: profile?.address_suburb || '',
        address_state: profile?.address_state || '',
        address_country: profile?.address_country || '',
        address_postal_code: profile?.address_postal_code || '',
        address_references: profile?.address_references || '',
        address_map_lat: profile?.address_map_lat || 19.4326,
        address_map_lng: profile?.address_map_lng || -99.1332,
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
                address_street: profile.address_street || '',
                address_number_ext: profile.address_number_ext || '',
                address_number_int: profile.address_number_int || '',
                address_suburb: profile.address_suburb || '',
                address_state: profile.address_state || '',
                address_country: profile.address_country || '',
                address_postal_code: profile.address_postal_code || '',
                address_references: profile.address_references || '',
                address_map_lat: profile.address_map_lat || 19.4326,
                address_map_lng: profile.address_map_lng || -99.1332,
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

    // Google Maps logic
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES
    })

    const [autocomplete, setAutocomplete] = useState<any>(null)
    const mapRef = useRef<any>(null)

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace()
            if (!place.geometry) return

            const components = place.address_components
            let street = '', num = '', suburb = '', city = '', state = '', country = '', cp = ''

            components.forEach((c: any) => {
                const types = c.types
                if (types.includes('route')) street = c.long_name
                if (types.includes('street_number')) num = c.long_name
                if (types.includes('sublocality') || types.includes('neighborhood')) suburb = c.long_name
                if (types.includes('locality') || types.includes('administrative_area_level_2')) city = c.long_name
                if (types.includes('administrative_area_level_1')) state = c.long_name
                if (types.includes('country')) country = c.long_name
                if (types.includes('postal_code')) cp = c.long_name
            })

            setFormData(prev => ({
                ...prev,
                address_text: place.formatted_address || '',
                address_street: street,
                address_number_ext: num,
                address_suburb: suburb || city,
                address_state: state,
                address_country: country,
                address_postal_code: cp,
                address_map_lat: place.geometry.location.lat(),
                address_map_lng: place.geometry.location.lng(),
            }))
        }
    }

    // Sync manual changes to map
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoaded && window.google) {
                const address = `${formData.address_street} ${formData.address_number_ext}, ${formData.address_suburb}, ${formData.address_state}, ${formData.address_postal_code}, ${formData.address_country}`
                const geocoder = new google.maps.Geocoder()
                geocoder.geocode({ address }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        const { lat, lng } = results[0].geometry.location
                        const newLat = lat()
                        const newLng = lng()

                        // Only update if difference is significant to avoid infinite loops or jitter
                        if (Math.abs(newLat - formData.address_map_lat) > 0.0001 || Math.abs(newLng - formData.address_map_lng) > 0.0001) {
                            setFormData(prev => ({
                                ...prev,
                                address_map_lat: newLat,
                                address_map_lng: newLng
                            }))
                        }
                    }
                })
            }
        }, 2000)
        return () => clearTimeout(timer)
    }, [formData.address_street, formData.address_number_ext, formData.address_suburb, formData.address_state, formData.address_postal_code, isLoaded])

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

                {/* Address Section */}
                <div className="md:col-span-2 space-y-6 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> Dirección de Residencia Actual
                    </h4>

                    {isLoaded ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500">Buscar Dirección (Autocompletado)</label>
                                    <Autocomplete
                                        onLoad={setAutocomplete}
                                        onPlaceChanged={onPlaceChanged}
                                    >
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Empieza a escribir tu dirección..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-blue-500"
                                            />
                                            <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                                        </div>
                                    </Autocomplete>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-bold uppercase text-zinc-500">Calle *</label>
                                        <input name="address_street" value={formData.address_street} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-zinc-500">No. Exterior *</label>
                                        <input name="address_number_ext" value={formData.address_number_ext} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-zinc-500">No. Interior</label>
                                        <input name="address_number_int" value={formData.address_number_int} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-zinc-500">Alcaldía / Municipio *</label>
                                        <input name="address_suburb" value={formData.address_suburb} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-zinc-500">Código Postal *</label>
                                        <input name="address_postal_code" value={formData.address_postal_code} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-zinc-500">Estado *</label>
                                        <input name="address_state" value={formData.address_state} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-zinc-500">País *</label>
                                        <input name="address_country" value={formData.address_country} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500">Referencias</label>
                                    <textarea name="address_references" value={formData.address_references} onChange={handleChange} placeholder="Ej. Casa portón negro, frente a parque..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 min-h-[80px]" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={{ lat: Number(formData.address_map_lat), lng: Number(formData.address_map_lng) }}
                                        zoom={15}
                                        onLoad={map => mapRef.current = map}
                                        options={{
                                            styles: [
                                                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                                            ],
                                            disableDefaultUI: true,
                                            zoomControl: true,
                                        }}
                                    >
                                        <MarkerF
                                            position={{ lat: Number(formData.address_map_lat), lng: Number(formData.address_map_lng) }}
                                            draggable={true}
                                            onDragEnd={(e: any) => {
                                                const lat = e.latLng.lat();
                                                const lng = e.latLng.lng();
                                                setFormData(prev => ({ ...prev, address_map_lat: lat, address_map_lng: lng }));
                                            }}
                                        />
                                    </GoogleMap>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Latitud</p>
                                        <p className="text-xs font-mono text-blue-400">{formData.address_map_lat}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Longitud</p>
                                        <p className="text-xs font-mono text-blue-400">{formData.address_map_lng}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] bg-white/5 rounded-3xl flex items-center justify-center border border-dashed border-white/20">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-700" />
                        </div>
                    )}
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
        professional_questionnaire: services?.professional_questionnaire || { bio: '' }
    })

    useEffect(() => {
        if (services) {
            setFormData({
                preferred_zones: services.preferred_zones || [],
                languages: services.languages || ['Español'],
                indigenous_languages: services.indigenous_languages || [],
                work_schedule: services.work_schedule || {},
                professional_questionnaire: services.professional_questionnaire || { bio: '' }
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
            <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Reseña Profesional
                </h4>
                <div className="space-y-2">
                    <p className="text-sm text-zinc-400">Describe tu servicio con tus propias palabras para que los clientes te conozcan mejor.</p>
                    <textarea
                        value={formData.professional_questionnaire?.bio || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            professional_questionnaire: {
                                ...formData.professional_questionnaire,
                                bio: e.target.value
                            }
                        })}
                        placeholder="Ej. Soy un conductor con 10 años de experiencia, especializado en traslados ejecutivos y turismo local..."
                        className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-6 min-h-[150px] text-white focus:border-blue-500 transition-colors resize-none"
                    />
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
