'use client';

import { motion } from 'framer-motion';
import { Quote, Check } from 'lucide-react';
import AvivaLogo from '@/app/components/AvivaLogo';

export default function CaseStudy() {
    return (
        <section className="py-12 bg-aviva-navy text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 pattern-dots"></div>

            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden shadow-2xl"
                    >
                        {/* Background Decoration */}
                        <div className="absolute -top-6 -left-6 text-aviva-gold opacity-10 rotate-12 pointer-events-none">
                            <Quote size={160} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12">
                            {/* LEFT: FOTO & METRICS */}
                            <div className="shrink-0 flex flex-row md:flex-col items-center md:items-start gap-6">
                                <div className="relative w-32 h-32 md:w-64 md:h-64 rounded-3xl border-2 md:border-4 border-aviva-gold/50 overflow-hidden bg-gray-700 shadow-xl shrink-0">
                                    <img
                                        src="/images/socio-avivago.png"
                                        alt="José Martínez"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Label INSIDE the photo */}
                                    <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-aviva-gold text-aviva-navy text-[10px] md:text-sm font-bold px-3 md:px-4 py-1 md:py-1.5 rounded-full whitespace-nowrap shadow-lg uppercase tracking-wider z-10">
                                        Socio AvivaGo
                                    </div>
                                </div>

                                {/* METRICS (Horizontal on mobile, Vertical on MD) */}
                                <div className="flex-1 md:flex-none flex flex-col gap-3 md:gap-4 md:pt-4 md:border-t md:border-white/10">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/30 flex items-center justify-center">
                                            <Check size={12} className="text-green-500 stroke-[3px]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-gray-400 text-[8px] md:text-[10px] uppercase tracking-wider font-bold truncate">Inversión</p>
                                            <p className="font-bold text-green-500 text-sm md:text-lg leading-none truncate">0% Comisiones</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/30 flex items-center justify-center">
                                            <Check size={12} className="text-green-500 stroke-[3px]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-gray-400 text-[8px] md:text-[10px] uppercase tracking-wider font-bold truncate">Negocio</p>
                                            <p className="font-bold text-white text-sm md:text-lg leading-none truncate">100% Propio</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/30 flex items-center justify-center">
                                            <Check size={12} className="text-green-500 stroke-[3px]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-gray-400 text-[8px] md:text-[10px] uppercase tracking-wider font-bold truncate">Tiempo</p>
                                            <p className="font-bold text-white text-sm md:text-lg leading-none truncate">100% Flexible</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: CONTENT (TITULO + TESTIMONIO/LOGO) */}
                            <div className="flex-1 flex flex-col gap-10">
                                {/* TITULO (Top Row) */}
                                <div className="border-b border-white/10 pb-6">
                                    <h3 className="text-2xl md:text-4xl font-display font-bold text-white leading-tight">
                                        "Gracias a AvivaGo logré estabilizar mis ingresos en <span className="text-aviva-secondary">$16,000 MXN extras/mes</span>."
                                    </h3>
                                </div>

                                {/* BOTTOM ROW (TESTIMONIO + LOGO) */}
                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                    {/* TESTIMONIO */}
                                    <div className="flex-1 space-y-6">
                                        <p className="text-blue-100 text-xl italic leading-relaxed">
                                            "Tener mi propia página me dio la seriedad que buscaba. Ahora mis clientes me contactan directo y no pierdo dinero en comisiones innecesarias."
                                        </p>
                                        <div>
                                            <p className="font-bold text-white text-2xl">José Martínez</p>
                                            <p className="text-blue-300 font-medium tracking-wide">Conductor Independiente</p>
                                        </div>
                                    </div>

                                    {/* LOGO (Sello) */}
                                    <div className="shrink-0 flex flex-col items-center gap-3">
                                        <div className="p-6 bg-white/10 rounded-full border border-white/20 backdrop-blur-md shadow-2xl rotate-12 hover:rotate-0 transition-all duration-500">
                                            <AvivaLogo className="h-24 w-auto" />
                                        </div>
                                        <p className="text-aviva-gold font-bold text-xs uppercase tracking-[0.2em] opacity-80 whitespace-nowrap">
                                            Socio Certificado
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
