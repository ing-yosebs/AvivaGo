'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Users, Award } from 'lucide-react';

const pillars = [
    {
        icon: ShieldCheck,
        title: "Certeza Absoluta",
        description: "Tu tiempo es sagrado. Si un conductor acepta tu viaje, tienes la garantía de que llegará. Sin cancelaciones sorpresa.",
        color: "text-blue-600",
        borderColor: "border-blue-500",
        bg: "bg-blue-50",
        iconColor: "text-blue-500/20"
    },
    {
        icon: Award,
        title: "Conductores Certificados",
        description: "Accede a un catálogo exclusivo de profesionales. Solo conductores que han superado nuestra certificación de confianza aparecen en tu búsqueda.",
        color: "text-orange-600",
        borderColor: "border-orange-500",
        bg: "bg-orange-50",
        iconColor: "text-orange-500/20"
    },
    {
        icon: Users,
        title: "Requerimientos Específicos",
        description: "¿Viajas con tu mascota? ¿Necesitas cajuela amplia? Encuentra al conductor que dice 'SÍ' a lo que tú necesitas.",
        color: "text-purple-600",
        borderColor: "border-purple-500",
        bg: "bg-purple-50",
        iconColor: "text-purple-500/20"
    },
    {
        icon: Heart,
        title: "Trado Digno",
        description: "En AvivaGo, todos merecen respeto. Garantizamos un servicio humano e igualitario para cada pasajero.",
        color: "text-pink-600",
        borderColor: "border-pink-500",
        bg: "bg-pink-50",
        iconColor: "text-pink-500/20"
    }
];

export default function ServicePillars() {
    return (
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        Nuestras <span className="text-aviva-primary">Garantías</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Construimos una plataforma basada en el respeto, la confianza y la seguridad.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {pillars.map((pillar, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative group bg-white rounded-[2rem] p-8 transition-all duration-500 overflow-hidden border-2 h-full ${pillar.borderColor} shadow-sm hover:shadow-xl hover:-translate-y-2`}
                        >
                            {/* Watermark Icon */}
                            <div className="absolute -top-4 -right-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                                <pillar.icon className={`w-36 h-36 ${pillar.iconColor}`} strokeWidth={2} />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{pillar.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {pillar.description}
                                </p>
                            </div>

                            {/* Decorative bottom line */}
                            <div className={`absolute bottom-0 left-0 h-1.5 w-full ${pillar.bg.replace('bg-', 'bg-')}`} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
