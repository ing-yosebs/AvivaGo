import { GoogleMap, useJsApiLoader, Autocomplete, MarkerF } from '@react-google-maps/api'
import { MapPin, Search, FileText, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = ['places']

interface AddressSectionProps {
    formData: any
    onChange: (e: any) => void
    onUpdate: (updates: any) => void
}

export function AddressSection({ formData, onChange, onUpdate }: AddressSectionProps) {
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

            onUpdate({
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

                        if (Math.abs(newLat - formData.address_map_lat) > 0.0001 || Math.abs(newLng - formData.address_map_lng) > 0.0001) {
                            onUpdate({
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
        <div className="md:col-span-2 space-y-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Dirección de Residencia Actual
            </h4>

            {/* OCR Address Display */}
            {formData.address_text && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h5 className="text-[10px] font-bold uppercase text-blue-600 mb-1">Dirección Extraída de ID</h5>
                        <p className="text-sm text-blue-900 font-medium">{formData.address_text}</p>
                        <p className="text-[10px] text-blue-400 mt-1 italic">Esta es la dirección tal cual aparece en tu documento. Por favor, confirma tu dirección actual abajo.</p>
                    </div>
                </div>
            )}

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
                                        className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-blue-500"
                                    />
                                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                                </div>
                            </Autocomplete>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Calle *</label>
                                <input
                                    name="address_street"
                                    value={formData.address_street}
                                    onChange={onChange}
                                    className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">No. Exterior *</label>
                                <input name="address_number_ext" value={formData.address_number_ext} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">No. Interior</label>
                                <input name="address_number_int" value={formData.address_number_int} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Alcaldía / Municipio *</label>
                                <input name="address_suburb" value={formData.address_suburb} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Código Postal *</label>
                                <input name="address_postal_code" value={formData.address_postal_code} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Estado *</label>
                                <input name="address_state" value={formData.address_state} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">País *</label>
                                <input name="address_country" value={formData.address_country} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Referencias</label>
                            <textarea name="address_references" value={formData.address_references} onChange={onChange} placeholder="Ej. Casa portón negro, frente a parque..." className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 min-h-[80px]" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="h-[400px] rounded-3xl overflow-hidden border border-gray-200 shadow-soft">
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={{ lat: Number(formData.address_map_lat), lng: Number(formData.address_map_lng) }}
                                zoom={15}
                                onLoad={map => { mapRef.current = map }}
                                options={{
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
                                        onUpdate({ address_map_lat: lat, address_map_lng: lng });
                                    }}
                                />
                            </GoogleMap>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white border border-gray-100 rounded-xl">
                                <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Latitud</p>
                                <p className="text-xs font-mono text-blue-600">{formData.address_map_lat}</p>
                            </div>
                            <div className="p-3 bg-white border border-gray-100 rounded-xl">
                                <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Longitud</p>
                                <p className="text-xs font-mono text-blue-600">{formData.address_map_lng}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-[400px] bg-gray-50 rounded-3xl flex items-center justify-center border border-dashed border-gray-200">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            )}
        </div>
    )
}
