'use client';

import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    Shield,
    TrendingUp,
    Users,
    XCircle,
    Check,
    Smartphone,
    Award,
    Target,
    Globe,
    Plus,
    Minus,
    Zap,
    Wallet,
    Heart,
    Share2,
    UserCheck,
    Star,
    Network,
    ThumbsUp
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MarketingKitPromo from '@/app/components/marketing/v1/MarketingKitPromo';
import { createClient } from '@/lib/supabase/client';

// --- Shared Components (Premium Styled) ---

function FeatureCard({ icon: Icon, title, description, delay, color = "blue" }: { icon: any, title: string, description: string, delay: number, color?: string }) {
    const themes: Record<string, { border: string, icon: string }> = {
        blue: { border: "border-t-blue-600", icon: "text-blue-600/10" },
        green: { border: "border-t-green-600", icon: "text-green-600/10" },
        purple: { border: "border-t-purple-600", icon: "text-purple-600/10" },
        orange: { border: "border-t-orange-600", icon: "text-orange-600/10" },
    };

    const theme = themes[color] || themes.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className={`bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-700 border-t-[10px] ${theme.border} border-x border-b border-slate-100 group relative overflow-hidden h-full flex flex-col justify-center items-center text-center`}
        >
            {/* Background Icon - Top Right */}
            <div className={`absolute -top-6 -right-6 ${theme.icon} group-hover:scale-110 transition-all duration-1000 -z-0 pointer-events-none`}>
                <Icon size={140} strokeWidth={1} />
            </div>

            <div className="relative z-10">
                <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tighter uppercase leading-tight">{title}</h3>
                <p className="text-slate-600 leading-relaxed font-bold text-lg">{description}</p>
            </div>
        </motion.div>
    );
}

