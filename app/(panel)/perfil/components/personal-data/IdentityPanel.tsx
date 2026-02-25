import { User, Shield, CheckCircle2, FileText, Mail, ChevronDown, Pencil, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { AvatarUploader } from './AvatarUploader'
import { DocumentUploadCard } from './DocumentUploadCard'
import { useState, useRef } from 'react'

interface IdentityPanelProps {
    formData: any
    profile: any
    phoneCode: string
    onAvatarUpload: (file: File) => Promise<void>
    onFileUpload: (e: any, field: string, bucket: string) => void
    onChange: (e: any) => void
    onOpenPhoneModal: () => void
    onOpenEmailModal: () => void
    uploading: string | null
    signedUrls: { id: string | null, idBack: string | null, address: string | null }
    selectedCountry: any
    hasMembership?: boolean
    isDriver?: boolean
}

export function IdentityPanel({
    formData,
    profile,
    phoneCode,
    onAvatarUpload,
    onFileUpload,
    onChange,
    onOpenPhoneModal,
    onOpenEmailModal,
    uploading,
    signedUrls,
    selectedCountry,
    hasMembership,
    isDriver
}: IdentityPanelProps) {
    const router = useRouter()
    const isVerified = !!profile?.driver_profile?.verified_at

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-8">
            {/* Header: Avatar, Name & Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-b border-gray-100 pb-8">
                {/* Left Column: Profile Info */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left transition-all">
                    <div className="relative group shrink-0">
                        <AvatarUploader
                            avatarUrl={formData.avatar_url}
                            onUpload={onAvatarUpload}
                            uploading={uploading === 'avatar_url'}
                            readOnly={isVerified}
                        />
                    </div>
                    <div className="w-full">
                        <h3 className="font-bold text-lg text-[#0F2137]">{formData.full_name || 'Nuevo Usuario'}</h3>
                        <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                            {profile?.roles?.includes('admin') && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold border border-purple-200 uppercase tracking-wider flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> Admin
                                </span>
                            )}
                            {profile?.roles?.includes('driver') ? (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold border border-blue-200 uppercase tracking-wider flex items-center gap-1">
                                    <User className="h-3 w-3" /> Conductor
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                                    <User className="h-3 w-3" /> Pasajero
                                </span>
                            )}
                            {profile?.driver_profile?.verified_at && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-[10px] font-bold border border-green-200 uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Verificado
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Identity Status Message */}
                <div className="w-full max-w-md mx-auto md:ml-auto md:mr-0">
                    {isVerified ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm border-l-4 border-l-emerald-500">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Identidad Verificada</h5>
                                <p className="text-xs text-emerald-900 leading-relaxed font-medium">Toda tu información de identidad ha sido validada exitosamente.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-4 shadow-sm border-l-4 border-l-amber-500">
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="text-[10px] font-bold uppercase text-amber-600 mb-1">
                                        Identidad no verificada
                                    </h5>
                                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                                        {isDriver && !hasMembership
                                            ? "Activa tu membresía para verificar tu identidad y ser visible en el catálogo público. Mientras tanto, úsala de forma interna con tus conocidos."
                                            : "Verifica tu identidad para poder contactar a conductores de tu interés. Mientras tanto, solo podrás contactar al conductor que te invitó."}
                                    </p>
                                </div>
                            </div>

                            {/* Solo mostrar el botón si es pasajero o si es conductor CON membresía */}
                            {(!isDriver || hasMembership) && (
                                <button
                                    onClick={() => router.push('/verify-id')}
                                    className="w-full py-3 bg-[#0F2137] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#0F2137]/90 transition-all shadow-lg shadow-[#0F2137]/20 active:scale-[0.98]"
                                >
                                    Iniciar Verificación
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info Column */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Correo Electrónico</label>
                            <button
                                onClick={onOpenEmailModal}
                                className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors uppercase tracking-tight"
                            >
                                <Pencil className="h-2.5 w-2.5" />
                                {formData.email ? 'Cambiar' : 'Agregar'}
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="flex items-center gap-3 h-[46px] px-4 bg-gray-50 rounded-xl border border-gray-200 relative overflow-hidden">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600 flex-1 min-w-0 break-all">{formData.email || 'Sin correo'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Teléfono (WhatsApp)</label>
                            <button
                                onClick={onOpenPhoneModal}
                                className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors uppercase tracking-tight"
                            >
                                <Pencil className="h-2.5 w-2.5" />
                                Cambiar
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="flex items-center gap-2 min-h-[46px] px-4 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                {/* Country selector display */}
                                <div className="flex items-center gap-1.5 shrink-0 opacity-70">
                                    <div className="pointer-events-none scale-90 origin-left">
                                        <PhoneInput
                                            country={'mx'}
                                            value={phoneCode}
                                            containerClass="!w-fit"
                                            inputClass="!hidden"
                                            buttonClass="!bg-transparent !border-none !p-0 !h-auto !static"
                                            dropdownClass="!hidden"
                                            specialLabel=""
                                        />
                                    </div>
                                    <span className="text-sm font-mono text-gray-500">+{phoneCode}</span>
                                </div>

                                {/* Phone number */}
                                <span className="flex-1 text-sm font-mono text-gray-600 min-w-0 break-all">
                                    {formData.phone_number}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Fecha Nacimiento</label>
                            <div className="relative">
                                {isVerified ? (
                                    <input
                                        readOnly
                                        value={formData.birthday ? formData.birthday.split('-').reverse().join('/') : ''}
                                        className="w-full border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 bg-gray-50 cursor-not-allowed opacity-70 font-mono"
                                    />
                                ) : (
                                    <input
                                        name="birthday"
                                        type="date"
                                        value={formData.birthday}
                                        onChange={onChange}
                                        className="w-full border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 bg-white"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Nacionalidad</label>
                            <input
                                name="nationality"
                                value={formData.nationality}
                                onChange={onChange}
                                readOnly={isVerified}
                                className={`w-full border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 ${isVerified ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'bg-white'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Docs Column */}
                {/* Docs Column */}
                <div className="space-y-6">

                    {/* ID / CURP */}
                    {isVerified && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500">
                                {selectedCountry?.id_label || 'ID Nacional / CURP'} *
                            </label>
                            <div className="relative">
                                <input
                                    name="curp"
                                    value={formData.curp}
                                    readOnly
                                    placeholder="Se completará mediante validación"
                                    className="w-full border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 bg-gray-50 cursor-not-allowed opacity-70 font-mono focus:outline-none"
                                />
                                <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 opacity-50 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Document Cards (Only if they exist) */}
                    {(formData.id_document_url || formData.id_document_back_url) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {formData.id_document_url && (
                                <DocumentUploadCard
                                    label="ID (Frente)"
                                    url={formData.id_document_url}
                                    signedUrl={signedUrls.id}
                                    uploading={false}
                                    verified={true}
                                    onUpload={() => { }}
                                    previewText="Frontal"
                                />
                            )}
                            {formData.id_document_back_url && (
                                <DocumentUploadCard
                                    label="ID (Reverso)"
                                    url={formData.id_document_back_url}
                                    signedUrl={signedUrls.idBack}
                                    uploading={false}
                                    verified={true}
                                    onUpload={() => { }}
                                    previewText="Reverso"
                                />
                            )}
                        </div>
                    )}

                    {/* Extracted Address (Only if verified) */}
                    {isVerified && formData.address_text && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                            <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-[10px] font-bold uppercase text-blue-600 mb-1">Dirección Extraída de ID</h5>
                                <p className="text-sm text-blue-900 font-medium leading-relaxed">{formData.address_text}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 mt-4">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Nivel Educativo</label>
                        <div className="relative">
                            <select
                                name="education_level"
                                value={formData.education_level}
                                onChange={onChange}
                                className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 appearance-none pr-10"
                            >
                                <option value="">Seleccionar...</option>
                                {[
                                    { value: 'Ninguno', label: 'Ninguno' },
                                    { value: 'Primaria', label: 'Primaria' },
                                    { value: 'Secundaria', label: 'Secundaria' },
                                    { value: 'Medio superior', label: 'Medio superior' },
                                    { value: 'Superior', label: 'Superior (Licenciatura, Ingeniería)' },
                                    { value: 'Maestría', label: 'Maestría' },
                                    { value: 'Doctorado', label: 'Doctorado' }
                                ].map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
