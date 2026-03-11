'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Globe, Calculator, TrendingUp, Star } from 'lucide-react';

export default function Professionalization() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">
                <div className="bg-gradient-to-br from-aviva-navy via-gray-900 to-black rounded-[3rem] md:rounded-[4rem] p-10 md:p-16 lg:p-20 text-white relative flex flex-col lg:flex-row items-center gap-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
                    
                    <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest shadow-inner">
                                <BookOpen size={16} />
                                Academia AvivaGo
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display leading-[1.1] text-white">
                            Conviértete en un <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Empresario</span> del Transporte
                        </h2>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-medium">
                            Más que una app, obtienes acceso exclusivo a masterclasses y herramientas estratégicas. Escala tus ganancias con técnicas de los mejores de la industria.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-left">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                                    <Globe size={20} />
                                </div>
                                <p className="font-bold text-white text-lg mb-2">Marketing VIP</p>
                                <p className="text-sm text-gray-400 leading-relaxed">Domina tus redes sociales. Atrae clientes corporativos y de aeropuerto.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
                                    <Calculator size={20} />
                                </div>
                                <p className="font-bold text-white text-lg mb-2">Finanzas Pro</p>
                                <p className="text-sm text-gray-400 leading-relaxed">Costeo exacto por kilómetro, control de mantenimiento y maximización de ahorros.</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[45%] flex justify-center relative z-10">
                        <div className="relative w-full max-w-sm">
                            {/* Floating Elements */}
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="absolute -left-6 md:-left-12 top-4 md:-top-4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl skew-y-3 z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider">Ingresos Mensuales</p>
                                        <p className="text-base text-white font-black">+45%</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="absolute -right-6 md:-right-8 bottom-12 md:-bottom-8 bg-blue-600/90 backdrop-blur-xl border border-blue-400/30 p-4 rounded-2xl shadow-2xl -skew-y-3 z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                                    <div>
                                        <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Calificación Pro</p>
                                        <p className="text-base text-white font-black">5.0 Estrellas</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Main Video/Course Mockup */}
                            <div className="bg-gray-800/80 backdrop-blur-3xl border border-gray-700/50 rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 opacity-50" />
                                
                                <div className="bg-gray-950 rounded-[2rem] overflow-hidden border border-gray-800 relative aspect-[4/5] flex flex-col">
                                    {/* Video Placeholder */}
                                    <div className="h-[55%] w-full bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center group-hover:from-gray-700 group-hover:to-gray-800 transition-colors">
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity scale-100 group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/20" />
                                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 z-10 shadow-xl group-hover:scale-110 group-hover:bg-white/20 transition-all cursor-pointer">
                                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-2" />
                                        </div>
                                    </div>
                                    
                                    {/* Content details */}
                                    <div className="p-6 flex-1 flex flex-col relative z-10 bg-gradient-to-b from-transparent to-black/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/30">Clase 01</span>
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">15:24 min</span>
                                        </div>
                                        <h4 className="text-white font-bold text-xl md:text-2xl mb-2 leading-tight">El Secreto de los Clientes Premium</h4>
                                        <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-6">Aprende a identificar y atraer a aquellos clientes que valoran la calidad por encima de la tarifa.</p>
                                        
                                        <div className="mt-auto">
                                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-1/3 rounded-full" />
                                            </div>
                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Progreso del Módulo</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
