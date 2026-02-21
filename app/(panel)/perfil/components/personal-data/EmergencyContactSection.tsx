import { AlertCircle } from 'lucide-react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface EmergencyContactSectionProps {
    formData: any
    onChange: (e: any) => void
    emergencyPhoneCode: string
    setEmergencyPhoneCode: (code: string) => void
}

export function EmergencyContactSection({
    formData,
    onChange,
    emergencyPhoneCode,
    setEmergencyPhoneCode
}: EmergencyContactSectionProps) {
    return (
        <div className="space-y-4 md:col-span-2 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="h-3 w-3" /> Contacto de Emergencia
            </h4>
            <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Nombre Completo</label>
                        <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Parentesco</label>
                        <input name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500" />
                    </div>
                </div>
                <div className="space-y-2 md:w-1/2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Teléfono</label>
                    <div className="flex gap-1 w-full">
                        <div className="phone-input-container !w-fit group relative h-[42px]">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 pl-10 pr-1 text-base md:text-xs text-zinc-500 font-mono">
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
    )
}
