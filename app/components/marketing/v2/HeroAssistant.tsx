'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const heroImages = [
    {
        src: "/images/hero_latino_v2.png",
        alt: "Conductor AvivaGo amable y profesional con estilo casual"
    },
    {
        src: "/images/hero_carousel_1.png",
        alt: "Servicio de conductor personal para pasajeros"
    },
    {
        src: "/images/hero_carousel_2.png",
        alt: "Independencia y profesionalismo en cada viaje"
    },
    {
        src: "/images/hero_carousel_4.png",
        alt: "Seguridad y confianza en tu transporte"
    }
];

export default function HeroAssistant() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Safety check to prevent index out of bounds
    useEffect(() => {
        if (currentIndex >= heroImages.length) {
            setCurrentIndex(0);
        }
    }, [currentIndex]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

    return (
        <section className="relative bg-white overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 self-start">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Registro 100% Gratis</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-[1.1] tracking-tight">
                            Más que un viaje, contratas a un <span className="text-transparent bg-clip-text bg-gradient-to-r from-aviva-primary to-blue-600">conductor personal</span>.
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
                            Olvídate de las apps convencionales. Encuentra a un conductor dedicado que sigue tus instrucciones, te espera y hace valer tu tiempo.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all bg-aviva-primary rounded-2xl hover:bg-aviva-primary/90 hover:shadow-lg hover:shadow-aviva-primary/20 hover:-translate-y-1"
                            >
                                Registrarme Gratis
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 transition-all bg-gray-50 border border-gray-200 rounded-2xl hover:bg-white hover:border-gray-300 hover:shadow-md"
                            >
                                Buscar mi conductor
                            </Link>
                        </div>
                        <p className="text-sm text-gray-400">Registro rápido y totalmente gratuito para todos.</p>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Acuerdo directo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Sin cancelaciones</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Trato personalizado</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Dynamic Hero Carousel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
                    >
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-square bg-gray-100 group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={heroImages[currentIndex % heroImages.length]?.src || ""}
                                        alt={heroImages[currentIndex % heroImages.length]?.alt || ""}
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop';
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>



                            {/* Carousel Controls */}
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={prevSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={nextSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Progress Dots */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                {heroImages.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Decorative Blob */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/50 to-purple-100/50 blur-3xl rounded-full" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
