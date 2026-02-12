'use client';

import { motion } from 'framer-motion';
import { QrCode, CreditCard, StickyNote, Smartphone } from 'lucide-react';

export default function MarketingKitPromo() {
    return (
        <section className="pt-12 pb-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">

                {/* Header Section - Now at the Top */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mb-10"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-aviva-navy leading-tight font-display mb-6">
                        Tu auto es tu mejor <br />
                        <span className="text-aviva-secondary">Herramienta de Venta</span>
                    </h2>

                    <p className="text-xl text-gray-600 leading-relaxed font-medium">
                        No dejes que ese pasajero se vaya para siempre. Con nuestros materiales profesionales, convierte cada viaje de aplicación en un futuro cliente directo y recurrente.
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">

                    {/* Visual Side - Car Interior Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-gray-900 bg-gray-900 group">
                            <div className="aspect-[4/5] md:aspect-[4/3] relative bg-gradient-to-br from-gray-800 to-black">
                                <img
                                    src="/images/marketing_kit_car_interior_v2_1770876312999.png"
                                    alt="Interior de auto con Kit de Marketing AvivaGo"
                                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                        const fallbackText = document.createElement('div');
                                        fallbackText.className = 'text-center p-8';
                                        fallbackText.innerHTML = '<p class="text-white text-opacity-50 text-xl font-bold">Visualización del Interior</p>';
                                        e.currentTarget.parentElement?.appendChild(fallbackText);
                                    }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                <div className="absolute top-[30%] right-[25%]">
                                    <div className="relative group/hotspot">
                                        <div className="w-8 h-8 rounded-full bg-aviva-secondary/90 flex items-center justify-center cursor-pointer animate-pulse shadow-lg ring-4 ring-white/20">
                                            <StickyNote size={14} className="text-white" />
                                        </div>
                                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-xl shadow-xl opacity-0 group-hover/hotspot:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            <p className="text-xs font-bold text-gray-900">Sticker de Seguridad</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-[40%] left-[30%]">
                                    <div className="relative group/hotspot">
                                        <div className="w-8 h-8 rounded-full bg-aviva-primary/90 flex items-center justify-center cursor-pointer animate-pulse shadow-lg ring-4 ring-white/20 delay-300">
                                            <QrCode size={14} className="text-white" />
                                        </div>
                                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-xl opacity-0 group-hover/hotspot:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            <p className="text-xs font-bold text-gray-900">QR de Perfil</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Smartphone className="text-green-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Experiencia del Pasajero</p>
                                        <p className="text-gray-300 text-xs">Así te ven tus clientes potenciales</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-aviva-secondary/10 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-aviva-primary/10 rounded-full blur-3xl -z-10"></div>
                    </motion.div>

                    {/* Features Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="w-full lg:w-1/2 space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-bold border border-purple-200 uppercase tracking-wide mb-2">
                            <CreditCard size={14} />
                            Kit de Marketing Personalizado
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                    <QrCode className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-aviva-navy mb-1">Tu Propio Código QR</h4>
                                    <p className="text-gray-600 leading-snug">
                                        Colocado estratégicamente en el respaldo. El pasajero escanea, ve tu perfil, tus fotos y guarda tu contacto al instante.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                    <StickyNote className="text-orange-600" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-aviva-navy mb-1">Stickers de "Conductor Verificado"</h4>
                                    <p className="text-gray-600 leading-snug">
                                        Genera confianza inmediata desde que el pasajero se acerca a tu auto. Tu marca personal visible y profesional.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                    <CreditCard className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-aviva-navy mb-1">Tarjetas de Presentación Digitales</h4>
                                    <p className="text-gray-600 leading-snug">
                                        Olvídate del papel. Tu kit incluye diseños listos para compartir por WhatsApp o AirDrop al finalizar el viaje.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Testimonial Quote - Now Outside the Columns */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16"
                >
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden max-w-4xl mx-auto shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-aviva-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="shrink-0 w-full md:w-2 bg-gradient-to-r md:bg-gradient-to-b from-aviva-primary to-aviva-secondary h-2 md:h-16 rounded-full"></div>
                        <p className="text-xl text-gray-700 italic font-semibold leading-relaxed text-center md:text-left">
                            "El 80% de los pasajeros prefieren viajar con un conductor que ya conocen y en quien confían. Tu kit hace esa conexión posible."
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
