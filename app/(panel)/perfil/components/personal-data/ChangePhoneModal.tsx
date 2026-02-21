import { useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, X, Shield } from 'lucide-react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface ChangePhoneModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (code: string, number: string) => void
}

export function ChangePhoneModal({ isOpen, onClose, onSuccess }: ChangePhoneModalProps) {
    const [newPhoneCode, setNewPhoneCode] = useState('52')
    const [newPhoneNumber, setNewPhoneNumber] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [verifyStep, setVerifyStep] = useState<'input' | 'verify'>('input')
    const [verifyLoading, setVerifyLoading] = useState(false)
    const [verifyError, setVerifyError] = useState<string | null>(null)
    const [verifySuccess, setVerifySuccess] = useState(false)

    const handleSendCode = async () => {
        setVerifyLoading(true)
        setVerifyError(null)
        try {
            const fullPhone = `+${newPhoneCode}${newPhoneNumber}`
            const res = await fetch('/api/user/change-phone/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPhone: fullPhone })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al enviar código')

            setVerifyStep('verify')
        } catch (error: any) {
            setVerifyError(error.message)
        } finally {
            setVerifyLoading(false)
        }
    }

    const handleVerifyCode = async () => {
        setVerifyLoading(true)
        setVerifyError(null)
        try {
            const fullPhone = `+${newPhoneCode}${newPhoneNumber}`
            const res = await fetch('/api/user/change-phone/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPhone: fullPhone, code: otpCode })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al verificar')

            setVerifySuccess(true)
            onSuccess(newPhoneCode, newPhoneNumber)

            setTimeout(() => {
                onClose()
                setVerifySuccess(false)
                setVerifyStep('input')
                setNewPhoneNumber('')
                setOtpCode('')
            }, 2000)

        } catch (error: any) {
            setVerifyError(error.message)
        } finally {
            setVerifyLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-[#0F2137]">Actualizar Teléfono</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {verifySuccess ? (
                        <div className="text-center space-y-4 py-8">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-[#0F2137]">¡Actualizado!</h4>
                                <p className="text-gray-500 text-sm">Tu número de teléfono ha sido cambiado correctamente.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
                                <Shield className="h-5 w-5 shrink-0" />
                                <p>Por seguridad, enviaremos un código de verificación a tu <strong>nuevo</strong> número de WhatsApp.</p>
                            </div>

                            {verifyStep === 'input' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500">Nuevo Número Celular</label>
                                        <div className="flex gap-2">
                                            <div className="phone-input-container !w-fit group relative h-[50px]">
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 pl-10 pr-1 text-sm text-gray-500 font-mono">
                                                    +{newPhoneCode}
                                                </div>
                                                <PhoneInput
                                                    country={'mx'}
                                                    value={newPhoneCode}
                                                    onChange={(val, country: any) => setNewPhoneCode(country.dialCode)}
                                                    containerClass="!w-[90px] !h-full"
                                                    inputClass="!hidden"
                                                    buttonClass="!bg-white !border-gray-200 !rounded-xl !h-full !w-full !static !flex !items-center !justify-start !px-3 hover:!bg-gray-50"
                                                    dropdownClass="!bg-white !text-[#0F2137] !border-gray-200 !rounded-xl"
                                                    specialLabel=""
                                                />
                                            </div>
                                            <input
                                                value={newPhoneNumber}
                                                onChange={(e) => setNewPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                                placeholder="1234567890"
                                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 text-lg font-mono outline-none focus:border-blue-500 transition-all"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSendCode}
                                        disabled={verifyLoading || newPhoneNumber.length < 10}
                                        className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {verifyLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar Código'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500">Código de Verificación</label>
                                        <input
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] outline-none focus:border-blue-500 transition-all"
                                            autoFocus
                                        />
                                        <p className="text-center text-xs text-gray-400">Enviado a +{newPhoneCode} {newPhoneNumber}</p>
                                    </div>
                                    <button
                                        onClick={handleVerifyCode}
                                        disabled={verifyLoading || otpCode.length < 6}
                                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        {verifyLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verificar y Actualizar'}
                                    </button>
                                    <button
                                        onClick={() => setVerifyStep('input')}
                                        className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
                                    >
                                        Cambiar número
                                    </button>
                                </div>
                            )}

                            {verifyError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {verifyError}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
