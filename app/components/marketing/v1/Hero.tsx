'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

import AvivaLogo from '@/app/components/AvivaLogo';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-br from-aviva-bg to-white text-aviva-text">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">

                    {/* Left: Value Proposition */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full md:w-1/2 space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aviva-primary/10 text-aviva-primary text-sm font-semibold border border-aviva-primary/20">
                            <span className="w-2 h-2 rounded-full bg-aviva-secondary animate-pulse"></span>
                            Nueva Era de Movilidad Profesional
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight text-aviva-navy">
                                Seguridad, Confianza y <span className="text-aviva-primary">Certeza</span>
                            </h1>
                            <h2 className="text-2xl md:text-3xl font-display font-semibold text-gray-500">
                                Tu negocio. Tu marca. Tu 100%.
                            </h2>
                        </div>

                        <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                            Olvídate de las comisiones abusivas. Regístrate en <span className="font-bold text-aviva-navy">menos de 5 minutos</span> y tendrás tu propia web funcionando y lista para recibir solicitudes hoy mismo.
                        </p>

                        <div className="flex flex-col gap-4 pt-4">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 bg-aviva-secondary hover:bg-aviva-secondary/90 text-white text-lg font-bold px-10 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-full sm:w-max"
                            >
                                Regístrate Ya
                                <ArrowRight size={20} />
                            </Link>
                            <p className="text-sm text-gray-500 font-medium">
                                Proceso súper rápido: en <span className="text-aviva-primary font-bold">menos de 5 minutos</span> tendrás tu propia página funcionando y lista para recibir solicitudes.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full md:w-1/2 relative"
                    >
                        <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-50 aspect-[9/19.5] flex items-center justify-center">
                            <img
                                src="/images/driver-mockup.jpg"
                                alt="Perfil de Conductor Profesional"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-aviva-primary/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-aviva-secondary/20 rounded-full blur-3xl -z-10"></div>

                        {/* Floating Card: Trust Indicator */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute bottom-8 left-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-20 max-w-xs"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                                <AvivaLogo className="h-full w-full" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Certificación</p>
                                <p className="font-bold text-aviva-navy">AvivaGo Professional</p>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
