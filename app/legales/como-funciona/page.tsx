'use client';

import React, { useState } from 'react';
import { User, Car, Search, MessageCircle, Star, ShieldCheck, Heart, Users, DollarSign, Coffee, CreditCard } from 'lucide-react';

export default function ComoFuncionaPage() {
    const [activeTab, setActiveTab] = useState<'passenger' | 'driver'>('passenger');

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-[#0F2137]">¿Cómo funciona AvivaGo?</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Somos la primera comunidad de confianza que conecta a pasajeros con conductores privados de forma directa, sin intermediarios y sin comisiones por viaje.
                </p>

                {/* Role Toggles */}
                <div className="flex justify-center mt-8">
                    <div className="bg-gray-100 p-1 rounded-full inline-flex relative">
                        <div
                            className={`absolute inset-y-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out ${activeTab === 'passenger' ? 'left-1 right-1/2' : 'left-1/2 right-1'}`}
                        ></div>
                        <button
                            onClick={() => setActiveTab('passenger')}
                            className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors z-10 ${activeTab === 'passenger' ? 'text-[#0047AB]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Soy Pasajero
                        </button>
                        <button
                            onClick={() => setActiveTab('driver')}
                            className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors z-10 ${activeTab === 'driver' ? 'text-[#FF8C00]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Soy Conductor
                        </button>
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <div className={`grid gap-8 relative grid-cols-1 md:grid-cols-2 lg:grid-cols-4`}>
                {/* Connecting Line (Desktop) - Only show for passenger view where layout is predictable */}


                {activeTab === 'passenger' ? (
                    <>
                        <StepCard
                            icon={<User className="w-8 h-8 text-[#0066FF]" />}
                            title="1. Regístrate y Valida"
                            description="Crea tu cuenta gratuita y completa la validación básica de identidad para asegurar la confianza de la comunidad."
                        />
                        <StepCard
                            icon={<Search className="w-8 h-8 text-[#0066FF]" />}
                            title="2. Explora el Directorio"
                            description="Navega por perfiles verídicos. Filtra por tipo de auto, servicios especiales y lee reseñas reales."
                        />
                        <StepCard
                            icon={<DollarSign className="w-8 h-8 text-[#0066FF]" />}
                            title="3. Desbloquea el Contacto"
                            description="Paga una micro-cuota única ($18 MXN) para obtener el WhatsApp directo del conductor que te gustó."
                        />
                        <StepCard
                            icon={<MessageCircle className="w-8 h-8 text-[#0066FF]" />}
                            title="4. Acuerda tu Viaje"
                            description="Escribe directamente al conductor, negocia el precio sin comisiones y viaja seguro."
                        />
                    </>
                ) : (
                    <>
                        <StepCard
                            icon={<User className="w-8 h-8 text-[#FF8C00]" />}
                            title="1. Crea tu Perfil"
                            description="Regístrate, sube tus documentos y fotos de tu vehículo. Destaca tus habilidades y servicios especiales."
                        />
                        <StepCard
                            icon={<CreditCard className="w-8 h-8 text-[#FF8C00]" />}
                            title="2. Pagar Membresía"
                            description="Realiza el pago de tu anualidad para activar tu cuenta y acceder a todos los beneficios de la comunidad."
                        />
                        <StepCard
                            icon={<ShieldCheck className="w-8 h-8 text-[#FF8C00]" />}
                            title="3. Verifícate"
                            description="Pasas por nuestro proceso de validación de identidad para obtener el sello de 'Conductor Confiable'."
                        />
                        <StepCard
                            icon={<Users className="w-8 h-8 text-[#FF8C00]" />}
                            title="4. Recibe Clientes"
                            description="Los pasajeros te contactan directamente a tu WhatsApp. Tú fijas tus precios, tus horarios y conservas el 100% de tus viajes."
                        />
                    </>
                )}
            </div>

            {/* Benefits Grid */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-[#0F2137] mb-8 text-center">
                    {activeTab === 'passenger' ? 'Beneficios para Pasajeros' : 'Beneficios para Conductores'}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {activeTab === 'passenger' ? (
                        <>
                            <BenefitRow icon={<ShieldCheck className="text-green-600" />} text="Conductores con identidad validada." />
                            <BenefitRow icon={<Star className="text-yellow-500" />} text="Servicio personalizado y programado." />
                            <BenefitRow icon={<Users className="text-blue-500" />} text="Apoyas directamente a la economía local." />
                            <BenefitRow icon={<DollarSign className="text-purple-500" />} text="Precios justos sin tarifas dinámicas ocultas." />
                        </>
                    ) : (
                        <>
                            <BenefitRow icon={<DollarSign className="text-green-600" />} text="0% Comisiones. El viaje es 100% tuyo." />
                            <BenefitRow icon={<Users className="text-blue-500" />} text="Construye tu propia cartera de clientes leales." />
                            <BenefitRow icon={<ShieldCheck className="text-purple-500" />} text="Comunidad segura y filtrada." />
                            <BenefitRow icon={<Heart className="text-red-500" />} text="Capacitación y respaldo de la Fundación Aviva." />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function StepCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                {icon}
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function BenefitRow({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                {icon}
            </div>
            <span className="font-medium text-gray-700">{text}</span>
        </div>
    );
}
