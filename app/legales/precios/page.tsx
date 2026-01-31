import React from 'react';
import { Coffee, Shield, PiggyBank, Users, CheckCircle2 } from 'lucide-react';

export default function PreciosPage() {
    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-[#0F2137]">Precios Justos y Transparentes</h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    Sin algoritmos ocultos. Sin tarifas dinámicas. Solo una contribución justa para mantener nuestra comunidad segura y funcional.
                </p>
            </div>

            {/* Pricing Logic Section */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Conductor Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0F2137] to-[#1a2f4d] rounded-2xl shadow-xl text-white p-8 group transition-all hover:shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield size={120} />
                    </div>

                    <h3 className="text-xl font-medium text-blue-200 mb-2">Membresía para Conductores</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold text-white">$524</span>
                        <span className="text-blue-200">MXN / año</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" size={18} />
                            <span className="text-gray-200 text-sm">Perfil publicado en el catálogo premium.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" size={18} />
                            <span className="text-gray-200 text-sm">Validación de identidad y confianza.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" size={18} />
                            <span className="text-yellow-400 font-bold text-sm">100% de tus ingresos son tuyos. 0% Comisiones.</span>
                        </li>
                    </ul>

                    {/* Coffee Comparison - High Impact */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-orange-400">
                                <Coffee size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100 font-medium">Piénsalo así:</p>
                                <p className="text-xs text-blue-200 leading-relaxed mt-1">
                                    Tu inversión diaria en tu negocio es de <strong className="text-white">menos de $1.50 MXN</strong>.
                                    <br />
                                    ¡Eso es mucho menos que un chicle, un boleto de metro o cualquier gasto hormiga!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pasajero Card */}
                <div className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
                    <h3 className="text-xl font-medium text-gray-500 mb-2">Pasajeros</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold text-[#0F2137]">$18</span>
                        <span className="text-gray-500">MXN / contacto</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Este pequeño pago ('Unlock Fee') nos ayuda a filtrar usuarios reales, evitando bots y bromas para nuestros conductores, y mantiene la plataforma segura.
                    </p>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="flex items-center gap-2 font-bold text-[#0066FF] mb-2">
                            <Users size={18} />
                            ¿Por qué cobramos esto?
                        </h4>
                        <p className="text-sm text-gray-700">
                            No somos una corporación gigante. Somos una comunidad.
                            Estos micropagos costean los servidores, las validaciones de seguridad y el soporte.
                            <br /><br />
                            <strong>Entre todos hacemos que AvivaGo sea sostenible sin cobrar comisiones abusivas.</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Philosophy Section */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center mt-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
                    <PiggyBank className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-[#0F2137] mb-4">Economía Colaborativa Real</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                    Al eliminar al intermediario que se lleva el 30-40% de cada viaje, logramos que el conductor gane más y el pasajero pague lo justo.
                    Nuestros precios de membresía y contacto son simbólicos comparados con el valor de la libertad y la seguridad que ofrecemos.
                </p>
            </div>
        </div>
    );
}
