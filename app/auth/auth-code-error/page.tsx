'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
            <div className="max-w-md w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-500/20 p-4 rounded-full">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-4">Error de Autenticación</h1>

                <p className="text-zinc-400 mb-8">
                    El enlace de confirmación ha expirado o ya ha sido utilizado.
                    Por favor, intenta registrarte de nuevo o solicita un nuevo enlace de inicio de sesión.
                </p>

                <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Registro
                </Link>
            </div>
        </div>
    )
}
