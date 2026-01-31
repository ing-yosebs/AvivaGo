'use client';

import Link from 'next/link';
import { User, Search, MapPin, Star, Menu } from 'lucide-react';
import AvivaLogo from '@/app/components/AvivaLogo';

export default function PassengerCTA() {
    const mockDrivers = [
        { name: "Roberto Gómez", car: "Nissan Versa", rating: 4.9, image: "/images/mock-drivers/driver_roberto.png" },
        { name: "Alejandra Ruiz", car: "Chevrolet Aveo", rating: 5.0, image: "/images/mock-drivers/driver_alejandra.png" },
        { name: "Carlos Diaz", car: "Kia Rio", rating: 4.8, image: "/images/mock-drivers/driver_carlos.png" }
    ];

    return (
        <section className="py-20 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] p-8 md:p-12 lg:p-16 relative overflow-hidden">

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-20">

                        {/* Content */}
                        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-2">
                                <User size={14} />
                                Para Pasajeros
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-aviva-navy loading-tight">
                                Viaja mejor, <br />
                                <span className="text-blue-600">viaja con confianza</span>
                            </h2>

                            <p className="text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
                                En nuestro catálogo de conductores podrás buscar profesionales que se adapten a tus necesidades específicas (mascotas, adultos mayores, etc.) y elige quién te lleva. Tú tienes el control total de tu viaje.
                            </p>

                            <ul className="space-y-3 text-left max-w-md mx-auto md:mx-0 pt-2">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="bg-white p-1.5 rounded-full shadow-sm text-green-500">
                                        <Search size={16} />
                                    </div>
                                    Explora perfiles detallados de conductores
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-500">
                                        <MapPin size={16} />
                                    </div>
                                    Solicita viajes directos y seguros
                                </li>
                            </ul>

                            <div className="pt-6 flex flex-col items-center md:items-start gap-3">
                                <span className="text-sm font-bold text-blue-600 uppercase tracking-wide flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Inscripción 100% Gratuita
                                </span>
                                <Link
                                    href="/register?role=passenger"
                                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto"
                                >
                                    <User size={20} />
                                    Registrarme como Pasajero
                                </Link>
                            </div>
                        </div>

                        {/* Visual/Mockup */}
                        <div className="w-full md:w-1/2 md:translate-x-10 lg:translate-x-0">
                            <div className="relative mx-auto max-w-sm md:max-w-md transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-6 opacity-10"></div>
                                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 relative">
                                    {/* Mockup UI elements representing user view */}
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <AvivaLogo className="h-6 w-auto" />
                                            <span className="text-xs font-bold text-aviva-navy opacity-80">Pasajero</span>
                                        </div>
                                        <div className="h-8 w-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                            <Menu size={16} />
                                        </div>
                                    </div>

                                    <div className="mb-3 px-1">
                                        <h3 className="text-sm font-bold text-gray-800">Conductores Disponibles</h3>
                                        <p className="text-[10px] text-gray-500">En tu zona</p>
                                    </div>

                                    <div className="space-y-3">
                                        {mockDrivers.map((driver, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <img
                                                    src={driver.image}
                                                    alt={driver.name}
                                                    className="h-12 w-12 rounded-full border border-gray-100 bg-gray-50"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-gray-800 text-sm">{driver.name}</h4>
                                                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                                            <Star size={10} fill="currentColor" />
                                                            {driver.rating}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                                        {driver.car}
                                                    </p>
                                                </div>
                                                <div className="h-8 w-8 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center text-blue-500 transition-colors">
                                                    <ArrowRightIcon />
                                                </div>
                                            </div>
                                        ))}
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

function ArrowRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    )
}
