'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function Comparison() {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">
                        El Modelo Antiguo vs. <span className="text-aviva-primary">Tu Propio Negocio</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Deja de ser un número más en una aplicación. Con AvivaGo, tú construyes tu marca y conservas tus ganancias.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto relative">
                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-full blur-3xl -z-10"></div>

                    {/* Apps Tradicionales */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-gray-50 rounded-3xl p-8 border border-gray-200"
                    >
                        <h3 className="text-2xl font-bold text-gray-500 mb-2">Apps Tradicionales</h3>
                        <p className="text-gray-400 mb-8 font-medium">Uber, Didi, inDrive, Cabify, Bolt, BlaBlaCar, App Taxi CDMX</p>

                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="p-1 bg-red-100 rounded-full text-red-500 mt-1">
                                    <X size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700">Comisiones Altas (25-40%)</p>
                                    <p className="text-sm text-gray-500">Pierdes casi la mitad de tu trabajo.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-1 bg-red-100 rounded-full text-red-500 mt-1">
                                    <X size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700">Clientes de la App</p>
                                    <p className="text-sm text-gray-500">No eres dueño de tu cartera de clientes.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-1 bg-red-100 rounded-full text-red-500 mt-1">
                                    <X size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700">Pagos Retenidos</p>
                                    <p className="text-sm text-gray-500">Esperas días para recibir tu dinero.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-1 bg-red-100 rounded-full text-red-500 mt-1">
                                    <X size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700">Sin Marca Personal</p>
                                    <p className="text-sm text-gray-500">Eres un conductor anónimo más.</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>

                    {/* AvivaGo */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-aviva-navy text-white rounded-3xl p-8 border border-aviva-primary/30 relative overflow-hidden shadow-2xl scale-105 z-10"
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <span className="bg-aviva-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recomendado</span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">Tu Negocio con AvivaGo</h3>
                        <p className="text-blue-200 mb-8 font-medium">Tu Negocio Completo y Listo para Operar</p>

                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="p-1 bg-green-500/20 rounded-full text-green-400 mt-1">
                                    <Check size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">0% Comisiones</p>
                                    <p className="text-sm text-blue-200">Tú te quedas con el 100% de cada viaje.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-1 bg-green-500/20 rounded-full text-green-400 mt-1">
                                    <Check size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Clientes Propios</p>
                                    <p className="text-sm text-blue-200">Fideliza pasajeros y crea tu base de datos.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-1 bg-green-500/20 rounded-full text-green-400 mt-1">
                                    <Check size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Pagos Directos</p>
                                    <p className="text-sm text-blue-200">Usa la plataforma que prefieras (Stripe, Mercado Pago, etc).</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-1 bg-green-500/20 rounded-full text-green-400 mt-1">
                                    <Check size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Tu Marca Personal</p>
                                    <p className="text-sm text-blue-200">Web profesional con tu nombre y foto.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-1 bg-green-500/20 rounded-full text-green-400 mt-1">
                                    <Check size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Bonos de por Vida</p>
                                    <p className="text-sm text-blue-200">Gana por cada cliente que refieras a ver tus datos.</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
