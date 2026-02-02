'use client';

import { motion } from 'framer-motion';
import { UserPlus, CreditCard, Layout, MessageSquare } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: <UserPlus className="w-8 h-8 text-aviva-primary" />,
            title: "1. Regístrate",
            description: "Crea gratis tu perfil profesional como conductor y sube tus documentos en minutos."
        },
        {
            icon: <CreditCard className="w-8 h-8 text-aviva-secondary" />,
            title: "2. Actívate",
            description: "Paga tu membresía única para desbloquear todos los beneficios."
        },
        {
            icon: <Layout className="w-8 h-8 text-blue-500" />,
            title: "3. Tu Propia Web",
            description: "Obtén tu sitio personalizado y código de referido para fidelizar."
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-green-500" />,
            title: "4. Gana Directo",
            description: "Recibe clientes en tu WhatsApp y quédate con el 100% del pago."
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-aviva-navy mb-4">
                        ¿Cómo funciona AvivaGo?
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Un proceso simple diseñado para que tú seas el dueño de tu negocio de transporte.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-12 -z-10"></div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
                        >
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-aviva-navy mb-3">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
