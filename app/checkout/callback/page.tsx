'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function CallbackContent() {
    const searchParams = useSearchParams()
    const status = searchParams.get('status') // 'success' | 'canceled'
    const type = searchParams.get('type') // 'unlock' | 'membership'

    useEffect(() => {
        // Notify parent window
        if (window.opener) {
            window.opener.postMessage({
                source: 'avivago-payment',
                status,
                type,
                sessionId: searchParams.get('session_id')
            }, window.location.origin)
        }

        // Auto-close after 3 seconds if it hasn't been closed by parent
        const timer = setTimeout(() => {
            window.close()
        }, 3000)

        return () => clearTimeout(timer)
    }, [status, type])

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-sm w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6 animate-in zoom-in-95 duration-500">
                {status === 'success' ? (
                    <>
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white">¡Pago Exitoso!</h1>
                            <p className="text-zinc-400 text-sm">Tu transacción se completó correctamente. Esta ventana se cerrará automáticamente.</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-500/5">
                            <XCircle className="h-10 w-10 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white">Pago Cancelado</h1>
                            <p className="text-zinc-400 text-sm">No se realizó ningún cargo. Puedes intentar de nuevo cuando gustes.</p>
                        </div>
                    </>
                )}

                <div className="flex items-center justify-center gap-2 text-zinc-500 pt-4">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Cerrando ventana...</span>
                </div>

                <button
                    onClick={() => window.close()}
                    className="w-full bg-white/5 hover:bg-white/10 text-white/50 py-3 rounded-xl text-xs font-bold transition-colors"
                >
                    Cerrar ahora
                </button>
            </div>
        </div>
    )
}

export default function CheckoutCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    )
}
