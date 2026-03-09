'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, FileText, Image as ImageIcon, Shield, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type ManualIdentityReviewProps = {
    userId: string
    identityVerification: any
    idDocumentSignedUrl: string | null
    idDocumentBackSignedUrl: string | null
    verificationSelfieSignedUrl: string | null
}

export default function ManualIdentityReview({
    userId,
    identityVerification,
    idDocumentSignedUrl,
    idDocumentBackSignedUrl,
    verificationSelfieSignedUrl
}: ManualIdentityReviewProps) {
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionStr, setActionStr] = useState<'approve' | 'reject' | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Form fields
    const [fullName, setFullName] = useState('')
    const [documentNumber, setDocumentNumber] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [nationality, setNationality] = useState('')

    if (!identityVerification || identityVerification.status !== 'manual_review') {
        return null; // Only show if pending manual review
    }

    const handleAction = async (action: 'approve' | 'reject') => {
        if (action === 'approve') {
            if (!fullName.trim() || !documentNumber.trim()) {
                setError('El Nombre Completo y el CURP/Documento son obligatorios para aprobar.')
                return
            }
        }

        setIsSubmitting(true)
        setActionStr(action)
        setError(null)

        try {
            const response = await fetch('/api/admin/verify-identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: userId,
                    action,
                    extractedData: action === 'approve' ? {
                        fullName: fullName.trim(),
                        documentNumber: documentNumber.trim(),
                        birthDate: birthDate.trim() || null,
                        nationality: nationality.trim() || null
                    } : null
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Ocurrió un error al procesar la solicitud.')
            }

            // Success, refresh the page to update UI
            router.refresh()

        } catch (err: any) {
            setError(err.message)
            setIsSubmitting(false)
            setActionStr(null)
        }
    }

    return (
        <div className="backdrop-blur-xl bg-teal-500/5 border border-teal-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />

            <div className="flex items-center gap-2 mb-6 text-teal-400">
                <Shield className="h-6 w-6" />
                <h3 className="text-xl font-bold tracking-tight">Validación de Identidad Manual Requerida</h3>
            </div>

            <p className="text-zinc-300 mb-6 text-sm">
                El sistema automático no pudo validar los datos biometrícos o leer correctamente los documentos (OCR).
                Revisa las imágenes e ingresa los datos de manera manual para aprobar la identidad de este usuario.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Selfie */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center">
                    <span className="text-xs text-zinc-400 font-medium mb-2 uppercase tracking-wide">Selfie del Usuario</span>
                    <div className="relative w-full aspect-[3/4] bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
                        {verificationSelfieSignedUrl && !verificationSelfieSignedUrl.includes('placehold') ? (
                            <Image src={verificationSelfieSignedUrl} alt="Selfie" fill className="object-cover" />
                        ) : (
                            <ImageIcon className="h-8 w-8 text-zinc-600" />
                        )}
                    </div>
                </div>

                {/* Document Front */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center">
                    <span className="text-xs text-zinc-400 font-medium mb-2 uppercase tracking-wide">Frente de Identificación</span>
                    <div className="relative w-full aspect-[4/3] bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
                        {idDocumentSignedUrl && !idDocumentSignedUrl.includes('placehold') ? (
                            <Image src={idDocumentSignedUrl} alt="Frente Documento" fill className="object-contain bg-black/80" />
                        ) : (
                            <ImageIcon className="h-8 w-8 text-zinc-600" />
                        )}
                    </div>
                </div>

                {/* Document Back */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center">
                    <span className="text-xs text-zinc-400 font-medium mb-2 uppercase tracking-wide">Reverso de Identificación</span>
                    <div className="relative w-full aspect-[4/3] bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
                        {idDocumentBackSignedUrl && !idDocumentBackSignedUrl.includes('placehold') ? (
                            <Image src={idDocumentBackSignedUrl} alt="Reverso Documento" fill className="object-contain bg-black/80" />
                        ) : (
                            <ImageIcon className="h-8 w-8 text-zinc-600" />
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-5 mb-6">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    Captura de Datos Manual
                </h4>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre Completo (Tal como en la ID) *</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            placeholder="Ej. Juan Pérez García"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">CURP / Clave de Elector / ID Documento *</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 uppercase"
                            placeholder="Ej. ABCD123456EFG..."
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Fecha de Nacimiento (Opcional)</label>
                        <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Nacionalidad (Opcional)</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            placeholder="Ej. Mexicana"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                    onClick={() => handleAction('approve')}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-teal-500/20"
                >
                    {isSubmitting && actionStr === 'approve' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <CheckCircle className="w-5 h-5" />
                    )}
                    Guardar Datos y Aprobar
                </button>
                <button
                    onClick={() => handleAction('reject')}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-500 font-bold py-2.5 px-6 rounded-xl border border-red-500/20 transition-colors"
                >
                    {isSubmitting && actionStr === 'reject' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                    Rechazar Validación
                </button>
            </div>
        </div>
    )
}
