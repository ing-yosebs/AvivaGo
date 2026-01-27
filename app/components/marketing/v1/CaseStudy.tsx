'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function CaseStudy() {
    return (
        <section className="py-20 bg-aviva-navy text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 pattern-dots"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 relative"
                    >
                        <div className="absolute top-6 left-6 md:top-10 md:left-10 text-aviva-gold opacity-30">
                            <Quote size={80} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                            {/* Profile Image Highlight */}
                            <div className="shrink-0 relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-aviva-gold/50 overflow-hidden bg-gray-700">
                                    {/* Placeholder for José's photo */}
                                    <div className="w-full h-full flex items-center justify-center text-aviva-gold font-bold text-3xl">J</div>
                                </div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-aviva-gold text-aviva-navy text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                    Socio Fundador
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                <h3 className="text-2xl md:text-3xl font-display font-bold">
                                    "En 6 meses pasé de sobrevivir con las apps a facturar <span className="text-aviva-secondary">$160,000 MXN/mes</span>."
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-blue-100 text-lg italic">
                                        "AvivaGo me dio la tecnología para profesionalizarme. Ahora tengo una flota de 5 conductores y mis clientes confían en mi marca, no en una app genérica."
                                    </p>
                                    <div className="pt-2">
                                        <p className="font-bold text-white">José Martínez</p>
                                        <p className="text-sm text-gray-400">CEO de Martínez Transport & Logistics</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Badge */}
                        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300 text-sm">Crecimiento:</span>
                                <span className="font-bold text-green-400">+400% Ingresos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300 text-sm">Flota:</span>
                                <span className="font-bold text-white">1 → 5 Vehículos</span>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
