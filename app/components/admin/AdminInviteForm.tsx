'use client'

import { useState } from 'react'
import { inviteAdmin } from '@/app/admin/settings/actions'
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AdminInviteForm() {
    const [status, setStatus] = useState<{
        type: 'idle' | 'loading' | 'success' | 'error'
        message?: string
    }>({ type: 'idle' })

    async function handleSubmit(formData: FormData) {
        setStatus({ type: 'loading' })

        try {
            const result = await inviteAdmin(formData)

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: result.message || 'Usuario promovido a Administrador exitosamente.'
                })
                // Optional: clear form
                const form = document.getElementById('invite-admin-form') as HTMLFormElement
                form?.reset()
            } else {
                setStatus({
                    type: 'error',
                    message: result.error || 'Ocurrió un error al procesar la solicitud.'
                })
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Error de conexión con el servidor.'
            })
        }
    }

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl h-fit">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-400" />
                Agregar Nuevo admin
            </h3>

            <form
                id="invite-admin-form"
                action={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre</label>
                    <input
                        name="name"
                        type="text"
                        required
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Correo Electrónico del Usuario</label>
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="usuario@ejemplo.com"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                        * El usuario debe estar registrado previamente en la plataforma como pasajero o conductor.
                    </p>
                </div>

                {status.type === 'success' && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <p>{status.message}</p>
                    </div>
                )}

                {status.type === 'error' && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{status.message}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {status.type === 'loading' ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        'Promover a Admin'
                    )}
                </button>
            </form>
        </div>
    )
}