function SocialTestimonial({ name, role, city, content, image, delay, likes = "124" }: { name: string, role: string, city: string, content: string, image: string, delay: number, likes?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col"
        >
            {/* Social Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <img
                        src={image}
                        alt={name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <div>
                        <p className="font-black text-slate-900 text-base tracking-tight">{name}</p>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{city}</p>
                    </div>
                </div>
                <div className="bg-blue-50 p-2 rounded-full text-blue-500">
                    <ThumbsUp size={18} fill="currentColor" />
                </div>
            </div>

            {/* Social Body */}
            <div className="px-6 py-4 flex-grow">
                <p className="text-slate-700 text-base leading-relaxed font-medium">
                    {content}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-blue-600 font-bold text-xs">#AvivaGo</span>
                    <span className="text-blue-600 font-bold text-xs">#ConduceLibre</span>
                    <span className="text-blue-600 font-bold text-xs">#CeroComisiones</span>
                </div>
            </div>

            {/* Social Footer */}
            <div className="p-4 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <Heart size={16} className="text-red-500 fill-red-500" />
                        <span className="text-xs font-black">{likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <Share2 size={16} />
                        <span className="text-xs font-black">Compartir</span>
                    </div>
                </div>
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-orange-400 text-orange-400" />)}
                </div>
            </div>
        </motion.div>
    );
}

export default function LandingConductores() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                const { data } = await supabase
                    .from('users')
                    .select('roles')
                    .eq('id', session.user.id)
                    .single();
                setProfile(data);
            }
        };
        checkSession();
    }, []);

    const roles = profile?.roles || [];
    const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin';
    const isDriver = Array.isArray(roles) ? roles.includes('driver') : roles === 'driver';

    let targetLink = '/dashboard';
    let targetLabel = 'Entrar al Panel';

    if (isAdmin) {
        targetLink = '/admin';
        targetLabel = 'Panel Admin';
    } else if (isDriver) {
        targetLink = '/perfil?tab=driver_dashboard';
        targetLabel = 'Panel Conductor';
    } else {
        targetLink = '/dashboard';
        targetLabel = 'Panel Pasajero';
    }

    return (
        <div className="bg-white min-h-screen font-sans overflow-hidden">
            {/* Announcement Banner */}
            <div className="bg-blue-600 text-white py-3 px-4 relative z-50 overflow-hidden">
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: "-100%" }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                    className="whitespace-nowrap flex gap-12 items-center"
                >
                    <span className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400" /> Oferta de Lanzamiento: Perfil Digital 100% Gratis por tiempo limitado
                    </span>
                    <span className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Award size={14} className="text-white" /> Sé de los primeros en tu ciudad y activa tu Bono de Referido
                    </span>
                    <span className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Shield size={14} className="text-white" /> Disponibilidad limitada. Asegura tu lugar hoy en la Red AvivaGo
                    </span>
                    {/* Repeat for seamless loop */}
                    <span className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400" /> Oferta de Lanzamiento: Perfil Digital 100% Gratis por tiempo limitado
                    </span>
                </motion.div>
            </div>

            {/* --- 1. HERO SECTION --- */}
            <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10" />
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        {/* Text Content */}
                        <motion.div
                            className="flex-1 text-center lg:text-left"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="mb-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
                            >
                                <img src="/images/logo.png" alt="AvivaGo Logo" className="h-20 md:h-24 w-auto object-contain drop-shadow-xl rounded-xl" />
                                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200 shrink-0">
                                    <Zap size={14} className="animate-pulse text-yellow-400" /> 100% Gratis (Lanzamiento)
                                </span>
                            </motion.div>
                            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-slate-950 mb-8 leading-[1.1] md:leading-[0.95]">
                                Tu Trabajo, <br />
                                <span className="text-blue-600 italic">Tu Cartera,</span> <br />
                                <span className="relative">
                                    Tu Futuro.
                                    <motion.span
                                        className="absolute bottom-2 left-0 w-full h-3 bg-blue-100 -z-10"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: 1, duration: 0.8 }}
                                    />
                                </span>
                            </h1>
                            <p className="text-lg md:text-2xl text-slate-600 max-w-2xl lg:mx-0 mx-auto mb-10 leading-relaxed font-medium">
                                Obtén tu <span className="text-slate-950 font-bold underline decoration-blue-500">Perfil Digital Profesional GRATIS</span> y construye una cartera de pasajeros que sea tuya para siempre. Sin comisiones por viaje, sin algoritmos que te controlen.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                                <Link href={user ? targetLink : "/register?role=driver&redirect=/conductores"} className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto bg-blue-600 hover:bg-slate-950 text-white px-10 py-6 rounded-2xl text-xl font-black shadow-2xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group">
                                        {user ? targetLabel : "Empieza Gratis Ahora"} <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <div className="text-center lg:text-left">
                                    <p className="text-blue-600 text-xs font-black uppercase tracking-widest px-4">Oferta de Lanzamiento</p>
                                    <p className="text-slate-400 text-[10px] font-bold px-4 max-w-[200px]">Asegura tu perfil gratis antes de que se acaben los lugares</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex-1 relative w-full"
                            initial={{ opacity: 0, scale: 0.9, x: 30 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="relative z-10 bg-white rounded-[3rem] p-3 shadow-[0_40px_80px_rgba(0,0,0,0.1)] border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-700 overflow-hidden group max-w-[350px] mx-auto">
                                <div className="absolute top-0 right-0 p-6 z-20">
                                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        Perfil Activo
                                    </div>
                                </div>
                                <div className="aspect-[9/16] rounded-[2.5rem] bg-slate-900 relative overflow-hidden shadow-inner">
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                        poster="/images/driver_profile_mobile_mockup_1771120637205.png"
                                        className="w-full h-full object-cover object-center relative z-0"
                                    >
                                        <source src="/WhatsApp%20Video%202026-02-14%20at%209.41.14%20PM.mp4" type="video/mp4" />
                                    </video>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-10 pointer-events-none" />
                                    <div className="absolute bottom-10 left-6 right-6 z-20">
                                        <div className="bg-blue-600 h-14 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-2xl cursor-default px-6">
                                            <Award size={18} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                            Tu Perfil Digital
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -top-10 -right-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
                            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- 2. EL DOLOR (COMMISSIONS) --- */}
            <section className="py-12 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[3.5rem] p-10 md:p-20 shadow-xl border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-black text-slate-950 mb-6 uppercase leading-tight">¿Cansado de pagar por trabajar?</h2>
                                <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">Las apps tradicionales te quitan hasta el 40% de cada viaje. En AvivaGo, el trato es directo y la ganancia es 100% tuya.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="flex items-start gap-5">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500">
                                            <XCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Comisiones por cada viaje</h4>
                                            <p className="text-slate-500 leading-relaxed font-medium">Pierdes dinero cada vez que frenas. Entre más trabajas, más les pagas a ellos.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500">
                                            <XCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Viajes que no te gustan</h4>
                                            <p className="text-slate-500 leading-relaxed font-medium">Obligado a aceptar rutas peligrosas o mal pagadas solo para mantener tu tasa de aceptación.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500">
                                            <XCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Clientes anónimos</h4>
                                            <p className="text-slate-500 leading-relaxed font-medium">Cada cliente es nuevo. Nunca construyes una relación ni una base sólida.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-600 rounded-[2.5rem] p-8 md:p-12 text-white relative shadow-2xl shadow-blue-200">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 shadow-inner">
                                            <img src="/images/logo.png" alt="AvivaGo Logo" className="w-full h-full object-contain" />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white">La Nueva Era</h3>
                                    </div>
                                    <p className="text-4xl md:text-5xl font-black mb-6">0% <span className="text-blue-200 text-xl md:text-2xl uppercase italic">Comisión</span></p>
                                    <p className="text-blue-100 font-bold mb-8 italic uppercase tracking-widest text-sm">Lo que cobras, te lo quedas.</p>
                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3 font-bold text-lg"><Check className="text-blue-300" /> Cobro Directo</li>
                                        <li className="flex items-center gap-3 font-bold text-lg"><Check className="text-blue-300" /> WhatsApp Directo</li>
                                        <li className="flex items-center gap-3 font-bold text-lg"><Check className="text-blue-300" /> Cartera Permanente</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- 3. EL GRAN VALOR: CARTERA PERMANENTE --- */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto mb-20">
                        <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Tu Mayor Activo</span>
                        <h2 className="text-3xl md:text-6xl font-black text-slate-950 mb-8 uppercase leading-[1.1]">Crea tu propia <br /><span className="text-blue-600 italic">Cartera de Pasajeros</span></h2>
                        <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">Cada pasajero que se registre con tu vínculo estará asociado a tu cuenta de manera <span className="text-slate-950 font-black decoration-blue-500 underline">permanente</span>.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <FeatureCard
                            icon={Network}
                            title="Vínculo de por Vida"
                            description="Si un pasajero entra a AvivaGo por ti, es tu pasajero para siempre. Cuando necesiten un viaje, tú serás su primera opción."
                            delay={0.1}
                            color="blue"
                        />
                        <FeatureCard
                            icon={Share2}
                            title="Herramientas de Promo"
                            description="Te damos códigos QR y enlaces personalizados para que los compartas en tus redes y en tu unidad. Tú eres la marca."
                            delay={0.2}
                            color="green"
                        />
                        <FeatureCard
                            icon={Wallet}
                            title="Ingreso sin Cortes"
                            description="Al eliminar al intermediario, el flujo de dinero es inmediato. Tú pactas el precio, tú recibes el pago al instante."
                            delay={0.3}
                            color="purple"
                        />
                    </div>
                </div>
            </section>

            {/* --- MARKETING KIT SECTION --- */}
            <MarketingKitPromo />

            {/* --- 4. PROGRAMA DE REFERIDOS --- */}
            <section className="py-12 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 -skew-x-12 translate-x-32" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <h2 className="text-3xl md:text-6xl font-black mb-8 uppercase leading-tight text-white">Haz crecer <span className="text-blue-500">tu red</span> y gana más.</h2>
                            <p className="text-lg md:text-xl text-slate-200 mb-12 font-medium leading-relaxed">Nuestro programa de referidos no solo te trae pasajeros, sino que te permite ganar beneficios extra por cada colega que invites a profesionalizarse.</p>

                            <div className="space-y-10">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                        <UserCheck size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2 text-white">Refiere Pasajeros</h4>
                                        <p className="text-slate-300 leading-relaxed font-medium">Cada registro es un activo en tu cartera. No más buscar clientes cada día, ellos te buscarán a ti.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-green-600/20 flex items-center justify-center text-green-400 flex-shrink-0">
                                        <TrendingUp size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2 text-white">Refiere Conductores</h4>
                                        <p className="text-slate-300 leading-relaxed font-medium">Fortalece la Red de Certeza y obtén certificaciones premium y beneficios exclusivos de la Fundación.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-lg">
                            <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl">
                                <h3 className="text-2xl font-black mb-8 uppercase text-white tracking-[0.2em]">Beneficios de Referido</h3>
                                <div className="space-y-6">
                                    {[
                                        "Prioridad en la Red de Certeza",
                                        "Acceso a servicios de salud Aviva",
                                        "Perfil con Sello Dorado",
                                        "Capacitaciones exclusivas"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                            <span className="font-bold text-white uppercase text-sm tracking-[0.1em]">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-12 pt-12 border-t border-white/10 text-center">
                                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Exclusivo para Socios Fundadores</p>
                                    <Link href={user ? "/perfil?tab=marketing" : "/register?role=driver&redirect=/conductores"}>
                                        <button className="w-full bg-white text-slate-950 px-8 py-5 rounded-2xl text-lg font-black uppercase tracking-tighter hover:bg-blue-500 hover:text-white transition-colors">
                                            {user ? "Ir a mis Herramientas" : "Quiero mi enlace de referido"}
                                        </button>
                                    </Link>
                                    <p className="mt-6 text-slate-400 text-xs font-bold leading-relaxed px-4">
                                        Los primeros socios de cada ciudad obtienen acceso exclusivo al programa de referidos con bonos de bienvenida.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 5. TESTIMONIOS --- */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-950 mb-6 uppercase leading-tight">Lo que dicen los <span className="text-blue-600">Primeros Socios</span></h2>
                        <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">Conductores que ya transformaron su forma de trabajar.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <SocialTestimonial
                            name="Roberto Martínez"
                            role="Conductor Independiente"
                            city="CDMX"
                            content="Antes sentía que trabajaba para la app. Ahora mis clientes me llaman directo a mi WhatsApp desde mi perfil de AvivaGo. ¡Me ahorro miles de pesos al mes!"
                            image="/images/testimonial_roberto_real_1771120137992.png"
                            likes="243"
                            delay={0.1}
                        />
                        <SocialTestimonial
                            name="Carla Gutiérrez"
                            role="Servicio Ejecutivo"
                            city="Monterrey"
                            content="La cartera permanente es lo mejor. Los pasajeros que referí hace meses siguen apareciendo en mi lista y me agendan viajes cada semana."
                            image="/images/testimonial_carla_real_1771120150816.png"
                            likes="187"
                            delay={0.2}
                        />
                        <SocialTestimonial
                            name="Jorge Luna"
                            role="Socio Bronce"
                            city="Guadalajara"
                            content="Tener un perfil digital profesional me da otra imagen ante los clientes. Se sienten más seguros y me recomiendan con sus contactos compartiendo mi QR."
                            image="/images/hero_driver_man_casual_v2_1771120037983.png"
                            likes="312"
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* --- 6. CTA FINAL --- */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600 -skew-y-3 translate-y-24 origin-right" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="bg-white p-12 md:p-24 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] max-w-5xl mx-auto border-t-8 border-blue-600"
                    >
                        <h2 className="text-4xl md:text-8xl font-black text-slate-950 mb-8 uppercase leading-[1.1] md:leading-[0.8]">
                            ¡Deja de pagar! <br />
                            <span className="text-blue-600 italic">empieza a ganar.</span>
                        </h2>
                        <p className="text-lg md:text-3xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed md:leading-tight">
                            Tu perfil digital profesional y herramientas de cartera están listos. <br /> <span className="text-slate-950 font-black italic underline decoration-blue-500">¿Qué esperas para registrarte?</span>
                        </p>
                        <Link href={user ? targetLink : "/register?role=driver&redirect=/conductores"}>
                            <button className="bg-blue-600 hover:bg-slate-950 text-white px-12 py-8 rounded-[2rem] text-2xl md:text-3xl font-black shadow-2xl shadow-blue-300 transition-all hover:scale-110 flex items-center justify-center gap-5 mx-auto group">
                                {user ? targetLabel : "Crear mi Perfil GRATIS"} <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </Link>
                        <div className="mt-6 flex flex-col items-center gap-2">
                            <p className="text-blue-600 text-sm font-black uppercase tracking-[0.2em]">¡Deja de regalar tu esfuerzo!</p>
                            <p className="text-slate-500 text-xs font-bold text-center max-w-md">
                                Cada viaje que haces en otras apps es dinero y esfuerzo que pierdes para siempre. Asegura tu lugar hoy y empieza a construir tu propio patrimonio.
                            </p>
                        </div>
                        <div className="mt-12 flex flex-wrap justify-center gap-8 items-center opacity-60">
                            <div className="flex items-center gap-2">
                                <Shield className="text-blue-600" />
                                <span className="font-bold uppercase tracking-widest text-xs">Pago Seguro</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="text-red-500" />
                                <span className="font-bold uppercase tracking-widest text-xs">Respaldo Humano</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Smartphone className="text-slate-900" />
                                <span className="font-bold uppercase tracking-widest text-xs">Digital First</span>
                            </div>
                        </div>
                        <p className="mt-12 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">AvivaGo © 2026 • La Red de Certeza</p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
