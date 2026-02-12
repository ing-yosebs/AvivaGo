'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/supabase/storage'

import { ChevronRight, Loader2, Plus, Check, Camera, Info, Car, Trash2, FileText, CheckCircle2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'

export default function VehiclesSection({ vehicles, onAdd }: any) {
    const supabase = createClient()
    const [isAdding, setIsAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState<string | null>(null)

    // Hidden refs for all vehicle document and photo uploads
    const vinPhotoRef = useRef<HTMLInputElement>(null)
    const invoiceRef = useRef<HTMLInputElement>(null)
    const verificationRef = useRef<HTMLInputElement>(null)
    const insuranceRef = useRef<HTMLInputElement>(null)
    const platePhotoRef = useRef<HTMLInputElement>(null)
    const circulationCardRef = useRef<HTMLInputElement>(null)
    const photoRefs = useRef<(HTMLInputElement | null)[]>([])

    const carBrands: Record<string, string[]> = {
        'Toyota': ['Camry', 'Corolla', 'RAV4', 'Hilux', 'Yaris', 'Prius', 'Avanza'],
        'Nissan': ['Sentra', 'Versa', 'March', 'Altima', 'Kicks', 'X-Trail', 'NP300'],
        'Chevrolet': ['Aveo', 'Onix', 'Cavalier', 'Captiva', 'Tracker', 'S10', 'Silverado'],
        'Volkswagen': ['Jetta', 'Vento', 'Polo', 'Tiguan', 'Taos', 'Virtus', 'Gol'],
        'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'City', 'Fit'],
        'Kia': ['Rio', 'Forte', 'Sportage', 'Seltos', 'Soul', 'Optima'],
        'Hyundai': ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'Grand i10'],
        'Mazda': ['Mazda 3', 'Mazda 2', 'CX-5', 'CX-3', 'CX-30', 'MX-5'],
        'Ford': ['Figo', 'Focus', 'Fusion', 'Escape', 'Explorer', 'Ranger', 'F-150'],
        'BMW': ['Serie 3', 'Serie 1', 'X3', 'X1', 'Serie 5', 'X5'],
        'Mercedes-Benz': ['Clase C', 'Clase A', 'GLA', 'GLC', 'Clase E', 'GLE'],
        'Audi': ['A4', 'A3', 'Q5', 'Q3', 'A1', 'Q7'],
        'Suzuki': ['Swift', 'Ignis', 'Ertiga', 'Vitara', 'Jimny'],
        'MG': ['ZS', 'MG5', 'HS', 'RX5'],
        'Cupra': ['Formentor', 'Leon', 'Ateca']
    }

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
        plate_photo_url: '',
        circulation_card_url: '',
        photos: [], // Array of 6 photo URLs
        passenger_capacity: 4,
        trunk_capacity: ''
    })

    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
    const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>({})

    useEffect(() => {
        const documentsToSign = [
            'plate_photo_url', 'circulation_card_url', 'invoice_url',
            'verification_url', 'insurance_policy_url', 'vin_photo_url'
        ]

        const signUrls = async () => {
            const newSignedUrls: Record<string, string | null> = {}

            await Promise.all(documentsToSign.map(async (key) => {
                const url = form[key]
                if (!url) {
                    newSignedUrls[key] = null
                    return
                }

                try {
                    if (url.includes('/storage/v1/object/public/vehicles/')) {
                        const path = url.split('/vehicles/')[1]
                        if (path) {
                            const { data } = await supabase.storage.from('vehicles').createSignedUrl(path, 3600)
                            if (data?.signedUrl) {
                                newSignedUrls[key] = data.signedUrl
                                return
                            }
                        }
                    }
                    newSignedUrls[key] = url
                } catch {
                    newSignedUrls[key] = url
                }
            }))

            setSignedUrls(prev => ({ ...prev, ...newSignedUrls }))
        }

        signUrls()
    }, [form.plate_photo_url, form.circulation_card_url, form.invoice_url, form.verification_url, form.insurance_policy_url, form.vin_photo_url])

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, field: string, isPhotoArray: boolean = false, index: number = 0) => {
        const originalFile = e.target.files?.[0]
        if (!originalFile) return

        // Validación de PDF (Max 5MB)
        if (originalFile.type === 'application/pdf') {
            if (originalFile.size > 5 * 1024 * 1024) {
                alert('El documento PDF es demasiado grande. El tamaño máximo permitido es de 5MB.')
                return
            }
        }

        setUploading(field === 'photos' ? `photos-${index}` : field)

        let fileToUpload = originalFile

        try {
            // Compresión de Imágenes
            if (originalFile.type.startsWith('image/')) {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                }
                try {
                    const compressedFile = await imageCompression(originalFile, options)
                    fileToUpload = compressedFile
                } catch (error) {
                    console.error('Error al comprimir imagen, se usará la original:', error)
                }
            }

            const { data: { user } } = await supabase.auth.getUser()
            const path = `${user?.id}/vehicles/${Date.now()}_${fileToUpload.name}`
            const url = await uploadFile('vehicles', path, fileToUpload)

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



    const resetForm = () => {
        setForm({
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
            plate_photo_url: '',
            circulation_card_url: '',
            photos: [],
            passenger_capacity: 4,
            trunk_capacity: ''
        })
        setSelectedVehicleId(null)
        setIsAdding(false)
    }

    const handleEdit = (vehicle: any) => {
        // Determine if brand/model is custom
        const isCustomBrand = !carBrands[vehicle.brand]
        const isCustomModel = !isCustomBrand && !carBrands[vehicle.brand]?.includes(vehicle.model)

        setForm({
            ...vehicle,
            isCustomBrand,
            isCustomModel
        })
        setSelectedVehicleId(vehicle.id)
        setIsAdding(true)
    }

    const handleRegister = async () => {
        // Validation: Required Text Fields
        if (!form.brand || !form.model || !form.color || !form.year || !form.plate_number ||
            !form.passenger_capacity || !form.trunk_capacity || !form.registration_state || !form.vin_number) {
            alert('Por favor completa todos los campos de texto obligatorios (marcados con *).')
            return
        }

        // Validation: Required Documents
        if (!form.plate_photo_url || !form.circulation_card_url || !form.verification_url || !form.vin_photo_url) {
            alert('Por favor sube todas las fotos de documentos obligatorias (Placa, Tarjeta Circulación, Verificación, Foto NIV).')
            return
        }

        // Validation: Required Vehicle Photos (All 6)
        const uploadedPhotos = form.photos.filter((p: string) => p && p.length > 0)
        if (uploadedPhotos.length < 6) {
            alert('Por favor sube las 6 fotos obligatorias del vehículo.')
            return
        }

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Destructure to remove frontend-only flags
            const { isCustomBrand, isCustomModel, created_at, id, ...vehicleData } = form

            if (selectedVehicleId) {
                // UPDATE existing vehicle
                const { error } = await supabase
                    .from('vehicles')
                    .update(vehicleData)
                    .eq('id', selectedVehicleId)

                if (error) throw error
            } else {
                // CREATE new vehicle
                const { data: drvProfile } = await supabase.from('driver_profiles').select('id').eq('user_id', user?.id).single()

                const { error } = await supabase.from('vehicles').insert({
                    driver_profile_id: drvProfile?.id,
                    ...vehicleData,
                    status: 'pending'
                })

                if (error) throw error
            }

            resetForm()
            onAdd() // Refresh list
        } catch (error: any) {
            alert('Error al guardar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) return

        try {
            const { error } = await supabase.from('vehicles').delete().eq('id', id)
            if (error) throw error
            onAdd() // Refresh list
        } catch (error: any) {
            alert('Error al eliminar: ' + error.message)
        }
    }

    if (isAdding) {
        return (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <ChevronRight className="h-6 w-6 rotate-180" />
                    </button>
                    <h3 className="text-xl font-bold text-[#0F2137]">{selectedVehicleId ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Marca *</label>
                                <select
                                    value={form.brand === 'Otra' ? 'Otra' : (carBrands[form.brand] ? form.brand : (form.brand ? 'Otra' : ''))}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === 'Otra') {
                                            setForm({ ...form, brand: '', model: '', isCustomBrand: true });
                                        } else {
                                            setForm({ ...form, brand: val, model: '', isCustomBrand: false });
                                        }
                                    }}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-[#0F2137] appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Selecciona una marca</option>
                                    {Object.keys(carBrands).sort().map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                    <option value="Otra">Otra marca...</option>
                                </select>
                                {form.isCustomBrand && (
                                    <input
                                        value={form.brand}
                                        onChange={e => setForm({ ...form, brand: e.target.value })}
                                        placeholder="Especifica la marca"
                                        className="w-full mt-2 bg-white border border-blue-500/30 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 animate-in slide-in-from-top-2 duration-300 text-[#0F2137]"
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Modelo *</label>
                                {!form.isCustomBrand && carBrands[form.brand] ? (
                                    <>
                                        <select
                                            value={form.isCustomModel ? 'Otro' : form.model}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val === 'Otro') {
                                                    setForm({ ...form, model: '', isCustomModel: true });
                                                } else {
                                                    setForm({ ...form, model: val, isCustomModel: false });
                                                }
                                            }}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-[#0F2137] appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Selecciona un modelo</option>
                                            {carBrands[form.brand]?.sort().map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                            <option value="Otro">Otro modelo...</option>
                                        </select>
                                        {form.isCustomModel && (
                                            <input
                                                value={form.model}
                                                onChange={e => setForm({ ...form, model: e.target.value })}
                                                placeholder="Especifica el modelo"
                                                className="w-full mt-2 bg-white border border-blue-500/30 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 animate-in slide-in-from-top-2 duration-300 text-[#0F2137]"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <input
                                        value={form.model}
                                        onChange={e => setForm({ ...form, model: e.target.value })}
                                        placeholder={form.isCustomBrand ? "Escribe el modelo" : "Selecciona una marca primero"}
                                        disabled={!form.brand && !form.isCustomBrand}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 disabled:opacity-50 text-[#0F2137]"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Color *</label>
                                <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-[#0F2137]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Año *</label>
                                <input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-[#0F2137]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Placas *</label>
                                <input value={form.plate_number} onChange={e => setForm({ ...form, plate_number: e.target.value })} placeholder="ABC-1234" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 font-mono text-[#0F2137]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Capacidad Pasajeros *</label>
                                <input type="number" min="1" value={form.passenger_capacity || 4} onChange={e => setForm({ ...form, passenger_capacity: parseInt(e.target.value) })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-[#0F2137]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Capacidad Cajuela *</label>
                                <input value={form.trunk_capacity || ''} onChange={e => setForm({ ...form, trunk_capacity: e.target.value })} placeholder="Ej: 2 maletas grandes" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-[#0F2137]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Entidad de Registro *</label>
                                <input value={form.registration_state} onChange={e => setForm({ ...form, registration_state: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-[#0F2137]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Número NIV (VIN) *</label>
                                <input value={form.vin_number} onChange={e => setForm({ ...form, vin_number: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 font-mono text-[#0F2137]" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Documentación del Auto</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: 'plate_photo_url', label: 'Foto Placa *', ref: platePhotoRef },
                                    { id: 'circulation_card_url', label: 'Tarjeta Circulación *', ref: circulationCardRef },
                                    { id: 'verification_url', label: 'Verificación *', ref: verificationRef },
                                    { id: 'vin_photo_url', label: 'Foto NIV *', ref: vinPhotoRef },
                                    { id: 'invoice_url', label: 'Factura (Opcional)', ref: invoiceRef },
                                    { id: 'insurance_policy_url', label: 'Póliza Seguro (Opcional)', ref: insuranceRef },
                                ].map(doc => (
                                    <div key={doc.id} className="space-y-2">
                                        <input
                                            type="file"
                                            ref={doc.ref}
                                            className="hidden"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => handleFile(e, doc.id)}
                                        />
                                        <div
                                            onClick={() => doc.ref.current?.click()}
                                            className={`cursor-pointer group relative aspect-video w-full rounded-xl overflow-hidden border border-dashed transition-all bg-gray-50 flex flex-col items-center justify-center ${form[doc.id] ? 'border-emerald-500/30' : 'border-gray-200 hover:border-blue-500'}`}
                                        >
                                            {uploading === doc.id ? (
                                                <div className="flex flex-col items-center justify-center text-zinc-500">
                                                    <Loader2 className="h-6 w-6 animate-spin mb-2 text-blue-500" />
                                                    <span className="text-[10px]">Subiendo...</span>
                                                </div>
                                            ) : signedUrls[doc.id] ? (
                                                <>
                                                    {signedUrls[doc.id]?.toLowerCase().includes('.pdf') ? (
                                                        <div className="flex flex-col items-center justify-center text-zinc-400 group-hover:text-blue-400 transition-colors">
                                                            <FileText className="h-10 w-10 mb-2" />
                                                            <span className="text-[10px] font-medium">Documento PDF</span>
                                                        </div>
                                                    ) : (
                                                        <img src={signedUrls[doc.id] || ''} alt={doc.label} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
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
                                                <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                                                    <Plus className="h-6 w-6 mb-2" />
                                                    <span className="text-[10px]">{doc.label}</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Label below the card for clarity */}
                                        <p className="text-[10px] font-bold uppercase text-gray-500 text-center">{doc.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Fotos del Vehículo (6)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {['Frente *', 'Trasera *', 'Lateral *', 'Interior 1 *', 'Interior 2 *', 'Interior 3 *'].map((label, idx) => (
                                <div key={label}>
                                    <input
                                        type="file"
                                        ref={el => { photoRefs.current[idx] = el }}
                                        className="hidden"
                                        onChange={(e) => handleFile(e, 'photos', true, idx)}
                                    />
                                    <button
                                        onClick={() => photoRefs.current[idx]?.click()}
                                        className="relative w-full aspect-video bg-gray-50 border border-gray-200 rounded-xl overflow-hidden group cursor-pointer hover:border-blue-500"
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
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                            <div className="flex gap-2 text-blue-600 mb-1">
                                <Info className="h-4 w-4 shrink-0" />
                                <span className="text-[10px] font-bold uppercase">Recomendación</span>
                            </div>
                            <p className="text-[10px] text-gray-600 leading-relaxed">
                                Sube fotos claras con buena iluminación. Un vehículo bien presentado atrae 3x más clientes.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-100 pt-8">
                    <button onClick={resetForm} className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button
                        onClick={handleRegister}
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : (selectedVehicleId ? 'Guardar Cambios' : 'Registrar Vehículo')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-[#0F2137]">Mis Vehículos registrados</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"
                >
                    <Plus className="h-4 w-4" />
                    Agregar Vehículo
                </button>
            </div>

            {vehicles?.length > 0 ? (
                <div className="space-y-4">
                    {vehicles?.map((v: any) => (
                        <div
                            key={v.id}
                            onClick={() => handleEdit(v)}
                            className="bg-white border border-gray-100 rounded-3xl p-6 relative group hover:border-blue-300 hover:shadow-soft transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                                    <Car className="h-6 w-6" />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold truncate text-[#0F2137] text-lg">{v.brand} {v.model}</h4>
                                    <p className="text-gray-500 text-sm">
                                        {v.year} • {v.color} • {v.passenger_capacity || 4} Pasajeros
                                    </p>
                                    {v.trunk_capacity && (
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <span className="font-semibold">Cajuela:</span> {v.trunk_capacity}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0 pl-[4.5rem] md:pl-0">
                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-mono text-gray-500 font-bold border border-gray-200">
                                    {v.plate_number}
                                </span>
                                <div className="p-2 bg-gray-50 rounded-full text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    handleDelete(v.id);
                                }}
                                className="absolute top-4 right-4 md:static p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tienes vehículos registrados todavía.</p>
                </div>
            )}
        </div>
    )
}
