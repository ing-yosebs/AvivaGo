'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Shield, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function PlantillaLanding() {
    return (
        <div className="bg-white min-h-screen font-sans overflow-hidden">
            {/* --- HERO SECTION --- */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10" />
                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-8">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            Nueva Oportunidad Exclusiva
                        </span>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
                            Genera más ingresos con <span className="text-blue-600">tours privados</span>
                        </h1>

                        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Únete a la plataforma que conecta a los mejores conductores con pasajeros de alto valor. Sin comisiones ocultas.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/register?role=driver" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center justify-center gap-2">
                                    Registrarme Ahora <ArrowRight size={20} />
                                </button>
                            </Link>
                            <p className="text-sm text-slate-500 mt-4 sm:mt-0 sm:ml-4">
                                * Plazas limitadas
                            </p>
                        </div>
                    </motion.div>

                    {/* Illustration / Graphic Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mt-16 mx-auto max-w-5xl rounded-2xl shadow-2xl border border-slate-100 bg-white p-4"
                    >
                        {/* Replace with actual image */}
                        <div className="aspect-video rounded-xl bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <p className="text-slate-400 font-medium z-10">Aquí va tu Hero Image o Video (1280x720)</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- SOCIAL PROOF / TRUST --- */}
            <section className="py-12 border-y border-slate-100 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">Con la confianza de conductores en todo México</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Logos placeholder */}
                        <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                        <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                        <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                        <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Todo lo que necesitas para crecer</h2>
                        <p className="text-lg text-slate-600">Hemos diseñado una plataforma pensando 100% en las necesidades del conductor profesional.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Feature 1 */}
                        <Card
                            icon={<TrendingUp className="h-8 w-8 text-green-600" />}
                            title="Mayores Ganancias"
                            description="Tú defines tus tarifas. Nosotros no cobramos comisiones por viaje, solo una membresía fija."
                            delay={0.1}
                        />
                        {/* Feature 2 */}
                        <Card
                            icon={<Users className="h-8 w-8 text-blue-600" />}
                            title="Clientes Directos"
                            description="Construye tu propia cartera de clientes. Fomenta la lealtad y recibe reservas recurrentes."
                            delay={0.2}
                        />
                        {/* Feature 3 */}
                        <Card
                            icon={<Shield className="h-8 w-8 text-purple-600" />}
                            title="Seguridad Total"
                            description="Verificamos a todos los pasajeros y te damos herramientas para gestionar tus viajes con tranquilidad."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section className="py-24 bg-blue-600">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Empieza a construir tu futuro hoy</h2>
                        <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-10">
                            Únete a la comunidad de conductores más exclusiva de México.
                        </p>
                        <Link href="/register?role=driver">
                            <button className="bg-white text-blue-600 hover:bg-slate-100 px-10 py-5 rounded-xl text-lg font-bold shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
                                Crear mi Cuenta Gratis
                            </button>
                        </Link>
                        <p className="mt-6 text-blue-200 text-sm">Sin tarjeta de crédito requerida para empezar.</p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

function Card({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-100 group"
        >
            <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </motion.div>
    );
}
