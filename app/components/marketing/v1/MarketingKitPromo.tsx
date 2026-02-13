'use client';

import { motion } from 'framer-motion';
import { QrCode, CreditCard, StickyNote, Smartphone, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

const MARKETING_IMAGES = [
    {
        id: 'scanning-2',
        url: '/images/passenger_scanning_qr_1771026253177.png',
        title: 'Fácil y Rápido',
        description: 'Tecnología QR para guardar tu contacto sin esfuerzo.'
    },
    {
        id: 'v4-1',
        url: '/images/marketing_kit_v4_1_1771024419391.png',
        title: 'Perspectiva del Pasajero',
        description: 'Vista realista desde el asiento trasero.'
    },
    {
        id: 'branded',
        url: '/images/marketing_kit_car_branded_1771024230388.png',
        title: 'Branding Completo',
        description: 'Integración perfecta de la marca en el vehículo.'
    },
    {
        id: 'scanning-1',
        url: '/images/passenger_scanning_qr_1771026213720.png',
        title: 'Escaneo en Acción',
        description: 'El pasajero interactúa con tu kit de marketing al instante.'
    }
];

export default function MarketingKitPromo() {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextImage = () => setActiveIndex((prev) => (prev + 1) % MARKETING_IMAGES.length);
    const prevImage = () => setActiveIndex((prev) => (prev - 1 + MARKETING_IMAGES.length) % MARKETING_IMAGES.length);

    return (
        <section className="pt-12 pb-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mb-10"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-aviva-navy leading-tight font-display mb-6">
                        Tu auto es tu mejor <br className="hidden md:block" />
                        <span className="text-aviva-secondary">Herramienta de Venta</span>
                    </h2>

                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium px-2">
                        No dejes que ese pasajero se vaya para siempre. Con nuestros materiales profesionales, convierte cada viaje de aplicación en un futuro cliente directo y recurrente.
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">

                    {/* Visual Side - Gallery Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-gray-900 bg-gray-900 group">
                            <div className="aspect-[4/5] md:aspect-[4/3] relative bg-gradient-to-br from-gray-800 to-black overflow-hidden">
                                {MARKETING_IMAGES.map((img, index) => (
                                    <motion.img
                                        key={img.id}
                                        src={img.url}
                                        alt={img.title}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: index === activeIndex ? 0.9 : 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ))}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
                                >
                                    <ChevronRight size={24} />
                                </button>

                                {/* Image Title Overlay */}
                                <div className="absolute bottom-24 left-8 right-8 z-10">
                                    <motion.div
                                        key={MARKETING_IMAGES[activeIndex].id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="drop-shadow-[0_4px_3px_rgba(0,0,0,0.9)]"
                                    >
                                        <h3 className="text-2xl font-bold text-white mb-1">{MARKETING_IMAGES[activeIndex].title}</h3>
                                        <p className="text-sm font-medium text-white/90">{MARKETING_IMAGES[activeIndex].description}</p>
                                    </motion.div>
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

                        {/* Thumbnails Selector */}
                        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-6 md:mt-8 px-4">
                            {MARKETING_IMAGES.map((img, index) => (
                                <button
                                    key={img.id + '-thumb'}
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative w-16 md:w-24 aspect-video rounded-lg md:rounded-xl overflow-hidden border-2 transition-all ${activeIndex === index ? 'border-aviva-secondary scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Decor elements */}
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

                        {/* Testimonial Quote - Integrated in Column */}
                        <div className="pt-6">
                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-start gap-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-aviva-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="shrink-0 w-2 bg-gradient-to-b from-aviva-primary to-aviva-secondary h-16 rounded-full"></div>
                                <p className="text-base text-gray-700 italic font-semibold leading-relaxed">
                                    "El 80% de los pasajeros prefieren viajar con un conductor que ya conocen y en quien confían. Tu kit hace esa conexión posible."
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
