'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function Comparison() {
    return (
        <section className="py-8 bg-white" id="comparison">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display px-2">
                        El Modelo Antiguo vs. <span className="text-aviva-primary">Tu Propio Negocio</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                        Deja de ser un número más en una aplicación. Con AvivaGo, tú construyes tu marca y conservas tus ganancias.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto relative">
                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-full blur-3xl -z-10"></div>

                    {/* Apps Tradicionales */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-200"
                    >
                        <h3 className="text-xl md:text-2xl font-bold text-gray-500 mb-2">Apps Tradicionales</h3>
                        <p className="text-xs md:text-sm text-gray-400 mb-6 md:mb-8 font-medium italic">Uber, Didi, inDrive, Cabify...</p>

                        <ul className="space-y-4 md:space-y-6">
                            <ComparisonItem icon={<X size={18} />} color="red" title="Comisiones Altas (25-40%)" text="Pierdes casi la mitad de tu trabajo." />
                            <ComparisonItem icon={<X size={18} />} color="red" title="Clientes de la App" text="No eres dueño de tu cartera." />
                            <ComparisonItem icon={<X size={18} />} color="red" title="Pagos Retenidos" text="Esperas días para tu dinero." />
                            <ComparisonItem icon={<X size={18} />} color="red" title="Sin Marca Personal" text="Eres un conductor anónimo más." />
                        </ul>
                    </motion.div>

                    {/* AvivaGo */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-aviva-navy text-white rounded-3xl p-6 md:p-8 border border-aviva-primary/30 relative overflow-hidden shadow-2xl md:scale-105 z-10"
                    >
                        <div className="absolute top-0 right-0 p-3 md:p-4">
                            <span className="bg-aviva-secondary text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Recomendado</span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Tu Negocio AvivaGo</h3>
                        <p className="text-xs md:text-sm text-blue-200 mb-6 md:mb-8 font-medium">Tu Negocio Completo y Listo</p>

                        <ul className="space-y-4 md:space-y-6">
                            <ComparisonItem icon={<Check size={18} />} color="green" title="0% Comisiones" text="Te quedas con el 100% de cada viaje." isAviva />
                            <ComparisonItem icon={<Check size={18} />} color="green" title="Clientes Propios" text="Fideliza pasajeros y crea tu base." isAviva />
                            <ComparisonItem icon={<Check size={18} />} color="green" title="Pagos Directos" text="Usa la plataforma que prefieras." isAviva />
                            <ComparisonItem icon={<Check size={18} />} color="green" title="Tu Marca Personal" text="Web con tu nombre y foto real." isAviva />
                            <ComparisonItem icon={<Check size={18} />} color="green" title="Bonos recurrentes" text="Gana por cada referido activo." isAviva />
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function ComparisonItem({ icon, color, title, text, isAviva = false }: { icon: React.ReactNode, color: string, title: string, text: string, isAviva?: boolean }) {
    return (
        <li className="flex items-start gap-3 md:gap-4">
            <div className={`p-1 rounded-full mt-1 shrink-0 ${color === 'red' ? 'bg-red-100 text-red-500' : 'bg-green-500/20 text-green-400'}`}>
                {icon}
            </div>
            <div>
                <p className={`font-bold text-sm md:text-base ${isAviva ? 'text-white' : 'text-gray-700'}`}>{title}</p>
                <p className={`text-xs md:text-sm ${isAviva ? 'text-blue-200' : 'text-gray-500'}`}>{text}</p>
            </div>
        </li>
    );
}
