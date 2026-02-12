'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    User,
    MapPin,
    Car,
    Dog,
    Briefcase,
    Heart,
    Tag
} from 'lucide-react';

export default function BookingDemo() {
    const [selectedService, setSelectedService] = useState('executive');

    const services = [
        { id: 'executive', name: 'Ejecutivo', icon: Briefcase },
        { id: 'pet', name: 'Pet Friendly', icon: Dog },
        { id: 'senior', name: 'Tercera Edad', icon: Heart },
    ];

    return (
        <section className="py-12 bg-gray-50 overflow-hidden" id="how-it-works">
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Text Content */}
                    <div className="lg:w-1/2 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold font-display leading-tight">
                            Así verán tus clientes <br />
                            <span className="text-aviva-primary">Tu Sitio Web</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            Ofrece una experiencia de reserva profesional y personalizada. Tus clientes eligen el servicio que necesitan en segundos.
                        </p>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-aviva-primary">
                                    <Car size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Flota Personalizada</h3>
                                    <p className="text-gray-500">Muestra tus vehículos y servicios especiales.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-aviva-primary">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Agenda Automatizada</h3>
                                    <p className="text-gray-500">Tus clientes ven tu disponibilidad real.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-aviva-primary">
                                    <Tag size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Especialidades y Equipamiento:</h3>
                                    <p className="text-gray-500">Tus clientes podrán conocer tus servicios únicos (Traslado foráneo, Silla bebé, Anfitrión de extranjeros, Pet-Friendly y muchas más).</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Demo */}
                    <div className="lg:w-1/2 w-full max-w-md mx-auto">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            {/* Mock Browser Header */}
                            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <div className="ml-4 bg-white rounded-md px-3 py-1 text-xs text-gray-400 flex-1 text-center">
                                    www.avivago.mx
                                </div>
                            </div>

                            {/* Mock App Content */}
                            <div className="p-6 space-y-6">
                                {/* Driver Profile Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                                        <img
                                            src="/images/elena-profile.jpg"
                                            alt="Elena García"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">Elena García</p>
                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Disponible
                                        </div>
                                    </div>
                                </div>

                                {/* Search Filters */}
                                <div className="space-y-4">
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="¿A dónde vamos?"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl text-sm pl-10 pr-4 py-3 focus:ring-1 focus:ring-aviva-primary outline-none"
                                            readOnly
                                            value="Ciudad de México"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl text-xs pl-9 pr-2 py-3 outline-none"
                                                readOnly
                                                value="Hoy"
                                            />
                                        </div>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl text-xs pl-9 pr-2 py-3 outline-none"
                                                readOnly
                                                value="1 Pasajero"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Service Selection (No Prices) */}
                                <div>
                                    <p className="text-sm font-bold text-gray-700 mb-3">Filtrar por Especialidad</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {services.map((service) => (
                                            <div
                                                key={service.id}
                                                onClick={() => setSelectedService(service.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedService === service.id
                                                    ? 'border-aviva-primary bg-blue-50/50 ring-1 ring-aviva-primary/20'
                                                    : 'border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${selectedService === service.id
                                                        ? 'bg-aviva-primary text-white'
                                                        : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        <service.icon size={18} />
                                                    </div>
                                                    <span className={`font-medium ${selectedService === service.id ? 'text-aviva-navy' : 'text-gray-600'
                                                        }`}>{service.name}</span>
                                                </div>
                                                {selectedService === service.id && (
                                                    <div className="w-2 h-2 rounded-full bg-aviva-primary animate-pulse"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button className="w-full bg-aviva-primary text-white py-4 rounded-xl font-bold hover:bg-aviva-primary/90 transition-colors shadow-lg shadow-aviva-primary/20">
                                    Consultar Disponibilidad
                                </button>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
