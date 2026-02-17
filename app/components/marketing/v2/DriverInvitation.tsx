'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Wallet, Users, Key, ChevronLeft, ChevronRight, Rocket } from 'lucide-react';

const benefits = [
    {
        icon: Wallet,
        text: "Gana el 100% de tus viajes. Sin comisiones por plataforma."
    },
    {
        icon: Users,
        text: "Úsalo como complemento para construir tu propia cartera de clientes."
    },
    {
        icon: Key,
        text: "Libertad para negociar y decidir a quién llevas y cuándo."
    }
];

const invitationImages = [
    {
        src: "/images/driver_latino_independent_v4_1771287156541.png",
        alt: "Conductor latino profesional independiente"
    },
    {
        src: "/images/media_8cb46956-83e3-4027-8af4-ef0f9b83d55d_1771289319228.jpg",
        alt: "Socio conductor AvivaGo"
    },
    {
        src: "/images/driver_invitation_latino_1771281281002.png",
        alt: "Conductor profesional en servicio"
    },
    {
        src: "/images/media_8cb46956-83e3-4027-8af4-ef0f9b83d55d_1771289364657.jpg",
        alt: "Experiencia de conducción independiente"
    },
    {
        src: "/images/driver_invitation_latino_1771281133751.png",
        alt: "Conductor latino amable"
    },
    {
        src: "/images/media_8cb46956-83e3-4027-8af4-ef0f9b83d55d_1771289365472.jpg",
        alt: "Socio profesional AvivaGo"
    },
    {
        src: "/images/media_8cb46956-83e3-4027-8af4-ef0f9b83d55d_1771289607201.jpg",
        alt: "Comunidad de conductores independientes"
    }
];

export default function DriverInvitation() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % invitationImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % invitationImages.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + invitationImages.length) % invitationImages.length);

    return (
        <section className="bg-zinc-900 py-16 sm:py-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-aviva-primary/20 to-transparent blur-3xl opacity-30" />

            <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-white space-y-8"
                    >
                        <div>
                            <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-aviva-primary font-bold text-xs uppercase tracking-wider mb-4 border border-white/5">
                                Solo para Profesionales
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                ¿Eres Conductor? <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-aviva-primary to-purple-400">Tu negocio empieza aquí.</span>
                            </h2>
                            <p className="text-zinc-300 text-lg leading-relaxed">
                                No compitas con algoritmos. Usa AvivaGo como la herramienta definitiva para independizarte gradualmente de otras aplicaciones y ser dueño de tu tiempo.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-aviva-primary/20 flex items-center justify-center shrink-0">
                                        <benefit.icon className="w-5 h-5 text-aviva-primary" />
                                    </div>
                                    <span className="font-medium text-zinc-200">{benefit.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Link
                                href="/register?role=driver"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-black transition-all bg-white rounded-2xl hover:bg-zinc-200 hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                            >
                                Registrar mi Perfil
                                <CheckCircle className="w-5 h-5 ml-2" />
                            </Link>
                            <p className="mt-4 text-sm text-zinc-500">
                                Únete a la comunidad de conductores independientes.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative w-full overflow-hidden"
                    >
                        <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl border border-white/10 bg-zinc-800 group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={invitationImages[currentIndex].src}
                                        alt={invitationImages[currentIndex].alt}
                                        className="object-cover w-full h-full opacity-80"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                            {/* Carousel Controls */}
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={prevSlide} className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={nextSlide} className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="absolute bottom-8 left-8 right-8 z-10">
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex items-center justify-center gap-4">
                                    <Rocket className="w-9 h-9 text-aviva-primary shrink-0" />
                                    <p className="text-white font-bold text-lg leading-tight">Aumenta tus ingresos un 40% sin pagar comisiones</p>
                                </div>
                            </div>

                            {/* Progress Dots */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                {invitationImages.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
