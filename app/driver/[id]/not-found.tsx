'use client';

import { Home, Search, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import TrustFooter from '@/app/components/marketing/v1/TrustFooter';

export default function DriverNotFound() {
    return (
        <div className="min-h-screen bg-aviva-bg flex flex-col font-sans">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white border border-aviva-border p-10 md:p-16 rounded-[40px] max-w-md shadow-soft relative overflow-hidden">
                    {/* Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-aviva-primary/5 rounded-full -mr-16 -mt-16" />

                    <div className="w-20 h-20 bg-aviva-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <ShieldAlert size={40} className="text-aviva-primary" />
                    </div>

                    <h1 className="text-3xl font-black text-aviva-navy mb-4 uppercase tracking-tighter">
                        Conductor no encontrado
                    </h1>

                    <p className="text-aviva-subtext mb-10 font-bold text-lg leading-relaxed">
                        El perfil que buscas no existe, ha sido desactivado por el administrador o el enlace es incorrecto.
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link href="/" className="inline-block bg-aviva-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-aviva-navy transition-all active:scale-95 shadow-lg shadow-aviva-primary/20">
                            Volver al Inicio
                        </Link>

                        <Link href="/conductores" className="flex items-center justify-center gap-2 text-aviva-subtext hover:text-aviva-primary font-bold transition-colors">
                            <Search size={18} />
                            Buscar más conductores
                        </Link>
                    </div>
                </div>
            </div>

            <div className="pb-12">
                <TrustFooter />
            </div>
        </div>
    );
}
