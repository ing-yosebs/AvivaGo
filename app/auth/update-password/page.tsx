'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CheckCircle, ShieldCheck, ArrowRight, Rocket } from 'lucide-react'

export default function UpdatePasswordPage() {
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                setUserEmail(user.email)
            }
        }
        getUser()
    }, [supabase])

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <main className="w-full max-w-md p-6 relative z-10">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        {/* Logo */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                                <Rocket className="h-8 w-8 text-white transform -rotate-45" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                            ¡Acceso Recuperado!
                        </h1>
                    </div>

                    <div className="text-center space-y-6">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center gap-2">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                            <p className="text-green-200 font-medium">
                                Ya has iniciado sesión correctamente.
                            </p>
                        </div>

                        <div className="text-zinc-300 text-sm leading-relaxed space-y-2">
                            <p>
                                Estás dentro con tu cuenta:
                            </p>
                            <p className="font-mono text-purple-400 bg-purple-500/10 py-1 px-3 rounded inline-block">
                                {userEmail || 'Cargando...'}
                            </p>
                            <p className="pt-4">
                                Por tu seguridad, ve ahora a tu <strong>Panel de Perfil</strong> en la sección de <strong>Seguridad</strong> para actualizar tu contraseña.
                            </p>
                            <p className="text-zinc-500 text-xs italic">
                                Asegúrate de anotar tu nueva contraseña en un lugar seguro.
                            </p>
                        </div>

                        <Link
                            href="/perfil?tab=security"
                            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            <ShieldCheck className="h-5 w-5" />
                            Ir a Seguridad del Perfil
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
