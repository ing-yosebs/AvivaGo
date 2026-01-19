'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function RegisterSuccessPage() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(10)

    useEffect(() => {
        if (countdown === 0) {
            window.location.href = '/'
            return
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [countdown])

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <main className="w-full max-w-md p-6 relative z-10">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl text-center">

                    {/* Icon Animation */}
                    <div className="flex justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full shadow-lg relative z-10">
                            <Mail className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -right-2 -bottom-2 bg-zinc-900 rounded-full p-1.5 border border-zinc-800">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        ¡Casi listo!
                    </h1>

                    <p className="text-zinc-300 text-lg mb-6 leading-relaxed">
                        Hemos enviado un correo de confirmación a tu dirección.
                    </p>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-8">
                        <p className="text-zinc-400 text-sm">
                            Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
                        >
                            Ir al Inicio ahora
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <p className="text-zinc-500 text-sm">
                            Redireccionando automáticamente en <span className="text-white font-medium">{countdown}s</span>...
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
