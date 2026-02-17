'use client';

import { motion } from 'framer-motion';
import { XCircle, AlertTriangle, Clock, Frown } from 'lucide-react';

const pains = [
    {
        icon: XCircle,
        title: "Cancelaciones de último minuto",
        description: "La típica historia: el conductor acepta, ve tu destino o tus notas, y cancela dejándote varado."
    },
    {
        icon: Frown,
        title: "Conductores con mala actitud",
        description: "Sientes que eres una carga porque llevas maletas, mascotas o pides subir las ventanas."
    },
    {
        icon: AlertTriangle,
        title: "Sin ayuda ni empatía",
        description: "¿Necesitas ayuda con las bolsas del súper? En la mayoría de apps, eso 'no está incluido'."
    },
    {
        icon: Clock,
        title: "Incertidumbre total",
        description: "Nunca sabes quién te tocará. ¿Será un profesional o alguien improvisado con prisa?"
    }
];

export default function PainPoints() {
    return (
        <section className="bg-gray-50 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        ¿Cansado de la <span className="text-red-500">lotería</span> del transporte?
                    </h2>
                    <p className="text-lg text-gray-600">
                        Sabemos lo frustrante que es depender de aplicaciones donde eres solo un número más en el algoritmo.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {pains.map((pain, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                                <pain.icon className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{pain.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{pain.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
