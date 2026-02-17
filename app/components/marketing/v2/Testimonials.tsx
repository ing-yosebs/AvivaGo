'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle2 } from 'lucide-react';

const testimonials = [
    {
        name: "María Elena L.",
        city: "Estado de México",
        image: "/images/hero_driver_real_person_1771119905495.png",
        content: "Mi conductor me esperó en cada parada con una sonrisa. Tener a alguien de confianza es invaluable para mi día a día. ¡Súper recomendado!",
        time: "Hace 2 horas",
        likes: 124,
        comments: 12,
        desktopPos: "lg:col-span-4 lg:row-span-1",
        rotate: -1
    },
    {
        name: "Jorge Alberto",
        city: "CDMX",
        image: "/images/hero_driver_man_casual_v2_1771120037983.png",
        content: "Llevo a mi mascota sin problemas. Ya no tengo que rogar para que acepten a mi perro. AvivaGo entiende lo que necesitamos.",
        time: "Hace 5 horas",
        likes: 89,
        comments: 4,
        desktopPos: "lg:col-span-4 lg:row-span-1",
        rotate: 1
    },
    {
        name: "Carla Solís",
        city: "Guadalajara, Jal",
        image: "/images/testimonial_carla_real_1771120080678.png",
        content: "Me siento segura eligiendo yo misma a mi conductora antes de cada viaje. La transparencia es total.",
        time: "Ayer",
        likes: 215,
        comments: 18,
        desktopPos: "lg:col-span-4 lg:row-span-1",
        rotate: -1
    },
    {
        name: "Roberto G.",
        city: "Puebla, Pue",
        image: "/images/testimonial_roberto_real_1771120065298.png",
        content: "Sé exactamente quién lleva a mis papás al médico. Su paciencia es excepcional y la app es muy fácil de usar.",
        time: "Ayer",
        likes: 156,
        comments: 7,
        desktopPos: "lg:col-span-6 lg:row-span-1",
        rotate: 1
    },
    {
        name: "Elena Ramos",
        city: "Querétaro, Qro",
        image: "/images/elena-profile.jpg",
        content: "El trato más humano que he recibido en una aplicación de transporte. Realmente les importas como persona, no solo como un número.",
        time: "Hace 3 días",
        likes: 342,
        comments: 26,
        desktopPos: "lg:col-span-6 lg:row-span-1",
        rotate: -1
    }
];

export default function Testimonials() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDesktop = mounted && window.innerWidth > 1024;
    return (
        <section className="bg-gray-50/80 py-24 sm:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        Nuestra <span className="text-aviva-primary text-transparent bg-clip-text bg-gradient-to-r from-aviva-primary to-blue-600">Comunidad</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Voces reales que impulsan un transporte más humano y seguro.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-stretch">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.6,
                                delay: i * 0.1,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            className={`
                relative flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm
                transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group
                ${t.desktopPos}
              `}
                            style={{
                                rotate: isDesktop ? `${t.rotate}deg` : '0deg'
                            }}
                        >
                            {/* Social Style Header */}
                            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={t.image}
                                            alt={t.name}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                            <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="font-bold text-gray-900 text-[15px]">{t.name}</p>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <p className="text-xs text-gray-400 font-medium">{t.time}</p>
                                        </div>
                                        <p className="text-xs font-bold text-aviva-primary tracking-wide uppercase">{t.city}</p>
                                    </div>
                                </div>
                                <button className="text-gray-300 hover:text-gray-600 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Feed Content */}
                            <div className="p-6 flex-grow">
                                <p className="text-gray-700 leading-relaxed font-medium text-lg">
                                    {t.content}
                                </p>
                            </div>

                            {/* Social Style Footer */}
                            <div className="p-5 pt-0 mt-auto">
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors group/btn">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover/btn:bg-red-50 transition-colors">
                                                <Heart className="w-4 h-4 group-hover/btn:fill-current" />
                                            </div>
                                            <span className="text-sm font-bold">{t.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-aviva-primary transition-colors group/btn">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover/btn:bg-blue-50 transition-colors">
                                                <MessageCircle className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold">{t.comments}</span>
                                        </button>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Interaction Hint (Decorative) */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-aviva-primary/10 text-aviva-primary px-2 py-1 rounded-full text-[10px] font-black uppercase">
                                Verificado
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link
                        href="/auth/login"
                        className="inline-block bg-aviva-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-aviva-primary/20 hover:bg-aviva-primary/90 hover:scale-105 active:scale-95 transition-all"
                    >
                        Ver más historias en comunidad
                    </Link>
                </div>
            </div>
        </section>
    );
}
