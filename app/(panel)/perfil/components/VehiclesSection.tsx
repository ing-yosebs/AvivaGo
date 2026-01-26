'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/supabase/storage'
import { ChevronRight, Loader2, Plus, Check, Camera, Info, Car, Trash2 } from 'lucide-react'

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

            // Destructure to remove frontend-only flags
            const { isCustomBrand, isCustomModel, ...vehicleData } = form

            const { error } = await supabase.from('vehicles').insert({
                driver_profile_id: drvProfile?.id,
                ...vehicleData,
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
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-white appearance-none cursor-pointer"
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
                                        className="w-full mt-2 bg-white/5 border border-blue-500/30 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 animate-in slide-in-from-top-2 duration-300"
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Modelo *</label>
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
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-white appearance-none cursor-pointer"
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
                                                className="w-full mt-2 bg-white/5 border border-blue-500/30 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 animate-in slide-in-from-top-2 duration-300"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <input
                                        value={form.model}
                                        onChange={e => setForm({ ...form, model: e.target.value })}
                                        placeholder={form.isCustomBrand ? "Escribe el modelo" : "Selecciona una marca primero"}
                                        disabled={!form.brand && !form.isCustomBrand}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                    />
                                )}
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
                            <button
                                onClick={() => handleDelete(v.id)}
                                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
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
