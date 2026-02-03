import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'

interface AppealModalProps {
    isOpen: boolean
    onClose: () => void
    appealReason: string
    setAppealReason: (reason: string) => void
    onConfirm: () => void
}

export default function AppealModal({ isOpen, onClose, appealReason, setAppealReason, onConfirm }: AppealModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!isOpen || !mounted) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-[#0F2137] mb-2">
                    Solicitar Nueva Revisión
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                    Por favor explica brevemente tus correcciones o apelación para ayudar a nuestro staff a revisar tu perfil más rápido.
                </p>

                <textarea
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Ej: He actualizado mi comprobante de domicilio y corregido mi nombre..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[#0F2137] placeholder-gray-400 min-h-[120px] focus:outline-none focus:border-blue-500 transition-colors mb-6 resize-none"
                    autoFocus
                />

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-gray-500 hover:text-[#0F2137] hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl bg-[#0F2137] text-white hover:bg-[#0F2137]/90 transition-colors font-bold text-sm shadow-lg shadow-[#0F2137]/20"
                    >
                        Enviar Solicitud
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
