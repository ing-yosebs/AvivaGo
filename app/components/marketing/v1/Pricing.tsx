'use client';

import Link from 'next/link';
import { Check, CreditCard, Car } from 'lucide-react';
import AvivaLogo from '@/app/components/AvivaLogo';

export default function Pricing() {
    return (
        <section className="py-12 bg-gray-50" id="pricing">
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
                        Invierte en <span className="text-aviva-primary">Tu Futuro</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Todo lo que necesitas para operar como una empresa profesional, por una fracción de lo que costaría desarrollarlo desde cero.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">

                    {/* Main Pricing Card */}
                    <div className="bg-aviva-navy text-white rounded-3xl p-8 md:p-12 border border-aviva-primary/30 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-aviva-secondary text-white text-xs font-bold px-4 py-2 rounded-bl-xl uppercase tracking-wider">
                            Membresía Anual
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <AvivaLogo className="h-16 w-auto" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Todo Incluido</h3>
                                    <p className="text-blue-200">Tu plataforma profesional lista en minutos.</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <div className="flex items-baseline md:justify-end gap-1">
                                    <span className="text-6xl font-extrabold text-white">$524<sup className="text-2xl font-normal text-blue-300 ml-1">*</sup></span>
                                    <span className="text-xl font-bold text-blue-300">MXN</span>
                                </div>
                                <p className="text-blue-200 text-sm mt-1">Pago único anual</p>
                                <p className="text-aviva-secondary text-sm font-bold mt-1">
                                    3 meses sin intereses con tarjetas de crédito
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5" />
                                    <span className="text-blue-50">Web Personalizada y Profesional</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5" />
                                    <span className="text-blue-50">Sistema de Reservas Automatizado</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5" />
                                    <span className="text-blue-50">Integración con Tu Plataforma de Cobro</span>
                                </li>
                            </ul>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5" />
                                    <span className="text-blue-50">Mantenimiento y Soporte Incluido</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5" />
                                    <span className="text-blue-50">Actualizaciones de Seguridad</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5" />
                                    <span className="text-blue-50">Certificación AvivaGo</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <span className="text-sm font-bold text-white/90 tracking-wide -mb-4">
                                APLICA COMO CONDUCTOR
                            </span>
                            <Link
                                href="/register?role=driver"
                                onClick={() => {
                                    if (typeof window.fbq !== 'undefined') {
                                        window.fbq('track', 'Lead', {
                                            content_name: 'Pricing CTA - Register',
                                            content_category: 'Drivers'
                                        });
                                    }
                                    if (typeof window.ttq !== 'undefined') {
                                        window.ttq.track('Lead', {
                                            content_name: 'Pricing CTA - Register',
                                            content_category: 'Drivers'
                                        });
                                    }
                                }}
                                className="w-full bg-aviva-secondary hover:bg-aviva-secondary/90 text-white font-bold text-xl py-5 rounded-2xl transition-all shadow-lg hover:shadow-aviva-secondary/40 text-center flex items-center justify-center gap-3"
                            >
                                <Car size={24} />
                                Regístrate Gratis
                            </Link>
                            <p className="text-blue-200 text-sm font-medium">
                                * Para hacer público tu perfil como conductor y recibir los bonos y solicitudes de pasajeros es necesario tener una membresía activa.
                            </p>

                            <div className="flex flex-col items-center gap-3">
                                <p className="text-blue-200 text-sm flex items-center gap-2">
                                    <CreditCard size={18} />
                                    Aceptamos tarjetas de Crédito y Débito
                                </p>
                                <div className="flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                                    {/* Placeholder icons for cards */}
                                    <div className="text-xs font-bold border border-white/20 px-2 py-1 rounded">VISA</div>
                                    <div className="text-xs font-bold border border-white/20 px-2 py-1 rounded">MASTERCARD</div>
                                    <div className="text-xs font-bold border border-white/20 px-2 py-1 rounded">AMEX</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
