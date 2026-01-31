import Link from 'next/link'
import { Ban } from 'lucide-react'

export default function SuspendedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20">
                    <Ban className="h-10 w-10 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Cuenta Suspendida</h1>
                <p className="text-zinc-400 mb-8">
                    Tu acceso a la plataforma ha sido revocado debido a una violación de nuestros términos de servicio. No puedes realizar compras ni acceder a la información de contacto.
                </p>

                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 mx-auto max-w-xs">
                        <p className="text-xs text-zinc-500 uppercase font-bold mb-1">ID de Usuario</p>
                        <p className="font-mono text-sm text-zinc-300">Contacta a soporte</p>
                    </div>

                    <a
                        href="mailto:soporte@avivago.mx?subject=Apelación de Suspensión"
                        className="block w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                        Contactar Soporte
                    </a>
                </div>
            </div>
        </div>
    )
}
