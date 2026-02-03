'use client'

import { useEffect, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function CallbackContent() {
    const searchParams = useSearchParams()
    const status = searchParams.get('status') // 'success' | 'canceled'
    const type = searchParams.get('type') // 'unlock' | 'membership'

    const [verifying, setVerifying] = useState(status === 'success')
    const [verified, setVerified] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const confirmPayment = async () => {
            if (status !== 'success') return;

            const sessionId = searchParams.get('session_id');
            if (!sessionId) {
                setError('No se encontró ID de sesión');
                setVerifying(false);
                return;
            }

            try {
                const res = await fetch('/api/checkout/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId })
                });

                if (!res.ok) {
                    const msg = await res.text();
                    throw new Error(msg || 'Error al confirmar el pago');
                }

                setVerified(true);

                // Track Facebook Pixel 'Purchase' event
                if (typeof window.fbq !== 'undefined') {
                    window.fbq('track', 'Purchase', {
                        content_name: type === 'membership' ? 'Membresía Driver AvivaGo' : 'Desbloqueo de Conductor',
                        content_type: 'product',
                        value: type === 'membership' ? 524 : 0, // Set specific value if it's membership
                        currency: 'MXN'
                    });
                }

                // Notify parent window ONLY after verification
                if (window.opener) {
                    window.opener.postMessage({
                        source: 'avivago-payment',
                        status: 'success',
                        type,
                        sessionId
                    }, window.location.origin);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Hubo un problema registrando tu pago. Contacta a soporte.');
            } finally {
                setVerifying(false); // Stop loading spinner
            }
        };

        if (status === 'success') {
            confirmPayment();
        } else {
            // Cancel case - notify immediately
            if (window.opener) {
                window.opener.postMessage({
                    source: 'avivago-payment',
                    status: 'canceled',
                    type
                }, window.location.origin);
            }
        }

        // Auto-close logic should wait for verification if success
        // We'll handle auto-close inside the render based on verified state or just user click for safety
    }, [status, type, searchParams]);

    // Auto close effect only when verified or canceled
    useEffect(() => {
        if (verified || status !== 'success') {
            const timer = setTimeout(() => {
                window.close()
            }, 4000) // Give them time to read "Exito"
            return () => clearTimeout(timer)
        }
    }, [verified, status])

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-sm w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6 animate-in zoom-in-95 duration-500">

                {status === 'success' ? (
                    verifying ? (
                        <>
                            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-500/5 animate-pulse">
                                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-white">Verificando Pago...</h1>
                                <p className="text-zinc-400 text-sm">Estamos confirmando tu transacción con el banco. Por favor espera.</p>
                            </div>
                        </>
                    ) : error ? (
                        <>
                            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto ring-8 ring-yellow-500/5">
                                <XCircle className="h-10 w-10 text-yellow-500" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-white">Atención</h1>
                                <p className="text-zinc-400 text-sm">{error}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-white">¡Pago Exitoso!</h1>
                                <p className="text-zinc-400 text-sm">Tu membresía ha sido activada correctamente en nuestro sistema.</p>
                            </div>
                        </>
                    )
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
