"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Car,
    QrCode,
    TrendingUp,
    ShieldCheck,
    Share2,
    CheckCircle2,
    Award,
    Wallet,
    ArrowRight,
    Download
} from 'lucide-react';

export default function AffiliateProgramPage() {
    const [activeTab, setActiveTab] = useState<'driver' | 'passenger'>('driver');
    const [referralCount, setReferralCount] = useState(10);

    // Calculator constants
    const ONE_TIME_BONUS_BRONZE = 80;
    const RECURRING_COMMISSION_BRONZE = 40;

    const ONE_TIME_BONUS_SILVER = 100;
    const RECURRING_COMMISSION_SILVER = 50;

    const ONE_TIME_BONUS_GOLD = 120;
    const RECURRING_COMMISSION_GOLD = 60;

    // Calculate earnings dynamically based on tier
    const calculateEarnings = (count: number) => {
        let oneTime = 0;
        let recurring = 0;
        let tier = 'Bronce';

        if (count <= 10) {
            oneTime = count * ONE_TIME_BONUS_BRONZE;
            recurring = count * RECURRING_COMMISSION_BRONZE;
            tier = 'Bronce';
        } else if (count <= 50) {
            oneTime = count * ONE_TIME_BONUS_SILVER;
            recurring = count * RECURRING_COMMISSION_SILVER;
            tier = 'Plata';
        } else {
            oneTime = count * ONE_TIME_BONUS_GOLD;
            recurring = count * RECURRING_COMMISSION_GOLD;
            tier = 'Oro';
        }

        return { oneTime, recurring, total: oneTime + recurring, tier };
    };

    const earnings = calculateEarnings(referralCount);

    return (
        <div className="space-y-8 md:space-y-12 pt-0 pb-4 md:pt-2 md:pb-10">
            {/* Hero Section */}
            <section className="text-center space-y-4">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-center gap-2 mb-6">
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                            Programa de Embajadores
                        </span>
                        <span className="inline-block py-1 px-3 rounded-full bg-indigo-900 text-white text-sm font-semibold">
                            Exclusivo para Conductores
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                        AvivaGo <span className="text-blue-600">Red de Seguridad, Confianza y Certeza</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Multiplica tus ingresos construyendo la red. Gana invitando a otros conductores o registrando pasajeros.
                    </p>
                </motion.div>

                {/* Tab Toggle */}
                <div className="flex justify-center mt-4 md:mt-6">
                    <div className="bg-gray-100 p-1.5 rounded-xl inline-flex relative">
                        <button
                            onClick={() => setActiveTab('driver')}
                            className={`relative z-10 px-4 md:px-8 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'driver' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Invitar Conductores
                        </button>
                        <button
                            onClick={() => setActiveTab('passenger')}
                            className={`relative z-10 px-4 md:px-8 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'passenger' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Invitar Pasajeros
                        </button>
                        <motion.div
                            layoutId="tab-highlight"
                            className="absolute top-1.5 bottom-1.5 left-1.5 bg-white shadow-sm rounded-lg"
                            initial={false}
                            animate={{
                                x: activeTab === 'driver' ? 0 : '100%',
                                width: '50%'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </div>
                </div>
            </section>

            <AnimatePresence mode='wait'>
                {activeTab === 'driver' ? (
                    <motion.div
                        key="driver"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8 md:space-y-12"
                    >
                        {/* Driver Benefits Cards */}
                        <div className="space-y-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Tu Crecimiento en la Red</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Invita a colegas conductores y genera ingresos recurrentes mientras construimos juntos la red más segura.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Nivel Bronce",
                                    range: "1-10 Referidos",
                                    bonus: "$80 MXN",
                                    recurring: "$40 MXN",
                                    color: "bg-orange-50 border-orange-200",
                                    iconColor: "text-orange-600"
                                },
                                {
                                    title: "Nivel Plata",
                                    range: "11-50 Referidos",
                                    bonus: "$100 MXN",
                                    recurring: "$50 MXN",
                                    color: "bg-gray-100 border-gray-300",
                                    iconColor: "text-gray-600"
                                },
                                {
                                    title: "Nivel Oro",
                                    range: "51+ Referidos",
                                    bonus: "$120 MXN",
                                    recurring: "$60 MXN",
                                    color: "bg-yellow-50 border-yellow-200",
                                    iconColor: "text-yellow-600"
                                }
                            ].map((tier, idx) => (
                                <div key={idx} className={`p-6 rounded-2xl border ${tier.color} relative overflow-hidden`}>
                                    <div className={`absolute top-0 right-0 p-4 opacity-10 ${tier.iconColor}`}>
                                        <Award size={64} />
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${tier.iconColor}`}>{tier.title}</h3>
                                    <p className="text-sm font-medium text-gray-500 mb-4">{tier.range}</p>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 size={16} className={tier.iconColor} />
                                            Bono Activación: <span className="font-bold">{tier.bonus}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <TrendingUp size={16} className={tier.iconColor} />
                                            Recurrente Anual: <span className="font-bold">{tier.recurring}</span>
                                        </li>
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Activation Bonus Clarification */}
                        <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl space-y-4">
                            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                                ¡Haz crecer la comunidad AvivaGo y gana! 🤝
                            </h3>
                            <p className="text-blue-800">
                                Recibe tu <strong>Bono de Activación</strong> (desde $80 hasta $120 MXN) por cada colega que sumes a AvivaGo.
                            </p>
                            <div className="bg-white/60 p-6 rounded-2xl border border-blue-200">
                                <p className="text-blue-900 leading-relaxed">
                                    <span className="font-bold text-blue-600">La Regla de Oro:</span> Tu bono se liberará en tu Saldo AvivaGo en el momento exacto en que tu referido complete el pago de su <strong>Membresía Anual ($524 MXN)</strong>. Sin letras chiquitas: si él se activa y paga, tú ganas.
                                </p>
                            </div>
                            <p className="text-sm text-blue-600/80 italic">
                                <strong>Nota:</strong> El saldo pasará a "Disponible" tras el periodo de validación de seguridad de 15 días.
                            </p>
                        </div>

                        {/* Earnings Calculator */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
                                <h2 className="text-2xl font-bold mb-2">Calculadora de Ganancias</h2>
                                <p className="text-blue-100">Estima cuánto podrías ganar invitando a otros conductores</p>
                            </div>
                            <div className="p-8 md:p-12">
                                <div className="mb-10">
                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                        Conductores referidos estimados: <span className="text-2xl font-bold text-blue-600 ml-2">{referralCount}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={referralCount}
                                        onChange={(e) => setReferralCount(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                                        <span>1</span>
                                        <span>100+</span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                    <div className="pt-4 md:pt-0">
                                        <p className="text-sm text-gray-500 mb-1">Nivel Alcanzado</p>
                                        <p className={`text-2xl font-bold ${earnings.tier === 'Oro' ? 'text-yellow-600' :
                                            earnings.tier === 'Plata' ? 'text-gray-600' : 'text-orange-600'
                                            }`}>{earnings.tier}</p>
                                    </div>
                                    <div className="pt-4 md:pt-0">
                                        <p className="text-sm text-gray-500 mb-1">Bono Único Total</p>
                                        <p className="text-2xl font-bold text-gray-900">${earnings.oneTime.toLocaleString()} MXN</p>
                                    </div>
                                    <div className="pt-4 md:pt-0">
                                        <p className="text-sm text-gray-500 mb-1">Ingreso Anual Recurrente</p>
                                        <p className="text-2xl font-bold text-green-600">${earnings.recurring.toLocaleString()} MXN</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Key Information */}
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <ArrowRight size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">Regla de Salto</h4>
                                    <p className="text-gray-600">El nuevo nivel de compensación aplica a partir del siguiente referido (N+1). ¡Sigue creciendo para ganar más!</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">Recurrencia Vitalicia</h4>
                                    <p className="text-gray-600">Las comisiones de renovación se pagan mientras tú y tu referido permanezcan activos.</p>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                ) : (
                    <motion.div
                        key="passenger"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8 md:space-y-12"
                    >
                        {/* Passenger Benefits for DRIVERS */}
                        <div className="bg-indigo-50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 text-indigo-600">
                                <Users size={200} />
                            </div>
                            <div className="relative z-10 max-w-2xl">
                                <h2 className="text-2xl font-bold text-indigo-900 mb-6">Invita Pasajeros y Gana</h2>
                                <p className="text-lg text-indigo-800 mb-8">
                                    Comparte tu código QR con tus pasajeros. Ellos obtienen beneficios y tú generas Saldo AvivaGo por volumen.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    {/* What Driver Gets */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                                            <Wallet size={20} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Tu Recompensa (Conductor)</h3>
                                        <ul className="text-sm text-gray-600 space-y-2">
                                            <li className="flex items-center gap-2"><TrendingUp size={14} className="text-green-500" /> $200 MXN en Saldo por cada 20 usuarios nuevos</li>
                                            <li className="flex items-center gap-2"><Award size={14} className="text-orange-500" /> Bono Extra de $1,000 MXN al llegar a 100 usuarios</li>
                                        </ul>
                                    </div>

                                    {/* Argument for Passenger */}
                                    <div className="bg-white/80 p-6 rounded-xl shadow-sm border border-indigo-100">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mb-4">
                                            <QrCode size={20} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Beneficio para tu Pasajero</h3>
                                        <p className="text-xs text-gray-500 mb-3">Úsalo para motivarlos a sumarse:</p>
                                        <ul className="text-sm text-gray-600 space-y-2">
                                            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Desbloquean tu WhatsApp directo</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Acceso gratuito a la red de conductores</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Conversion Rule Section */}
                                <div className="mt-10 pt-8 border-t border-indigo-200/50">
                                    <h3 className="text-xl font-bold text-indigo-900 mb-3">Regla de Conversión Real: Transparencia AvivaGo</h3>
                                    <p className="text-indigo-800 mb-6 leading-relaxed">
                                        Para garantizar la calidad de nuestra red, las comisiones por referir pasajeros se activan mediante la <strong>Conversión Real</strong>.
                                    </p>
                                    <div className="bg-white/60 p-6 rounded-2xl border border-indigo-200 mb-6">
                                        <p className="text-indigo-900 leading-relaxed">
                                            <strong className="text-indigo-600">¿Cómo funciona?</strong> Cuando invitas a un pasajero, él recibe acceso directo a tu contacto. Tu comisión como afiliado se verá reflejada en tu Saldo AvivaGo una vez que dicho pasajero complete su registro y verifique su perfil, asegurando así que es un usuario real dentro de la plataforma.
                                        </p>
                                    </div>
                                    <p className="text-indigo-900 font-bold">
                                        En AvivaGo, premiamos el crecimiento de una red segura y confiable.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-4">
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Fidelización Automática</h3>
                                <p className="text-gray-600 text-sm">El pasajero registrado con tu código queda "vinculado" a ti en el algoritmo.</p>
                            </div>
                            <div className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-4">
                                    <TrendingUp size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Prioridad de Viajes</h3>
                                <p className="text-gray-600 text-sm">Apareces como su "Conductor de Confianza" siempre que estés disponible.</p>
                            </div>
                            <div className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-4">
                                    <Share2 size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Más Visibilidad</h3>
                                <p className="text-gray-600 text-sm">Tus conversiones exitosas te dan "Boost" de visibilidad en la plataforma.</p>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            <hr className="border-gray-200" />

            {/* Marketing / Invitation Section */}
            <section className="space-y-6 md:space-y-10">
                <h2 className="text-3xl font-bold text-gray-900 text-center">Herramientas de Crecimiento</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-100 p-4 rounded-xl mb-4">
                            <QrCode size={64} className="text-gray-800" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Tu QR Dinámico</h3>
                        <p className="text-gray-600 text-sm mb-6">Cada socio tiene un QR único. Úsalo en tu vehículo o muéstralo directamente desde la app.</p>
                        <button className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                            <Download size={18} /> Descargar mi QR
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50 p-6 rounded-2xl flex gap-4 items-start">
                            <div className="mt-1 bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                                <Share2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-900 mb-1">Link de Afiliado</h3>
                                <p className="text-blue-700 text-sm mb-3">Comparte en WhatsApp, Grupos de Facebook y Redes Sociales.</p>
                                <div className="bg-white/50 p-3 rounded-lg text-sm text-blue-800 font-mono break-all border border-blue-100">
                                    avivago.mx/registro?ref=TU_CODIGO
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <h3 className="font-bold text-gray-900 mb-3">Tips de Marketing</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    Explica el valor: "Seguridad y confianza para tu familia".
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    Menciona el beneficio: "Acceso gratis a conductores verificados".
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    Pega tu QR en el respaldo del asiento para pasajeros.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-100 max-w-3xl mx-auto space-y-2">
                <p>
                    Nota: Este programa es temporal y está sujeto a vigencia. AvivaGo se reserva el derecho de cancelar o modificar el programa de afiliados en cualquier momento, deteniendo la recepción de nuevas solicitudes. Los beneficios y comisiones generados y confirmados durante la vigencia del programa serán respetados conforme a las reglas de operación aplicables en ese momento.
                </p>
                <p>
                    <strong>Aviso Fiscal:</strong> Todos los pagos por concepto de bonos o cualquier otra compensación generada a través del programa de afiliados causarán la retención de impuestos correspondiente conforme a la Ley del Impuesto Sobre la Renta (ISR), la Ley del Impuesto al Valor Agregado (IVA) y la Resolución Miscelánea Fiscal vigente.
                </p>
            </div>
        </div>
    );
}
