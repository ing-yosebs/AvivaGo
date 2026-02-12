'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Car, Globe, Heart, Shield, Award } from 'lucide-react';

import AvivaLogo from '@/app/components/AvivaLogo';

export default function Hero() {
    return (
        <section className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-br from-aviva-bg to-white text-aviva-text">
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">

                    {/* Left: Value Proposition */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full md:w-1/2 space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aviva-secondary/10 text-aviva-secondary text-sm font-bold border border-aviva-secondary/20 shadow-sm">
                            <Award size={16} className="text-aviva-secondary" />
                            RECLUTANDO A LOS 50 MEJORES CONDUCTORES DE CADA CIUDAD
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-display font-bold leading-tight text-aviva-navy">
                                Crea tu propia página de <span className="text-aviva-primary">servicios de transporte</span> y fideliza a tus clientes
                            </h1>
                            <p className="text-xl text-gray-700 font-medium">
                                Tu sitio web propio + bonos por invitar a pasajeros + bonos de por vida para los primeros 50 conductores
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <BenefitItem text="0% Comisiones" />
                            <BenefitItem text="Tu propio sitio web" />
                            <BenefitItem text="Bonos por cada cliente" />
                            <BenefitItem text="Contacto directo WhatsApp" />
                        </div>

                        <div className="bg-blue-50 border-l-4 border-aviva-primary p-4 rounded-r-xl">
                            <p className="text-sm text-aviva-navy leading-relaxed">
                                <span className="font-bold">Lanzamiento Privado:</span> Eres dueño de tu espacio hoy. Cuando lleguemos a 50, abriremos el catálogo general para que también recibas clientes nuevos de la calle.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <Link
                                    href="/register?role=driver"
                                    onClick={() => {
                                        if (typeof window.fbq !== 'undefined') {
                                            window.fbq('track', 'Lead', {
                                                content_name: 'Hero CTA - Driver Registration',
                                                content_category: 'Drivers'
                                            });
                                        }
                                        if (typeof window.ttq !== 'undefined') {
                                            window.ttq.track('Lead', {
                                                content_name: 'Hero CTA - Driver Registration',
                                                content_category: 'Drivers'
                                            });
                                        }
                                    }}
                                    className="inline-flex items-center justify-center gap-2 bg-aviva-secondary hover:bg-aviva-secondary/90 text-white text-lg font-bold px-10 py-5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-full sm:w-max group"
                                >
                                    <Car size={24} />
                                    ¡Quiero mi Perfil Digital ahora!
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full md:w-1/2 relative flex justify-center"
                    >
                        <div className="relative z-10 w-full max-w-[440px]">
                            <img
                                src="/images/hero-driver-v3.png"
                                alt="Tu propia web de transporte AvivaGo"
                                className="w-full h-auto rounded-[2.5rem] shadow-2xl transition-transform hover:scale-[1.02] duration-500"
                            />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-aviva-primary/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-aviva-secondary/20 rounded-full blur-3xl -z-10"></div>

                        {/* Floating Card: Exclusive Spot */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -bottom-4 -right-4 bg-white p-5 rounded-2xl shadow-xl border border-aviva-primary/20 z-20 max-w-xs"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-aviva-primary/10 rounded-full flex items-center justify-center">
                                    <Users className="text-aviva-primary" size={20} />
                                </div>
                                <span className="font-bold text-aviva-navy">Cupos Limitados</span>
                            </div>
                            <p className="text-sm text-gray-600">Por lanzamiento, sólo <span className="font-bold text-aviva-primary">50 lugares</span> para el beneficio de bonos de afiliados</p>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

function BenefitItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={16} />
            </div>
            <span className="text-gray-700 font-semibold">{text}</span>
        </div>
    );
}

function Users({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

