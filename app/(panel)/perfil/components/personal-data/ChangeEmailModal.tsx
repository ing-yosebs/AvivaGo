import { useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, X, Mail } from 'lucide-react'

interface ChangeEmailModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (newEmail: string) => void
}

export function ChangeEmailModal({ isOpen, onClose, onSuccess }: ChangeEmailModalProps) {
    const [newEmail, setNewEmail] = useState('')
    const [emailOtpCode, setEmailOtpCode] = useState('')
    const [verifyEmailStep, setVerifyEmailStep] = useState<'input' | 'verify'>('input')
    const [verifyEmailLoading, setVerifyEmailLoading] = useState(false)
    const [verifyEmailError, setVerifyEmailError] = useState<string | null>(null)
    const [verifyEmailSuccess, setVerifyEmailSuccess] = useState(false)

    const handleSendEmailCode = async () => {
        setVerifyEmailLoading(true)
        setVerifyEmailError(null)
        try {
            const res = await fetch('/api/user/change-email/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al enviar código')

            setVerifyEmailStep('verify')
        } catch (error: any) {
            setVerifyEmailError(error.message)
        } finally {
            setVerifyEmailLoading(false)
        }
    }

    const handleVerifyEmailCode = async () => {
        setVerifyEmailLoading(true)
        setVerifyEmailError(null)
        try {
            const res = await fetch('/api/user/change-email/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail, code: emailOtpCode })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al verificar')

            setVerifyEmailSuccess(true)
            onSuccess(newEmail)

            setTimeout(() => {
                onClose()
                setVerifyEmailSuccess(false)
                setVerifyEmailStep('input')
                setNewEmail('')
                setEmailOtpCode('')
            }, 2000)

        } catch (error: any) {
            setVerifyEmailError(error.message)
        } finally {
            setVerifyEmailLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-[#0F2137]">Actualizar Correo</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {verifyEmailSuccess ? (
                        <div className="text-center space-y-4 py-8">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-[#0F2137]">¡Actualizado!</h4>
                                <p className="text-gray-500 text-sm">Tu correo ha sido cambiado correctamente.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
                                <Mail className="h-5 w-5 shrink-0" />
                                <p>Enviaremos un código de verificación a tu <strong>nuevo</strong> correo electrónico.</p>
                            </div>

                            {verifyEmailStep === 'input' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500">Nuevo Correo</label>
                                        <input
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            type="email"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg outline-none focus:border-blue-500 transition-all text-[#0F2137]"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendEmailCode}
                                        disabled={verifyEmailLoading || !newEmail.includes('@')}
                                        className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {verifyEmailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar Código'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500">Código de Verificación</label>
                                        <input
                                            value={emailOtpCode}
                                            onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] outline-none focus:border-blue-500 transition-all text-[#0F2137]"
                                            autoFocus
                                        />
                                        <p className="text-center text-xs text-gray-400">Enviado a {newEmail}</p>
                                    </div>
                                    <button
                                        onClick={handleVerifyEmailCode}
                                        disabled={verifyEmailLoading || emailOtpCode.length < 6}
                                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        {verifyEmailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verificar y Actualizar'}
                                    </button>
                                    <button
                                        onClick={() => setVerifyEmailStep('input')}
                                        className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
                                    >
                                        Cambiar correo
                                    </button>
                                </div>
                            )}

                            {verifyEmailError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {verifyEmailError}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
