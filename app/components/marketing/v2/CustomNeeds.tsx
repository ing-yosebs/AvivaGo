'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

const carouselItems = [
    // Asistencia Senior
    {
        src: "/images/feature_senior_v4.png",
        alt: "Asistencia dedicada y digna",
        label: "Trato Preferencial",
        categoryIndex: 0
    },
    {
        src: "/images/feature_senior_v5.png",
        alt: "Conductor certificado asistiendo a pasajeros",
        label: "Compromiso Social",
        categoryIndex: 0
    },
    {
        src: "/images/feature_senior_latino.png",
        alt: "Conductor latino ayudando a persona mayor",
        label: "Asistencia Adultos Mayores",
        categoryIndex: 0
    },
    {
        src: "/images/feature_senior_2.png",
        alt: "Conductor latino brindando asistencia respetuosa",
        label: "Paciencia y Respeto",
        categoryIndex: 0
    },
    // Circuitos
    {
        src: "/images/feature_circuit_v4.png",
        alt: "Rutas urbanas optimizadas",
        label: "Tu Ciudad a tu Ritmo",
        categoryIndex: 1
    },
    {
        src: "/images/feature_circuit_latino.png",
        alt: "Planes de múltiples paradas con conductor latino",
        label: "Circuitos y Rutas",
        categoryIndex: 1
    },
    {
        src: "/images/feature_circuit_3.png",
        alt: "Optimización de tiempo en traslados",
        label: "Agenda Completa",
        categoryIndex: 1
    },
    {
        src: "/images/feature_circuit_fixed.png",
        alt: "Conductor latino gestionando ruta personalizada",
        label: "Ruta Flexible",
        categoryIndex: 1
    },
    // Mascotas y Ayuda
    {
        src: "/images/feature_pets_v4.png",
        alt: "Viaje seguro para todas las mascotas",
        label: "Comunidad Pet-Friendly",
        categoryIndex: 2
    },
    {
        src: "/images/feature_pets_latino.png",
        alt: "Conductor latino con mascota en el auto",
        label: "Ayuda y Mascotas",
        categoryIndex: 2
    },
    {
        src: "/images/feature_pets_2.png",
        alt: "Servicio amable con mascotas",
        label: "Viajes Pet-Friendly",
        categoryIndex: 2
    },
    {
        src: "/images/feature_circuit_2.png",
        alt: "Asistencia con equipaje y cajas",
        label: "Apoyo con Equipaje",
        categoryIndex: 2
    },
];

export default function CustomNeeds() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, []);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 4000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    const activeCategory = carouselItems[currentIndex].categoryIndex;

    // Variants for slide animation
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <section className="bg-white py-16 sm:py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Visual / Professional Carousel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square sm:aspect-[4/3] bg-gray-100 group">
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={carouselItems[currentIndex].src}
                                        alt={carouselItems[currentIndex].alt}
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop';
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Label Overlay */}
                            <div className="absolute top-6 left-6 z-20">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={carouselItems[currentIndex].label}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20"
                                    >
                                        <p className="text-xs font-black text-aviva-primary uppercase tracking-widest">
                                            {carouselItems[currentIndex].label}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Controls */}
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors text-white"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors text-white"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                {carouselItems.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setDirection(i > currentIndex ? 1 : -1);
                                            setCurrentIndex(i);
                                        }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-6 bg-aviva-primary' : 'w-1.5 bg-white/40 hover:bg-white/60'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                        </div>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Tú eliges <span className="text-aviva-primary">con quién</span> viajar.
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                En AvivaGo conectas con conductores dispuestos a adaptarse a tus necesidades. Tú decides quién se ajusta mejor a tu agenda y requerimientos.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { id: 0, icon: Heart, color: 'pink', title: 'Asistencia Adultos Mayores', desc: 'Trato digno y paciente. Tu conductor brinda el apoyo necesario y espera el tiempo que sea requerido sin prisas.' },
                                { id: 1, icon: RefreshCw, color: 'purple', title: 'Circuitos y Rutas', desc: 'Visita el banco, la farmacia y recoge a los niños en un solo trayecto. Tu conductor se adapta a tu agenda completa.' },
                                { id: 2, icon: ShoppingBag, color: 'green', title: 'Ayuda Personal y Mascotas', desc: '¿Llevas bolsas pesadas o viajas con tu mejor amigo? Tu conductor está ahí para asistirte y darte la bienvenida a ti y a tu mascota.' }
                            ].map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`flex gap-4 items-start p-4 rounded-2xl transition-all duration-500 cursor-pointer border-2 ${activeCategory === cat.id ? `bg-${cat.color}-50/50 border-${cat.color}-100 shadow-md translate-x-1` : 'border-transparent hover:bg-gray-50'}`}
                                    onClick={() => {
                                        const firstOfCategory = carouselItems.findIndex(item => item.categoryIndex === cat.id);
                                        if (firstOfCategory !== -1) {
                                            setDirection(firstOfCategory > currentIndex ? 1 : -1);
                                            setCurrentIndex(firstOfCategory);
                                        }
                                    }}
                                >
                                    <div className={`w-12 h-12 bg-${cat.color}-50 rounded-xl flex items-center justify-center shrink-0`}>
                                        <cat.icon className={`w-6 h-6 text-${cat.color}-600`} />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{cat.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{cat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
