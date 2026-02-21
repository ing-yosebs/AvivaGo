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

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Correo Electrónico *</label>
                <div className="relative">
                    <input
                        value={formData.email}
                        readOnly
                        disabled
                        placeholder="Agrega tu correo electrónico"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-2.5 focus:outline-none cursor-not-allowed"
                    />
                    <button
                        onClick={onOpenEmailModal}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                        {formData.email ? 'Cambiar' : 'Agregar'}
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 italic">Validado y protegido. Para cambiarlo requieres verificación.</p>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Teléfono de contacto (WhatsApp) *</label>
                <div className="flex gap-1 relative">
                    <div className="phone-input-container !w-fit group relative h-[46px] opacity-70 pointer-events-none">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 pl-10 pr-1 text-base md:text-sm text-gray-500 font-mono">
                            +{phoneCode}
                        </div>
                        <PhoneInput
                            country={'mx'}
                            value={phoneCode}
                            containerClass="!w-[90px] !h-full"
                            inputClass="!hidden"
                            buttonClass="!bg-gray-50 !border-gray-200 !rounded-xl !h-full !w-full !static !flex !items-center !justify-start !px-3"
                            dropdownClass="!hidden"
                            specialLabel=""
                        />
                    </div>

                    <input
                        value={formData.phone_number}
                        readOnly
                        disabled
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl h-[46px] px-4 outline-none text-gray-500 font-mono text-base md:text-sm cursor-not-allowed"
                    />

                    <button
                        onClick={onOpenPhoneModal}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                        Cambiar
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 italic">Por seguridad, para cambiar tu número debes verificar el nuevo celular.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
