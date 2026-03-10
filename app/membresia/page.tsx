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

const benefits = [
    {
        title: "Tu Propia Marca Personal",
        description: "No eres un número anónimo. Construimos tu perfil profesional con nombre, foto y reputación para que seas dueño de tu patrimonio comercial.",
        icon: UserShield,
        color: "bg-blue-600",
        shadow: "shadow-blue-600/20"
    },
    {
        title: "0% Comisiones por Viaje",
        description: "El 100% de la tarifa es tuya. AvivaGo cobra una membresía fija, eliminando las mordidas del 25-40% de las apps tradicionales.",
        icon: TrendingUp,
        color: "bg-emerald-500",
        shadow: "shadow-emerald-500/20"
    },
    {
        title: "Perfil Público (SEO)",
        description: "Tu perfil Pro está optimizado para aparecer en Google. Cuando alguien busque transporte en tu ciudad, tú estarás ahí.",
        icon: Globe,
        color: "bg-indigo-500",
        shadow: "shadow-indigo-500/20"
    },
    {
        title: "Link de Pago Directo",
        description: "Acepta pagos digitales (Stripe, PayPal, etc.) directamente en tu cuenta de banco, sin que AvivaGo sea intermediario del dinero.",
        icon: CreditCard,
        color: "bg-amber-500",
        shadow: "shadow-amber-500/20"
    },
    {
        title: "Kit de Marketing Pro",
        description: "Acceso a diseños profesionales y solicitud de Kit Físico impreso para tu vehículo. Tu negocio se ve impecable.",
        icon: Smartphone,
        color: "bg-purple-500",
        shadow: "shadow-purple-500/20"
    },
    {
        title: "Sello de Verificado",
        description: "Validación biométrica y legal manual. Es el distintivo #1 para ganar la confianza de pasajeros de alto valor.",
        icon: BadgeCheck,
        color: "bg-rose-500",
        shadow: "shadow-rose-500/20"
    }
];

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

function UserShield({ size }: { size: number }) {
    return (
        <div className="relative">
            <Users size={size} />
            <ShieldCheck size={size / 2} className="absolute -bottom-1 -right-1" />
        </div>
    );
}

function CreditCard({ size }: { size: number }) {
    return <Smartphone size={size} />; // Fallback icon if Lucide isn't exportable
}

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
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (!tz.includes('Mexico')) {
                    const res = await fetch('https://ipapi.co/json/');
                    const data = await res.json();
                    if (data.country_code && data.country_code !== 'MX') {
                        setPricing({ amount: '30', currency: 'USD' });
                    }
                }
            } catch (error) {
                console.error('Error detecting location:', error);
            }
        };
        detectLocation();
    }, []);

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
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-gray-50">
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
                                Tu Empresa.<br />Tu Marca.<br /><span className="text-blue-600">Tu Patrimonio.</span>
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
                            <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-2xl text-gray-500">
                                <Search size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-aviva-navy">No enviamos viajes</h4>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                AvivaGo no es una app de despacho. Es la herramienta para que tú gestiones tus propios clientes y solicitudes directamente.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-2xl text-blue-500">
                                <Users size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-aviva-navy">Fidelización Directa</h4>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Convierte a tus pasajeros de hoy en tus clientes de mañana. Te contactan a ti, no a una plataforma anónima.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-2xl text-emerald-500">
                                <Zap size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-aviva-navy">Complemento Perfecto</h4>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                No tienes que dejar las otras apps. Usa AvivaGo para tus viajes "por fuera" y formaliza tu marca personal.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Display */}
            <section id="features" className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold text-aviva-navy mb-6 font-display">
                            ¿Por qué ser un <span className="text-blue-600">Conductor Aviva</span>?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Transformamos la manera en que gestionas tu servicio con herramientas diseñadas por y para conductores.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group"
                            >
                                <div className={`w-16 h-16 ${benefit.color} ${benefit.shadow} rounded-[1.25rem] flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform`}>
                                    <benefit.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-aviva-navy mb-4">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Membership Comparison - Detailed The MD source */}
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
                                    Activar Mi Plan Pro <ArrowRight size={18} />
                                </button>
                                
                                <p className="text-center text-[9px] text-white/40 mt-6 uppercase font-bold tracking-widest leading-relaxed">
                                    *Precio sujeto a cambios según la región.<br/>Garantía de satisfacción AvivaGo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Professionalization Content */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="bg-gray-900 rounded-[4rem] p-12 md:p-20 text-white relative flex flex-col lg:flex-row items-center gap-16">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-aviva-primary/20 rounded-full blur-[100px]" />
                        
                        <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                                <BookOpen size={16} />
                                Contenido Exclusivo Pro
                            </span>
                            <h2 className="text-3xl md:text-6xl font-bold font-display leading-tight text-white">
                                Conviértete en un <span className="text-sky-300">Empresario</span> del Transporte
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                                La membresía Pro te da acceso a formación avanzada en ventas, finanzas, marketing digital y trato al cliente de lujo.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="font-bold text-white text-lg">Marketing Digital</p>
                                     <p className="text-sm text-white/90 font-medium leading-relaxed">Cómo venderte en redes sociales y atraer clientes VIP.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-bold text-white text-lg">Finanzas Personales</p>
                                     <p className="text-sm text-white/90 font-medium leading-relaxed">Optimiza tus costos, impuestos y ahorros reales.</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/3 flex justify-center">
                            <div className="relative">
                                <div className="w-64 h-64 bg-aviva-primary rounded-full absolute -z-10 blur-[60px] opacity-20" />
                                <div className="bg-aviva-navy border-4 border-white/10 rounded-[3rem] p-8 shadow-2xl skew-x-3 rotate-3">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-white/10 rounded-full w-3/4" />
                                            <div className="h-3 bg-white/5 rounded-full w-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-[120px] bg-white/5 rounded-2xl" />
                                         <div className="h-10 bg-blue-500 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
