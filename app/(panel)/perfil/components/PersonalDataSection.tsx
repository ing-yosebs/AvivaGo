'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Camera, Loader2, Plus, CheckCircle2, FileText, AlertCircle, MapPin, Search, Save } from 'lucide-react'
import { GoogleMap, useJsApiLoader, Autocomplete, MarkerF } from '@react-google-maps/api'
import { uploadFile } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'

const LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = ['places']

export default function PersonalDataSection({ profile, onSave, saving }: any) {
    const educationLevels = [
        { value: 'Ninguno', label: 'Ninguno' },
        { value: 'Primaria', label: 'Primaria' },
        { value: 'Secundaria', label: 'Secundaria' },
        { value: 'Medio superior', label: 'Medio superior' },
        { value: 'Superior', label: 'Superior (Licenciatura, Ingeniería)' },
        { value: 'Maestría', label: 'Maestría' },
        { value: 'Doctorado', label: 'Doctorado' }
    ]
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const idInputRef = useRef<HTMLInputElement>(null)
    const addressInputRef = useRef<HTMLInputElement>(null)

    const supabase = createClient()
    const [uploading, setUploading] = useState<string | null>(null)
    const [signedIdUrl, setSignedIdUrl] = useState<string | null>(null)
    const [signedAddressUrl, setSignedAddressUrl] = useState<string | null>(null)

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

    useEffect(() => {
        const signUrl = async (url: string, setter: (u: string | null) => void) => {
            if (!url) { setter(null); return }
            try {
                if (url.includes('/storage/v1/object/public/documents/')) {
                    const path = url.split('/documents/')[1];
                    if (path) {
                        const { data } = await supabase.storage.from('documents').createSignedUrl(path, 3600);
                        if (data?.signedUrl) { setter(data.signedUrl); return }
                    }
                }
                setter(url)
            } catch { setter(url) }
        }

        signUrl(formData.id_document_url, setSignedIdUrl)
        signUrl(formData.address_proof_url, setSignedAddressUrl)
    }, [formData.id_document_url, formData.address_proof_url, supabase.storage])

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
                            {educationLevels.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Identificación Oficial *</label>
                            <input
                                type="file"
                                ref={idInputRef}
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e, 'id_document_url', 'documents')}
                            />
                            <div
                                onClick={() => idInputRef.current?.click()}
                                className={`cursor-pointer group relative aspect-video w-full rounded-xl overflow-hidden border border-dashed transition-all bg-white/5 flex flex-col items-center justify-center ${formData.id_document_url ? 'border-emerald-500/30' : 'border-white/20 hover:border-blue-500/50'}`}
                            >
                                {uploading === 'id_document_url' ? (
                                    <div className="flex flex-col items-center justify-center text-zinc-500">
                                        <Loader2 className="h-6 w-6 animate-spin mb-2 text-blue-500" />
                                        <span className="text-[10px]">Subiendo...</span>
                                    </div>
                                ) : signedIdUrl ? (
                                    <>
                                        {signedIdUrl.toLowerCase().includes('.pdf') ? (
                                            <div className="flex flex-col items-center justify-center text-zinc-400 group-hover:text-blue-400 transition-colors">
                                                <FileText className="h-10 w-10 mb-2" />
                                                <span className="text-[10px] font-medium">Documento PDF</span>
                                            </div>
                                        ) : (
                                            <img src={signedIdUrl} alt="ID Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold flex items-center gap-2">
                                                <Camera className="h-4 w-4" /> Cambiar
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                            <CheckCircle2 className="h-3 w-3" /> Listo
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                                        <Plus className="h-6 w-6 mb-2" />
                                        <span className="text-[10px]">Subir Imagen o PDF</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Comprobante Domicilio *</label>
                            <input
                                type="file"
                                ref={addressInputRef}
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e, 'address_proof_url', 'documents')}
                            />
                            <div
                                onClick={() => addressInputRef.current?.click()}
                                className={`cursor-pointer group relative aspect-video w-full rounded-xl overflow-hidden border border-dashed transition-all bg-white/5 flex flex-col items-center justify-center ${formData.address_proof_url ? 'border-emerald-500/30' : 'border-white/20 hover:border-blue-500/50'}`}
                            >
                                {uploading === 'address_proof_url' ? (
                                    <div className="flex flex-col items-center justify-center text-zinc-500">
                                        <Loader2 className="h-6 w-6 animate-spin mb-2 text-blue-500" />
                                        <span className="text-[10px]">Subiendo...</span>
                                    </div>
                                ) : signedAddressUrl ? (
                                    <>
                                        {signedAddressUrl.toLowerCase().includes('.pdf') ? (
                                            <div className="flex flex-col items-center justify-center text-zinc-400 group-hover:text-blue-400 transition-colors">
                                                <FileText className="h-10 w-10 mb-2" />
                                                <span className="text-[10px] font-medium">Documento PDF</span>
                                            </div>
                                        ) : (
                                            <img src={signedAddressUrl} alt="Address Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold flex items-center gap-2">
                                                <Camera className="h-4 w-4" /> Cambiar
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                            <CheckCircle2 className="h-3 w-3" /> Listo
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                                        <Plus className="h-6 w-6 mb-2" />
                                        <span className="text-[10px]">Subir Imagen o PDF</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 italic text-opacity-70 text-center">
                        * Solamente se aceptan archivos de imagen (JPG, PNG) o PDF.
                    </p>
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
                                        onLoad={map => { mapRef.current = map }}
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
        </div >
    )
}
