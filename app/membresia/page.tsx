'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, 
    Smartphone, 
    Calculator, 
    Users, 
    TrendingUp, 
    Star, 
    CheckCircle2,
    ArrowRight,
    Search,
    BadgeCheck,
    Globe,
    Zap,
    X,
    Trophy,
    BookOpen,
    Layout
} from 'lucide-react';
import Link from 'next/link';

// Componentes existentes
import Navbar from '@/app/components/marketing/v1/Navbar';
import Pricing from '@/app/components/marketing/v1/Pricing';
import TrustFooter from '@/app/components/marketing/v1/TrustFooter';
import Comparison from '@/app/components/marketing/v1/Comparison';

// Componentes de la página
import BenefitsDisplay from '@/app/components/marketing/v1/membresia/BenefitsDisplay';
import MembershipDetailedComparison from '@/app/components/marketing/v1/membresia/MembershipDetailedComparison';
import Professionalization from '@/app/components/marketing/v1/membresia/Professionalization';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PaymentConfirmationModal from '@/app/components/marketing/v1/PaymentConfirmationModal';

export default function MembresiaPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [pricing, setPricing] = useState({
        amount: '524',
        currency: 'MXN'
    });

    // Auto-resume checkout if returning from login/register
    useEffect(() => {
        const checkAutoResume = async () => {
            const isCheckoutIntent = searchParams.get('checkout') === 'true';
            if (isCheckoutIntent) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setIsModalOpen(true);
                    // Opcional: limpiar el parámetro de la URL sin recargar
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                }
            }
        };
        checkAutoResume();
    }, [searchParams, supabase]);

    useEffect(() => {
        const detectLocation = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.phone) {
                    const isPhoneMX = user.phone.startsWith('52') || user.phone.startsWith('+52');
                    if (isPhoneMX) {
                        setPricing({ amount: '524', currency: 'MXN' });
                    } else {
                        setPricing({ amount: '30', currency: 'USD' });
                    }
                    return;
                }

                let isMX = true;
                try {
                    const res = await fetch('https://get.geojs.io/v1/ip/country.json');
                    if (res.ok) {
                        const data = await res.json();
                        isMX = data.country === 'MX';
                    } else {
                        throw new Error('geojs failed');
                    }
                } catch (err) {
                    try {
                        const res2 = await fetch('https://ipapi.co/json/');
                        if (res2.ok) {
                            const data2 = await res2.json();
                            if (data2.country_code) isMX = data2.country_code === 'MX';
                        } else {
                            throw new Error('ipapi failed');
                        }
                    } catch (err2) {
                        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
                        isMX = tz.includes('Mexico') || [
                            'America/Cancun', 'America/Merida', 'America/Monterrey',
                            'America/Matamoros', 'America/Mazatlan', 'America/Chihuahua',
                            'America/Ojinaga', 'America/Hermosillo', 'America/Tijuana',
                            'America/Bahia_Banderas'
                        ].includes(tz);
                    }
                }

                if (!isMX) {
                    setPricing({ amount: '30', currency: 'USD' });
                } else {
                    setPricing({ amount: '524', currency: 'MXN' });
                }
            } catch (error) {
                console.error('Error detecting location:', error);
            }
        };
        detectLocation();
    }, [supabase]);

    const handleCTAClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/register?role=driver&checkout=true&redirect=/membresia');
            return;
        }

        setIsModalOpen(true);
    };

    const handleConfirmPayment = async () => {
        setIsPurchasing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/register?role=driver&checkout=true');
                return;
            }

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'membership',
                    price: parseInt(pricing.amount),
                    currency: pricing.currency
                })
            });

            if (!response.ok) throw new Error('Failed to create checkout session');

            const { url } = await response.json();
            
            // Abrir en ventana emergente (Popup) centrada - Estilo Modal
            const width = 500;
            const height = 750;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            const popup = window.open(
                url,
                'StripeCheckout',
                `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
            );

            if (!popup) {
                alert('Por favor habilita las ventanas emergentes para continuar con el pago.');
                setIsPurchasing(false);
                return;
            }

            // Escuchar el mensaje de éxito desde la ventana emergente
            const handleMessage = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;
                if (event.data?.source === 'avivago-payment') {
                    if (event.data.status === 'success') {
                        setIsModalOpen(false);
                        router.push('/perfil?tab=driver_dashboard');
                    } else {
                        // El usuario canceló o hubo error en el popup
                        setIsPurchasing(false);
                    }
                    window.removeEventListener('message', handleMessage);
                }
            };

            window.addEventListener('message', handleMessage);

            // Verificar si la ventana se cerró manualmente
            const timer = setInterval(() => {
                if (popup.closed) {
                    clearInterval(timer);
                    setIsPurchasing(false);
                    window.removeEventListener('message', handleMessage);
                }
            }, 1000);

        } catch (error) {
            console.error('Payment error:', error);
            alert('Hubo un problema al iniciar el pago.');
            setIsPurchasing(false);
        }
    };

    return (
        <main className="min-h-screen bg-white font-sans selection:bg-aviva-primary/20 selection:text-aviva-primary overflow-x-hidden">
            <PaymentConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                amount={pricing.amount}
                currency={pricing.currency}
                onConfirm={handleConfirmPayment}
                isLoading={isPurchasing}
            />
            <Navbar />

            {/* Hero Section - The Funnel Entry */}
            <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-gray-50">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-70">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-aviva-primary/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aviva-primary/10 text-aviva-primary text-sm font-bold mb-6">
                                <Zap size={16} />
                                Más que una app, tu propia infraestructura
                            </span>
                            <h1 className="text-4xl md:text-7xl font-bold font-display text-aviva-navy leading-[1.1] mb-6 md:mb-8">
                                Tu negocio.<br />Tu Marca.<br /><span className="text-blue-600">Tu Patrimonio.</span>
                            </h1>
                            <p className="text-lg md:text-2xl text-gray-700 mb-8 md:mb-10 leading-relaxed max-w-xl">
                                AvivaGo es la herramienta profesional para el conductor independiente. Conserva el 100% de tus ingresos y construye un negocio que te pertenezca.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link 
                                    href="/register?role=driver"
                                    onClick={handleCTAClick}
                                    className="bg-aviva-primary hover:bg-aviva-primary/90 text-white font-bold px-10 py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xl shadow-aviva-primary/30 scale-100 hover:scale-[1.02]"
                                >
                                    ¡Ser Conductor Pro!
                                    <ArrowRight size={20} />
                                </Link>
                                <a 
                                    href="#comparison-pro"
                                    className="bg-white border-2 border-aviva-navy/10 text-aviva-navy font-bold px-10 py-5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
                                >
                                    ¿Por qué ser Pro?
                                </a>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="hidden lg:block relative"
                        >
                            <div className="bg-aviva-navy rounded-[3.5rem] p-12 shadow-3xl text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-aviva-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-aviva-primary/30 transition-colors" />
                                
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-aviva-primary rounded-2xl flex items-center justify-center shadow-lg shadow-aviva-primary/40">
                                            <BadgeCheck size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Certificación Elite</h3>
                                            <p className="text-white/80 text-sm">Validación Avanzada AvivaGo</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <CheckCircle2 className="text-blue-400 shrink-0" />
                                            <span className="font-medium text-blue-100">0% Comisiones - Dinero 100% tuyo</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <CheckCircle2 className="text-blue-400 shrink-0" />
                                            <span className="font-medium text-blue-100">Visible en Búsquedas de Google</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <CheckCircle2 className="text-blue-400 shrink-0" />
                                            <span className="font-medium text-blue-100">Cartera de Clientes Inalienable</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <div className="bg-aviva-secondary/20 border border-aviva-secondary/40 rounded-2xl p-4 text-center">
                                            <p className="text-[10px] uppercase tracking-widest font-black text-white/90 mb-1">Impacto Profesional</p>
                                            <p className="text-xl font-bold text-white">+300% de confianza del pasajero</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Conceptos Clave - The Strategy */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-2xl text-gray-500 shrink-0">
                                    <Search size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-aviva-navy">No enviamos viajes</h4>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                AvivaGo no es una app de despacho. Es la herramienta para que tú gestiones tus propios clientes y solicitudes directamente.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-2xl text-blue-500 shrink-0">
                                    <Users size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-aviva-navy">Fidelización Directa</h4>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Convierte a tus pasajeros de hoy en tus clientes de mañana. Te contactan a ti, no a una plataforma anónima.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-2xl text-emerald-500 shrink-0">
                                    <Zap size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-aviva-navy">Complemento Perfecto</h4>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                No tienes que dejar las otras apps. Usa AvivaGo para tus viajes "por fuera" y formaliza tu marca personal.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Componentes Refactorizados para Modularidad */}
            <BenefitsDisplay />
            
            <MembershipDetailedComparison 
                pricing={pricing} 
                handleCTAClick={handleCTAClick} 
            />
            
            <Professionalization />

            {/* Pricing Reusable */}
            <Pricing />

            {/* Comparison Reusable */}
            <Comparison />

            {/* CTA Final */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-8">
                    <div className="bg-gradient-to-br from-aviva-navy to-[#1a3a5f] rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-16 text-center text-white shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-aviva-primary/10 opacity-30 -z-10" />
                        <h2 className="text-3xl md:text-6xl font-bold mb-6 md:mb-8 font-display text-white">¿Listo para retomar el control?</h2>
                        <p className="text-lg md:text-2xl mb-10 md:mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                            Únete hoy a la infraestructura que está devolviendo la libertad financiera a los conductores de todo el continente.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href="/register?role=driver"
                                onClick={handleCTAClick}
                                 className="bg-blue-600 text-white font-bold px-12 py-6 rounded-2xl text-xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20 scale-100 hover:scale-105"
                            >
                                ¡Comenzar ahora!
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <TrustFooter />
        </main>
    );
}
