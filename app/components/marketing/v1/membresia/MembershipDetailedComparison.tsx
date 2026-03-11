'use client';

import React from 'react';
import { CheckCircle2, X, Globe, Zap, Trophy } from 'lucide-react';

const detailedBenefits = [
    { name: "Gestión de Cartera de Pasajeros", desc: "Base de datos propia e inalienable.", web: false, free: true, pro: true },
    { name: "Perfil Público (SEO)", desc: "Aparecer en búsquedas de Google.", web: "Limitado", free: "Privado", pro: "Optimizado para Google" },
    { name: "Directorio VIP / Buscador", desc: "Atracción de nuevos pasajeros.", web: false, free: false, pro: "Visible en Directorio" },
    { name: "Perfilamiento Avanzado", desc: "Cuestionario de horarios/zonas.", web: "Básico", free: false, pro: "Configuración Detallada" },
    { name: "Vehículos y Fotos", desc: "Capacidad de lucir tu equipo.", web: "Limitadas", free: "1 Vehículo / 2 Fotos", pro: "Ilimitados / 6 Fotos x Veh" },
    { name: "Link de Pago Directo", desc: "Cobro directo a tu banco.", web: "Complejo", free: false, pro: "Integrado (PayPal/Stripe)" },
    { name: "Kit de Marketing", desc: "Herramientas de venta visual.", web: false, free: "Diseños Digitales", pro: "Catálogo + Solicitud de Kit Físico" },
    { name: "Calculadora Inteligente", desc: "Cálculo exacto de costos/peajes.", web: false, free: "4 usos / mes", pro: "Ilimitado" },
    { name: "Sello de Verificado", desc: "Validación biométrica y legal.", web: false, free: false, pro: "Distintivo Verificado" },
    { name: "Contenido Profesional", desc: "Formación en ventas y marketing.", web: false, free: false, pro: "Acceso Exclusivo" },
];

interface Props {
    pricing: { amount: string; currency: string };
    handleCTAClick: (e: React.MouseEvent) => void;
}

