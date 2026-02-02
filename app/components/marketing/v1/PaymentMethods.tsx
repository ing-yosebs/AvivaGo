'use client';

import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';

export default function PaymentMethods() {
    return (
        <section className="py-24 bg-gradient-to-br from-white to-blue-50/50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Visual Illustration Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2 relative flex justify-center"
                    >
                        <div className="relative w-full max-w-[500px]">
                            {/* Main Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-blue-100 relative z-10 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-aviva-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-aviva-primary/10 rounded-xl flex items-center justify-center">
                                        <Smartphone className="text-aviva-primary" size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-aviva-navy">Configura tu Cobro</h4>
                                        <p className="text-sm text-gray-500 font-medium">Link de pago activo</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <PaymentRow
                                        icon={<CreditCard className="text-purple-500" size={20} />}
                                        label="Tarjetas de Crédito/Débito"
                                        active={true}
                                        provider="Acepta Visa, MC, AMEX"
                                    />
                                    <PaymentRow
                                        icon={<Zap className="text-blue-500" size={20} />}
                                        label="Mercado Pago / PayPal"
                                        active={true}
                                        provider="Directo a tu cuenta"
                                    />
                                    <PaymentRow
                                        icon={<Banknote className="text-green-500" size={20} />}
                                        label="Transferencia / Efectivo"
                                        active={true}
                                        provider="100% libre de comisión"
                                    />
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <div className="flex items-center justify-between p-4 bg-aviva-navy rounded-2xl text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                <ShieldCheck size={18} className="text-white" />
                                            </div>
                                            <span className="font-bold">Sin Intermediarios</span>
                                        </div>
                                        <span className="text-aviva-secondary font-bold">0% COMISIÓN</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-blue-50 z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">Dinero Directo al Banco</span>
                                </div>
                            </motion.div>

                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-aviva-primary/10 rounded-full blur-3xl -z-10"></div>
                            <div className="absolute top-10 -right-10 w-64 h-64 bg-aviva-secondary/10 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </motion.div>

                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2 space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-aviva-primary text-sm font-bold border border-blue-200">
                            <Globe size={16} />
                            LIBERTAD FINANCIERA TOTAL
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-bold font-display leading-tight text-aviva-navy">
                                Cobros sin Terminal y <span className="text-aviva-primary">Sin Comisiones</span>
                            </h2>
                            <p className="text-xl text-gray-600 font-medium leading-relaxed">
                                Tú decides cómo quieres que te paguen. Configura tus propias reglas y recibe el dinero directamente en tu cuenta de banco, sin que nosotros toquemos un solo peso.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FeatureItem
                                title="Sin Terminal Física"
                                desc="Acepta pagos con tarjeta mediante un link personalizado de Mercado Pago, PayPal o Stripe."
                            />
                            <FeatureItem
                                title="Efectivo y Transferencia"
                                desc="Indica a tus clientes tus datos para pago directo en efectivo o transferencia bancaria."
                            />
                            <FeatureItem
                                title="Pago Directo al Instante"
                                desc="El dinero va de tu cliente a TU cuenta. No tenemos acceso ni intervenimos en tus cobros."
                            />
                            <FeatureItem
                                title="Cómisión 0% AvivaGo"
                                desc="Nuestra plataforma es una herramienta para ti; no nos quedamos con nada de tus servicios."
                            />
                        </div>


                    </motion.div>

                </div>
            </div>
        </section>
    );
}

function PaymentRow({ icon, label, active, provider }: { icon: React.ReactNode, label: string, active: boolean, provider: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h5 className="font-bold text-aviva-navy text-sm md:text-base">{label}</h5>
                    <p className="text-xs text-blue-500 font-bold">{provider}</p>
                </div>
            </div>
            <div className="flex-shrink-0">
                <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-2">
            <h4 className="text-lg font-bold text-aviva-navy flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-aviva-secondary rounded-full"></div>
                {title}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
