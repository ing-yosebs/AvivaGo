'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, DollarSign, Wallet, Star, ArrowUpRight, Gift, Car } from 'lucide-react';

export default function ReferralEarnings() {
    return (
        <section className="pt-8 pb-20 bg-gradient-to-b from-white to-blue-50/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left side: Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 space-y-8"
                    >
                        <div className="inline-flex items-center gap-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold border border-green-200">
                                <DollarSign size={16} />
                                PROGRAMA DE AFILIADOS (bono por lanzamiento)
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="px-3 py-1 rounded-full bg-aviva-secondary text-white text-xs font-black uppercase tracking-wider shadow-sm"
                            >
                                Por tiempo limitado
                            </motion.div>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold text-aviva-navy leading-tight">
                            Gana dinero real por cada <span className="text-aviva-primary">pasajero y conductor</span> que refieras
                        </h2>

                        <p className="text-xl text-gray-600 leading-relaxed font-medium">
                            Tú eres el motor de nuestra comunidad. Genera ingresos pasivos construyendo la red de transporte más confiable de México.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Users className="text-aviva-primary" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-aviva-navy">Bonos por Pasajeros</h4>
                                    <p className="text-gray-600">Recibe <span className="text-green-600 font-bold">$200 MXN</span> por cada 20 pasajeros que registren su cuenta con tu código.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Car className="text-aviva-secondary" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-aviva-navy">Recluta Conductores</h4>
                                    <p className="text-gray-600">Gana desde <span className="text-green-600 font-bold">$80 MXN</span> por cada conductor que se active, más comisiones anuales recurrentes.</p>
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* Right side: Visual Earning Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 flex justify-center lg:justify-end"
                    >
                        <div className="relative w-full max-w-[500px]">
                            {/* The "Earnings" Card Mockup */}
                            <div className="bg-aviva-navy rounded-[2rem] p-8 shadow-2xl border border-white/10 relative z-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <p className="text-blue-200 text-sm font-medium mb-1">Tu Billetera Aviva</p>
                                        <h3 className="text-4xl font-bold text-white">$1,160.00 <span className="text-lg font-normal text-blue-300">MXN</span></h3>
                                    </div>
                                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Wallet className="text-aviva-secondary" size={28} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                                <ArrowUpRight className="text-green-400" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">Bono 20 Pasajeros</p>
                                                <p className="text-blue-200 text-xs">Hoy, 10:15 AM</p>
                                            </div>
                                        </div>
                                        <span className="text-green-400 font-bold">+$200.00</span>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-aviva-secondary/20 rounded-full flex items-center justify-center">
                                                <Car className="text-aviva-secondary" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">Nuevo Conductor Activo</p>
                                                <p className="text-blue-200 text-xs">Ayer, 04:30 PM</p>
                                            </div>
                                        </div>
                                        <span className="text-aviva-secondary font-bold">+$80.00</span>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-white/10 text-center">
                                    <p className="text-blue-200 text-sm mb-4">Aprovecha esta oportunidad de lanzamiento y haz crecer tu red y genera ingresos pasivos mes con mes.</p>
                                    <Link
                                        href="/register?role=driver"
                                        onClick={() => {
                                            if (typeof window.fbq !== 'undefined') {
                                                window.fbq('track', 'Lead', {
                                                    content_name: 'Referral Earnings CTA - Claim Page',
                                                    content_category: 'Drivers'
                                                });
                                            }
                                            if (typeof window.ttq !== 'undefined') {
                                                window.ttq.track('Lead', {
                                                    content_name: 'Referral Earnings CTA - Claim Page',
                                                    content_category: 'Drivers'
                                                });
                                            }
                                        }}
                                        className="inline-block bg-aviva-secondary hover:bg-aviva-secondary/90 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg w-full"
                                    >
                                        ¡Quiero mi Perfil Digital ahora!
                                    </Link>
                                </div>
                            </div>

                            {/* Decorative background elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-aviva-primary/30 rounded-full blur-3xl -z-0"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-aviva-secondary/30 rounded-full blur-3xl -z-0"></div>
                        </div>
                    </motion.div>

                </div>
                <div className="mt-16 text-center">
                    <p className="text-xs text-gray-400 max-w-2xl mx-auto italic">
                        *El programa de afiliados es temporal y está sujeto al cumplimiento de la meta de registro y la disponibilidad de cada ciudad.
                    </p>
                </div>
            </div>
        </section>
    );
}