export default function MembershipDetailedComparison({ pricing, handleCTAClick }: Props) {
    return (
        <section id="comparison-pro" className="py-32 bg-white">
            <div className="max-w-6xl mx-auto px-8">
                <div className="text-center mb-16">
                    <span className="text-aviva-primary font-black uppercase tracking-widest text-sm mb-4 block">Infraestructura Profesional</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-aviva-navy mb-6 font-display">
                        Tu Patrimonio: <span className="text-blue-600">Web Propia vs. AvivaGo</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        La versión Free es totalmente funcional para operar. La Membresía Pro es para quienes quieren escalar su marca y dominar su ciudad.
                    </p>
                </div>

                {/* Desktop Comparison Table (Visible on Tablets and Desktop) */}
                <div className="hidden md:block">
                    <div className="rounded-[3rem] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white overflow-hidden">
                        <div className="grid grid-cols-12 bg-aviva-navy text-white p-10 font-bold text-lg sticky top-0 z-20">
                            <div className="col-span-5 flex items-center uppercase tracking-wider text-sm text-white/50">Infraestructura</div>
                            <div className="col-span-2 text-center">
                                <span className="block text-gray-400">Web Propia</span>
                                <span className="block text-xs text-gray-500 font-normal mt-1 line-through">+500 USD</span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="block text-blue-300">Plan Free</span>
                                <span className="block text-xs text-green-400 font-normal mt-1">Gratis</span>
                            </div>
                            <div className="col-span-3 text-center border-l border-white/10 ml-4 pl-4">
                                <span className="block text-blue-400">Membresía Pro</span>
                                <span className="block text-sm text-aviva-secondary font-bold mt-1 tracking-tighter">${pricing.amount} {pricing.currency}/año</span>
                            </div>
                        </div>

                        {detailedBenefits.map((row, i) => (
                            <div key={i} className={`grid grid-cols-12 p-10 border-t border-gray-50 items-center group hover:bg-gray-50/50 transition-colors`}>
                                <div className="col-span-5 pr-4">
                                    <p className="font-bold text-aviva-navy text-lg mb-1">{row.name}</p>
                                    <p className="text-sm text-gray-500 font-medium">{row.desc}</p>
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    {typeof row.web === 'boolean' ? (
                                        row.web ? <CheckCircle2 className="text-gray-400" size={24} /> : <X className="text-gray-200" size={24} />
                                    ) : (
                                        <span className="text-xs font-medium text-gray-400 border border-gray-200 px-3 py-1.5 rounded-full text-center">{row.web}</span>
                                    )}
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    {typeof row.free === 'boolean' ? (
                                        row.free ? <CheckCircle2 className="text-green-500" size={24} /> : <X className="text-gray-300" size={24} />
                                    ) : (
                                        <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-3 py-1.5 rounded-full text-center">{row.free}</span>
                                    )}
                                </div>
                                <div className="col-span-3 flex justify-center border-l border-gray-100 ml-4 pl-4">
                                    {typeof row.pro === 'boolean' ? (
                                        row.pro ? <CheckCircle2 className="text-blue-500" size={32} /> : <X className="text-red-400" size={32} />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                                <CheckCircle2 className="text-blue-500 mb-1" size={24} />
                                            <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-4 py-2 rounded-full text-center">{row.pro}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="grid grid-cols-12 p-12 bg-gray-50 items-center border-t-2 border-aviva-primary/10">
                            <div className="col-span-5">
                                <p className="font-black text-aviva-navy text-2xl uppercase tracking-tighter">Inversión Estimada</p>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Comparativa de Costos</p>
                            </div>
                            <div className="col-span-2 text-center px-4">
                                <p className="text-gray-400 font-black text-xl line-through">+500 USD</p>
                                <p className="text-xs text-gray-400 font-bold uppercase mt-1 leading-tight">Desarrollo Agencia</p>
                            </div>
                            <div className="col-span-2 text-center px-4">
                                <p className="text-green-600 font-black text-2xl uppercase tracking-tighter">Gratis</p>
                                <p className="text-xs text-green-600/60 font-bold uppercase mt-1 leading-tight">Para siempre</p>
                            </div>
                            <div className="col-span-3 text-center ml-4 pl-4">
                                <div className="bg-aviva-secondary text-white rounded-2xl p-5 shadow-xl shadow-aviva-secondary/20 scale-110">
                                    <p className="font-black text-3xl">${pricing.amount} <span className="text-sm opacity-80 uppercase">{pricing.currency}</span></p>
                                    <p className="text-[10px] font-black uppercase tracking-widest mt-1">Pago Único Anual</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unified Mobile Comparison Ledger */}
                <div className="md:hidden">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden relative">
                        {/* Sticky Header for Mobile Context */}
                        <div className="sticky top-0 z-30 bg-aviva-navy text-white px-6 py-4 grid grid-cols-12 items-center gap-2 border-b border-white/10">
                            <div className="col-span-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Beneficio</span>
                            </div>
                            <div className="col-span-2 text-center flex flex-col items-center">
                                <Globe size={12} className="text-gray-400 mb-0.5" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Web</span>
                            </div>
                            <div className="col-span-2 text-center flex flex-col items-center">
                                <Zap size={12} className="text-blue-300 mb-0.5" />
                                <span className="text-[8px] font-bold text-blue-300 uppercase">Free</span>
                            </div>
                            <div className="col-span-2 text-center flex flex-col items-center">
                                <Trophy size={14} className="text-aviva-secondary mb-0.5" />
                                <span className="text-[8px] font-black text-aviva-secondary uppercase">PRO</span>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {detailedBenefits.map((benefit, i) => (
                                <div key={i} className="grid grid-cols-12 items-center px-6 py-5 relative group">
                                    {/* Pro Column Vertical Highlight Background */}
                                    <div className="absolute right-0 top-0 bottom-0 w-[16.666%] bg-blue-50/30 -z-10 border-l border-blue-100/30"></div>
                                    
                                    <div className="col-span-6 pr-2">
                                        <h4 className="font-bold text-aviva-navy text-xs leading-tight mb-0.5 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{benefit.name}</h4>
                                        <p className="text-[9px] text-gray-400 font-medium leading-tight">{benefit.desc}</p>
                                    </div>

                                    <div className="col-span-2 flex justify-center">
                                        {typeof benefit.web === 'boolean' ? (
                                            benefit.web ? <CheckCircle2 className="text-gray-300" size={14} /> : <X className="text-gray-100" size={14} />
                                        ) : (
                                            <span className="text-[7px] font-bold text-gray-400 text-center leading-none px-1">{benefit.web}</span>
                                        )}
                                    </div>

                                    <div className="col-span-2 flex justify-center">
                                        {typeof benefit.free === 'boolean' ? (
                                            benefit.free ? <CheckCircle2 className="text-blue-300" size={14} /> : <X className="text-gray-200" size={14} />
                                        ) : (
                                            <span className="text-[7px] font-bold text-gray-500 text-center leading-none px-1">{benefit.free}</span>
                                        )}
                                    </div>

                                    <div className="col-span-2 flex justify-center">
                                        {typeof benefit.pro === 'boolean' ? (
                                            benefit.pro ? <CheckCircle2 className="text-blue-600" size={18} /> : <X className="text-red-400" size={18} />
                                        ) : (
                                            <span className="text-[8px] font-black text-blue-700 text-center italic leading-tight px-1">{benefit.pro}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Integrated Mobile Cost Footer */}
                        <div className="bg-aviva-navy px-8 py-10 text-white relative">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-aviva-secondary"></div>
                            
                            <div className="mb-8 overflow-hidden">
                                    <h4 className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60 mb-6">Elige tu Nivel de Inversión</h4>
                                
                                <div className="grid grid-cols-3 gap-2 items-end">
                                    <div className="text-center pb-2">
                                        <span className="block text-[8px] font-bold text-white/30 uppercase mb-2">Web Propia</span>
                                        <span className="block text-[11px] font-black text-white/20 line-through leading-none">+500 USD</span>
                                    </div>
                                    
                                    <div className="text-center pb-2 border-x border-white/5 px-1">
                                        <span className="block text-[8px] font-bold text-white/50 uppercase mb-2">Plan Free</span>
                                        <span className="block text-[11px] font-black text-green-400 uppercase leading-none">Gratis</span>
                                    </div>
                                    
                                    <div className="text-center bg-white/5 rounded-2xl p-4 border border-aviva-secondary/30 shadow-2xl">
                                        <span className="block text-[8px] font-black text-aviva-secondary uppercase mb-2 leading-none">Plan PRO</span>
                                        <span className="block text-2xl font-black text-white leading-none tracking-tighter">${pricing.amount}</span>
                                        <span className="text-[8px] font-bold text-white/50 uppercase leading-none mt-1 block px-1">{pricing.currency}/AÑO</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleCTAClick}
                                className="w-full py-5 bg-aviva-secondary text-white font-black rounded-2xl shadow-xl shadow-aviva-secondary/30 active:scale-95 transition-transform uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                            >
                                Activar Mi Plan Pro
                            </button>
                            
                            <p className="text-center text-[9px] text-white/40 mt-6 uppercase font-bold tracking-widest leading-relaxed">
                                *Precio sujeto a cambios según la región.<br/>Garantía de satisfacción AvivaGo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
