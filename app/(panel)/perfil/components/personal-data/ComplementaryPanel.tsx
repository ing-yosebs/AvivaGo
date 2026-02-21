import { ChevronDown, AlertCircle, MapPin, Search, CheckCircle2 } from 'lucide-react'
import { GoogleMap, useJsApiLoader, Autocomplete, MarkerF } from '@react-google-maps/api'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useRef, useState, useEffect } from 'react'
import { DocumentUploadCard } from './DocumentUploadCard'

const LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = ['places']

interface ComplementaryPanelProps {
    formData: any
    onChange: (e: any) => void
    countries: any[]
    setSelectedCountry: (c: any) => void
    setPhoneCode: (c: string) => void
    setEmergencyPhoneCode: (c: string) => void
    profile: any
    emergencyPhoneCode: string
    onAddressUpdate: (updates: any) => void
    uploading: string | null
    signedUrls: { id: string | null, idBack: string | null, address: string | null }
    onFileUpload: (e: any, field: string, bucket: string) => void
}

export function ComplementaryPanel({
    formData,
    onChange,
    countries,
    setSelectedCountry,
    setPhoneCode,
    setEmergencyPhoneCode,
    profile,
    emergencyPhoneCode,
    onAddressUpdate,
    uploading,
    signedUrls,
    onFileUpload
}: ComplementaryPanelProps) {
    const isVerified = !!profile?.driver_profile?.verified_at

    const educationLevels = [
        { value: 'Ninguno', label: 'Ninguno' },
        { value: 'Primaria', label: 'Primaria' },
        { value: 'Secundaria', label: 'Secundaria' },
        { value: 'Medio superior', label: 'Medio superior' },
        { value: 'Superior', label: 'Superior (Licenciatura, Ingeniería)' },
        { value: 'Maestría', label: 'Maestría' },
        { value: 'Doctorado', label: 'Doctorado' }
    ]

    // Google Maps Logic (moved from AddressSection)
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

            onAddressUpdate({
                address_text: place.formatted_address || '',
                address_street: street,
                address_number_ext: num,
                address_suburb: suburb || city,
                address_state: state,
                address_country: country,
                address_postal_code: cp,
                address_map_lat: place.geometry.location.lat(),
                address_map_lng: place.geometry.location.lng(),
            })
        }
    }

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

                        if (Math.abs(newLat - formData.address_map_lat) > 0.0001 || Math.abs(newLng - formData.address_map_lng) > 0.0001) {
                            onAddressUpdate({
                                address_map_lat: newLat,
                                address_map_lng: newLng
                            })
                        }
                    }
                })
            }
        }, 2000)
        return () => clearTimeout(timer)
    }, [formData.address_street, formData.address_number_ext, formData.address_suburb, formData.address_state, formData.address_postal_code, isLoaded])


    return (
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-8">

            {/* Emergency Contact Section */}
            <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <AlertCircle className="h-3 w-3" /> Contacto de Emergencia
                </h4>
                <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Nombre</label>
                        <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Relación</label>
                        <input name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Teléfono</label>
                        <div className="flex gap-1 w-full">
                            <div className="phone-input-container !w-fit group relative h-[42px]">
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 pl-10 pr-1 text-base md:text-sm text-zinc-500 font-mono">
                                    +{emergencyPhoneCode}
                                </div>
                                <PhoneInput
                                    country={'mx'}
                                    preferredCountries={['mx']}
                                    value={emergencyPhoneCode}
                                    onChange={(val, country: any) => setEmergencyPhoneCode(country.dialCode)}
                                    containerClass="!w-[86px] !h-full"
                                    inputClass="!hidden"
                                    buttonClass="!bg-white !border-gray-200 !rounded-xl !h-full !w-full !static !flex !items-center !justify-start !px-3 hover:!bg-gray-50"
                                    dropdownClass="!bg-white !text-[#0F2137] !border-gray-200 !rounded-xl"
                                    enableSearch
                                    disableSearchIcon
                                    specialLabel=""
                                />
                            </div>
                            <input
                                name="emergency_contact_phone"
                                value={formData.emergency_contact_phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    onChange({ target: { name: 'emergency_contact_phone', value: val } });
                                }}
                                className="flex-1 bg-white border border-gray-200 text-[#0F2137] rounded-xl h-[42px] px-4 outline-none focus:border-blue-500 font-mono text-base md:text-sm placeholder:text-gray-400 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Editable Section */}
            <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <MapPin className="h-3 w-3" /> Residencia Actual
                </h4>

                {isLoaded && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-400">País de Operación</label>
                                <div className="relative">
                                    <select
                                        name="country_code"
                                        value={formData.country_code}
                                        onChange={(e) => {
                                            onChange(e)
                                            if (e.target.value === '') {
                                                setSelectedCountry(null)
                                                return
                                            }
                                            const c = countries.find(x => x.code === e.target.value)
                                            if (c) {
                                                setPhoneCode(c.phone_code)
                                                setEmergencyPhoneCode(c.phone_code)
                                            }
                                        }}
                                        className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 appearance-none relative z-10"
                                    >
                                        <option value="">Selecciona tu país</option>
                                        {countries.map(c => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-20">
                                <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar dirección..."
                                            className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-blue-500 shadow-sm"
                                        />
                                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                                    </div>
                                </Autocomplete>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <input
                                    name="address_street"
                                    placeholder="Calle"
                                    value={formData.address_street}
                                    onChange={onChange}
                                    className="col-span-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none"
                                />
                                <input name="address_number_ext" placeholder="No. Ext" value={formData.address_number_ext} onChange={onChange} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none" />
                                <input name="address_number_int" placeholder="No. Int" value={formData.address_number_int} onChange={onChange} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none" />
                                <input name="address_suburb" placeholder="Colonia" value={formData.address_suburb} onChange={onChange} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none" />
                                <input name="address_postal_code" placeholder="CP" value={formData.address_postal_code} onChange={onChange} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none" />
                                <input name="address_state" placeholder="Estado" value={formData.address_state} onChange={onChange} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none" />
                                <input name="address_country" placeholder="País" value={formData.address_country} onChange={onChange} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none" />

                                <textarea name="address_references" placeholder="Referencias..." value={formData.address_references} onChange={onChange} className="col-span-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none h-24 resize-none" />

                                <div className="col-span-2 flex gap-2">
                                    <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-[10px] font-mono text-gray-500 border border-gray-200 text-center truncate">
                                        Lat: {formData.address_map_lat}
                                    </div>
                                    <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-[10px] font-mono text-gray-500 border border-gray-200 text-center truncate">
                                        Lng: {formData.address_map_lng}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Upload + Map */}
                        <div className="space-y-4">
                            <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0 shadow-sm">
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={{ lat: Number(formData.address_map_lat), lng: Number(formData.address_map_lng) }}
                                    zoom={15}
                                    onLoad={map => { mapRef.current = map }}
                                    options={{ disableDefaultUI: true, zoomControl: true }}
                                >
                                    <MarkerF
                                        position={{ lat: Number(formData.address_map_lat), lng: Number(formData.address_map_lng) }}
                                        draggable={true}
                                        onDragEnd={(e: any) => {
                                            onAddressUpdate({ address_map_lat: e.latLng.lat(), address_map_lng: e.latLng.lng() });
                                        }}
                                    />
                                </GoogleMap>
                            </div>

                            <DocumentUploadCard
                                label="Comprobante Domicilio"
                                url={formData.address_proof_url}
                                signedUrl={signedUrls.address}
                                uploading={uploading === 'address_proof_url'}
                                verified={isVerified}
                                onUpload={(file) => {
                                    const fakeEvent = { target: { files: [file] } } as any
                                    onFileUpload(fakeEvent, 'address_proof_url', 'documents')
                                }}
                                previewText="Subir Comprobante"
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                            <p className="text-[10px] text-zinc-400 italic text-center -mt-2">
                                * Archivos permitidos: JPG, PNG, PDF
                            </p>
                            {isVerified && (
                                <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1 justify-center md:justify-start">
                                    <CheckCircle2 className="h-2 w-2" /> Documento Verificado
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
