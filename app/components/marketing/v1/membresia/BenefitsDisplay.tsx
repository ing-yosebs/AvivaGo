'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, 
    Smartphone, 
    Users, 
    TrendingUp, 
    Globe, 
    BadgeCheck
} from 'lucide-react';

function UserShield({ size }: { size: number }) {
    return (
        <div className="relative">
            <Users size={size} />
            <ShieldCheck size={size / 2} className="absolute -bottom-1 -right-1" />
        </div>
    );
}

function CreditCard({ size }: { size: number }) {
    return <Smartphone size={size} />;
}

const benefits = [
    {
        title: "Tu Propia Marca Personal",
        description: "No eres un número anónimo. Construimos tu perfil profesional con nombre, foto y reputación para que seas dueño de tu patrimonio comercial.",
        icon: UserShield,
        color: "bg-blue-600",
        shadow: "shadow-blue-600/20"
    },
    {
        title: "0% Comisiones por Viaje",
        description: "El 100% de la tarifa es tuya. AvivaGo cobra una membresía fija, eliminando las mordidas del 25-40% de las apps tradicionales.",
        icon: TrendingUp,
        color: "bg-emerald-500",
        shadow: "shadow-emerald-500/20"
    },
    {
        title: "Perfil Público (SEO)",
        description: "Tu perfil Pro está optimizado para aparecer en Google. Cuando alguien busque transporte en tu ciudad, tú estarás ahí.",
        icon: Globe,
        color: "bg-indigo-500",
        shadow: "shadow-indigo-500/20"
    },
    {
        title: "Link de Pago Directo",
        description: "Acepta pagos digitales (Stripe, PayPal, etc.) directamente en tu cuenta de banco, sin que AvivaGo sea intermediario del dinero.",
        icon: CreditCard,
        color: "bg-amber-500",
        shadow: "shadow-amber-500/20"
    },
    {
        title: "Kit de Marketing Pro",
        description: "Acceso a diseños profesionales y solicitud de Kit Físico impreso para tu vehículo. Tu negocio se ve impecable.",
        icon: Smartphone,
        color: "bg-purple-500",
        shadow: "shadow-purple-500/20"
    },
    {
        title: "Sello de Verificado",
        description: "Validación biométrica y legal manual. Es el distintivo #1 para ganar la confianza de pasajeros de alto valor.",
        icon: BadgeCheck,
        color: "bg-rose-500",
        shadow: "shadow-rose-500/20"
    }
];

export default function BenefitsDisplay() {
    return (
        <section id="features" className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold text-aviva-navy mb-6 font-display">
                        ¿Por qué ser un <span className="text-blue-600">Conductor Aviva</span>?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Transformamos la manera en que gestionas tu servicio con herramientas diseñadas por y para conductores.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group"
                        >
                            <div className="flex items-center gap-5 mb-6">
                                <div className={`w-16 h-16 shrink-0 ${benefit.color} ${benefit.shadow} rounded-[1.25rem] flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                    <benefit.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-aviva-navy leading-tight">{benefit.title}</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
