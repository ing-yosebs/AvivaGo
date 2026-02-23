import { User, Shield, ChevronDown } from 'lucide-react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface BasicInfoSectionProps {
    formData: any
    profile: any
    countries: any[]
    phoneCode: string
    setPhoneCode: (code: string) => void
    setEmergencyPhoneCode: (code: string) => void
    onChange: (e: any) => void
    onOpenPhoneModal: () => void
    onOpenEmailModal: () => void
    setSelectedCountry: (country: any) => void
}

export function BasicInfoSection({
    formData,
    profile,
    countries,
    phoneCode,
    setPhoneCode,
    setEmergencyPhoneCode,
    onChange,
    onOpenPhoneModal,
    onOpenEmailModal,
    setSelectedCountry
}: BasicInfoSectionProps) {
    const isVerified = !!profile?.driver_profile?.verified_at

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" /> Información Básica
            </h4>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Nombre Completo *</label>
                <div className="relative">
                    <input
                        name="full_name"
                        value={formData.full_name}
                        onChange={onChange}
                        readOnly={isVerified}
                        className={`w-full border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 ${isVerified ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'bg-white'}`}
                    />
                    {isVerified && (
                        <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 opacity-50" />
                    )}
                </div>
            </div>

            {/* Country Selector */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">País de Operación *</label>
                <div className="relative">
                    <select
                        name="country_code"
                        value={formData.country_code}
                        disabled
                        className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-2.5 appearance-none relative z-10 cursor-not-allowed opacity-75"
                    >
                        <option value="">Detectando país...</option>
                        {countries.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                        <Shield className="h-4 w-4 text-gray-300" />
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 italic">Este valor se asigna automáticamente basado en el teléfono con el que te registraste.</p>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Correo Electrónico *</label>
                <div className="flex items-center gap-3 min-h-[46px] px-4 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-sm text-gray-500 truncate flex-1">{formData.email || 'Sin correo'}</span>
                    <button
                        onClick={onOpenEmailModal}
                        className="shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                        {formData.email ? 'Cambiar' : 'Agregar'}
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 italic">Validado y protegido. Para cambiarlo requieres verificación.</p>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Teléfono de contacto (WhatsApp) *</label>
                <div className="flex items-center gap-2 min-h-[46px] p-1 px-2 bg-gray-50 rounded-xl border border-gray-200">
                    {/* Country selector display */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-white/50 px-2 py-1 rounded-lg border border-gray-100/50 opacity-70">
                        <div className="pointer-events-none scale-90 origin-left">
                            <PhoneInput
                                country={formData.country_code?.toLowerCase() || 'mx'}
                                value={phoneCode}
                                containerClass="!w-fit"
                                inputClass="!hidden"
                                buttonClass="!bg-transparent !border-none !p-0 !h-auto !static"
                                dropdownClass="!hidden"
                                specialLabel=""
                            />
                        </div>
                        <span className="text-xs font-mono text-gray-500">+{phoneCode}</span>
                    </div>

                    {/* Phone number */}
                    <span className="flex-1 text-sm font-mono text-gray-600 truncate px-1">
                        {formData.phone_number}
                    </span>

                    {/* Action button */}
                    <button
                        onClick={onOpenPhoneModal}
                        className="shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                        Cambiar
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 italic">Por seguridad, para cambiar tu número debes verificar el nuevo celular.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Fecha de Nacimiento</label>
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
                        {isVerified && (
                            <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 opacity-50" />
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Nacionalidad *</label>
                    <div className="relative">
                        <input
                            name="nationality"
                            value={formData.nationality}
                            onChange={onChange}
                            readOnly={isVerified}
                            className={`w-full border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 ${isVerified ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'bg-white'}`}
                        />
                        {isVerified && (
                            <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 opacity-50" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
