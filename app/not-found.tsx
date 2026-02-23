'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import AvivaLogo from '@/app/components/AvivaLogo';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <main className="relative z-10 flex flex-col items-center text-center max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <AvivaLogo className="h-16 w-auto opacity-80" showText={false} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="relative inline-block mb-6">
                        <h1 className="text-[120px] md:text-[180px] font-black leading-none bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent opacity-20">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldAlert size={64} className="text-blue-500 animate-pulse" />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Página no encontrada
                    </h2>

                    <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-md mx-auto leading-relaxed">
                        Lo sentimos, la página que buscas no existe o ha sido movida a una nueva ubicación.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <Link href="/">
                            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 group">
                                <Home size={20} />
                                Volver al Inicio
                            </button>
                        </Link>

                        <Link href="javascript:history.back()">
                            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl font-bold transition-all">
                                <ArrowLeft size={20} />
                                Regresar
                            </button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-20 pt-8 border-t border-white/5 w-full flex flex-col items-center"
                >
                    <p className="text-zinc-500 text-sm mb-6 uppercase tracking-widest font-bold">
                        ¿Buscas algo específico?
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-zinc-400">
                        <Link href="/conductores" className="hover:text-white transition-colors">Conductores</Link>
                        <Link href="/pasajeros" className="hover:text-white transition-colors">Pasajeros</Link>
                        <Link href="/contacto" className="hover:text-white transition-colors">Soporte</Link>
                        <Link href="/legales/terminos-y-condiciones" className="hover:text-white transition-colors">Legales</Link>
                    </div>
                </motion.div>
            </main>

            <footer className="absolute bottom-8 left-0 w-full text-center z-10">
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.3em]">
                    AvivaGo © 2026 • La Red de Certeza
                </p>
            </footer>
        </div>
    );
}
