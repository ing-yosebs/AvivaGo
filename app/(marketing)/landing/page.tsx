'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StickyCTA from '@/app/components/landing/StickyCTA';
import { Check, X, Shield, DollarSign, Smartphone, Users, ChevronRight, Star } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="font-sans selection:bg-blue-100">

            <main className="pt-16 sm:pt-20 pb-24 md:pb-12">
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -z-10 w-2/3 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-60 rounded-l-[100px]" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-24 md:pb-32">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8 animate-in slide-in-from-left duration-700">
                                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                                    </span>
                                    Nueva era del transporte privado
                                </div>
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                                    Tu Negocio.<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                        Tu Dinero.
                                    </span>
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                                    Olvídate de pagar 30% en comisiones o rentas mensuales costosas.
                                    Únete a la red segura donde <b>tú cobras todo</b>.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                                    >
                                        Empieza por $524 MXN
                                        <ChevronRight className="ml-2 w-5 h-5" />
                                    </Link>
                                    <Link
                                        href="/comunidad"
                                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-white hover:shadow-lg transition-all"
                                    >
                                        Ver Comunidad
                                    </Link>
                                </div>

                                <div className="flex items-center gap-4 text-sm font-medium text-gray-500 pt-2">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 bg-cover" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})` }} />
                                        ))}
                                    </div>
                                    <p>+500 conductores ya son libres</p>
                                </div>
                            </div>

                            <div className="relative animate-in slide-in-from-right duration-700 delay-200 hidden md:block">
                                <div className="relative z-10 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                    <Image
                                        src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1000&auto=format&fit=crop"
                                        alt="Conductor exitoso"
                                        width={600}
                                        height={450}
                                        className="rounded-2xl w-full object-cover h-[450px]"
                                    />

                                    {/* Float Card */}
                                    <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs animate-bounce-slow">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                <DollarSign className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium">Ganancia Semanal</p>
                                                <p className="text-2xl font-bold text-gray-900">$12,450</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full w-[95%]"></div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 text-right">0% comisión pagada</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Comparison Section (The "Attack") */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                                ¿Por qué regalar tu trabajo?
                            </h2>
                            <p className="text-xl text-gray-600">
                                Compara y decide. En AvivaGo no eres un empleado, eres un socio real.
                            </p>
                        </div>

                        <div className="overflow-x-auto pb-8 -mx-4 px-4">
                            <table className="w-full min-w-[700px] border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-4 text-left text-gray-500 font-medium w-1/4">Plataforma</th>
                                        <th className="p-4 text-center text-gray-500 font-medium">Apps Tradicionales</th>
                                        <th className="p-4 text-center text-gray-500 font-medium">Herramientas "Privadas"</th>
                                        <th className="p-4 text-center relative w-1/4">
                                            <div className="absolute -top-6 left-0 right-0 bg-blue-600 text-white text-xs font-bold py-1 rounded-t-lg mx-4">
                                                RECOMENDADO
                                            </div>
                                            <div className="bg-white border-x border-t border-gray-200 rounded-t-2xl py-4 flex items-center justify-center gap-2">
                                                <div className="font-extrabold text-xl text-blue-900">AvivaGo</div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {[
                                        { label: "Comisión por viaje", trad: "25% - 40%", tool: "0%", aviva: "0%", highlight: true },
                                        { label: "Costo de Configuración", trad: "$0", tool: "$597 USD (Aprox $10k MXN)", aviva: "$0", highlight: false },
                                        { label: "Mensualidad", trad: "$0", tool: "$29 USD/mes", aviva: "$0/mes", highlight: true },
                                        { label: "Costo Anual", trad: "$0", tool: "~$9,000 MXN", aviva: "$524 MXN", highlight: true },
                                        { label: "Dueño del Cliente", trad: <X className="w-5 h-5 text-red-500 mx-auto" />, tool: <Check className="w-5 h-5 text-green-500 mx-auto" />, aviva: <Check className="w-5 h-5 text-green-500 mx-auto" />, highlight: false },
                                        { label: "Comunidad/Respaldo", trad: "Soporte Chat", tool: "Soporte Email", aviva: "Fundación Aviva", highlight: false },
                                    ].map((row, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : ""}>
                                            <td className="p-6 font-semibold border-b border-gray-100">{row.label}</td>
                                            <td className="p-6 text-center border-b border-gray-100 text-gray-500">{row.trad}</td>
                                            <td className="p-6 text-center border-b border-gray-100 text-gray-500 bg-gray-50/50">{row.tool}</td>
                                            <td className={`p-6 text-center border-x border-gray-200 ${idx === 5 ? 'border-b rounded-b-2xl' : 'border-b'} bg-white relative`}>
                                                <div className={`font-bold ${row.highlight ? 'text-green-600 text-lg' : 'text-gray-900'}`}>
                                                    {row.aviva}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Benefits Grid */}
                <section className="py-20 md:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Shield className="w-8 h-8 text-blue-600" />,
                                    title: "Seguridad Real",
                                    desc: "Cada usuario y conductor es validado. Nuestra fundación respalda cada interacción para que manejes tranquilo."
                                },
                                {
                                    icon: <Smartphone className="w-8 h-8 text-indigo-600" />,
                                    title: "Trato Directo",
                                    desc: "El pasajero te contacta a ti. Negocias tú. Cobras tú. Sin algoritmos ocultos ni tarifas dinámicas opacas."
                                },
                                {
                                    icon: <Users className="w-8 h-8 text-cyan-600" />,
                                    title: "Comunidad Viva",
                                    desc: "No eres un número. Eres parte de una red de profesionales que se apoyan, comparten alertas y crecen juntos."
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-blue-900 text-white rounded-[40px] mx-4 sm:mx-6 lg:mx-8 px-6 py-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/3"></div>

                    <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-5xl font-display font-bold">
                            ¿Listo para retomar el control?
                        </h2>
                        <p className="text-blue-100 text-lg">
                            Únete hoy por solo $524 MXN al año y deja de pagar comisiones de por vida.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center px-8 py-4 text-blue-900 bg-white rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Registrarme Ahora
                            </Link>
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center justify-center px-8 py-4 text-white bg-blue-800/50 border border-blue-700/50 rounded-2xl font-bold text-lg hover:bg-blue-800 transition-colors"
                            >
                                Ya tengo cuenta
                            </Link>
                        </div>
                        <p className="text-sm text-blue-300 pt-4">
                            Garantía de satisfacción. Si no recuperas tu inversión en 30 días, te devolvemos tu dinero.
                        </p>
                    </div>
                </section>
            </main>

            <StickyCTA />
        </div>
    );
}
