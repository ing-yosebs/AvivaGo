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
    ChevronDown,
    Plus,
    Minus
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// --- Shared Components ---

function Card({ icon, title, description, delay, color = "blue" }: { icon: React.ReactNode, title: string, description: string, delay: number, color?: string }) {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-600 bg-blue-50 border-blue-100 group-hover:border-blue-200",
        green: "text-green-600 bg-green-50 border-green-100 group-hover:border-green-200",
        purple: "text-purple-600 bg-purple-50 border-purple-100 group-hover:border-purple-200",
        orange: "text-orange-600 bg-orange-50 border-orange-100 group-hover:border-orange-200",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className={`bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group ${colorClasses[color] || colorClasses.blue}`}
        >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 bg-white shadow-inner">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed text-balance">{description}</p>
        </motion.div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{question}</span>
                {isOpen ? <Minus className="text-blue-600" /> : <Plus className="text-slate-400 group-hover:text-blue-600" />}
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <p className="pb-6 text-slate-600 leading-relaxed font-medium">
                    {answer}
                </p>
            </motion.div>
        </div>
    );
}

export default function LandingTuNegocio() {
    return (
        <div className="bg-white min-h-screen font-sans overflow-hidden">

            {/* --- 1. HERO SECTION --- */}
            <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10" />
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            className="flex-1 text-center lg:text-left"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-8 uppercase tracking-widest">
                                Tu Negocio, Tus Reglas
                            </span>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-950 mb-8 leading-[0.9]">
                                Deja de ser un número. <br />
                                <span className="text-blue-600 italic">Conviértete en un Profesional</span> de la Movilidad.
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl lg:mx-0 mx-auto mb-10 leading-snug font-medium">
                                La única plataforma donde el <span className="text-slate-950 font-bold">100% del viaje es para ti</span>. Sin comisiones, sin algoritmos ocultos. Solo tú, tu servicio y tus clientes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href="/register?role=driver" className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                                        Obtener mi Web Personal y Certificación <ArrowRight size={24} />
                                    </button>
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex-1 relative"
                            initial={{ opacity: 0, scale: 0.9, x: 30 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(37,99,235,0.3)] border-8 border-white">
                                <img
                                    src="/artifacts/hero_driver_personal_web.png"
                                    alt="Conductor profesional con Web Personal"
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
                            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- 2. EL DOLOR VS. LA SOLUCIÓN --- */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-6 tracking-tighter uppercase">Apps Tradicionales vs. <span className="text-blue-600">AvivaGo</span></h2>
                        <p className="text-xl text-slate-600 font-medium italic">¿Estás cansado de trabajar para un algoritmo que no sabe tu nombre?</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-10 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                        >
                            <div className="mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <XCircle className="text-slate-400" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-400 uppercase">Apps Tradicionales</h3>
                            </div>
                            <ul className="space-y-6 flex-grow">
                                {[
                                    "Comisiones abusivas del 30% al 45%",
                                    "Viajes asignados al azar por un algoritmo",
                                    "Inseguridad constante (Pasajeros anónimos)",
                                    "Clientes que no valoran tu unidad ni servicio",
                                    "Soporte robotizado y sin respuesta humana"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-slate-500 font-medium">
                                        <XCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-blue-600 p-10 rounded-3xl shadow-2xl shadow-blue-200 flex flex-col relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
                            <div className="mb-8 flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                    <CheckCircle2 className="text-blue-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">La Solución AvivaGo</h3>
                            </div>
                            <ul className="space-y-6 flex-grow relative z-10">
                                {[
                                    "0% de comisión. 100% de lo que cobras es tuyo",
                                    "Tú eliges a tus clientes (Nicho de mercado)",
                                    "Respaldo oficial de la Fundación Aviva Group",
                                    "Cobro directo y pactado con el pasajero",
                                    "Certeza total en cada viaje programado"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-white font-bold text-lg">
                                        <Check className="text-blue-200 mt-1 flex-shrink-0 bg-white/20 rounded-full p-0.5" size={24} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-10 pt-10 border-t border-white/20 relative z-10">
                                <p className="text-blue-100 font-medium italic">"AvivaGo no es solo una app, es tu herramienta de libertad."</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- 3. LOS 3 PILARES DEL ÉXITO AVIVAGO --- */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-6 tracking-tighter uppercase">Los 3 Pilares del Éxito</h2>
                        <p className="text-xl text-slate-600 font-medium">Construye una carrera sostenible con bases sólidas.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <Card
                            icon={<TrendingUp className="h-10 w-10" />}
                            title="Pilar 1: Independencia Financiera"
                            description="Pagas una suscripción anual de solo $524 MXN y olvídate de darles una parte de tu trabajo cada vez que frenas. Es inversión, no gasto."
                            delay={0.1}
                            color="green"
                        />
                        <Card
                            icon={<Target className="h-10 w-10" />}
                            title="Pilar 2: Especialización"
                            description="Crea un perfil único: ¿Pet-Friendly? ¿Tercera Edad? ¿Transporte Ejecutivo? Atrae solo a los clientes que tú estás dispuesto a atender."
                            delay={0.2}
                            color="blue"
                        />
                        <Card
                            icon={<Users className="h-10 w-10" />}
                            title="Pilar 3: Respaldo Humano"
                            description="No estás solo. Certificación por la Fundación Aviva Group, cursos de inglés, apoyo psicológico y una comunidad real de certeza."
                            delay={0.3}
                            color="purple"
                        />
                    </div>
                </div>
            </section>

            {/* --- 4. ¿QUÉ RECIBES AL UNIRTE? (PRODUCTO B2B) --- */}
            <section className="py-24 bg-slate-950 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1">
                            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter uppercase leading-[0.9]">
                                Todo lo que recibes por <br />
                                <span className="text-blue-500">menos de $2 pesos al día</span>
                            </h2>
                            <p className="text-xl text-slate-400 mb-12 font-medium">Equipamos tu negocio con tecnología de punta y respaldo institucional.</p>

                            <div className="grid sm:grid-cols-2 gap-8">
                                {[
                                    { title: "Web Personal", desc: "Tu propia tarjeta de presentación digital profesional.", icon: Smartphone },
                                    { title: "Sello de Certificación", desc: "Validación de seguridad y confianza para tus pasajeros.", icon: Award },
                                    { title: "Red de Certeza", desc: "Conexión directa con usuarios corporativos y locales.", icon: Globe },
                                    { title: "Programa de Afiliados", desc: "Gana dinero extra refiriendo conductores y usuarios.", icon: Users },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex flex-col gap-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                                            <item.icon size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                            <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 relative z-10">
                                <div className="aspect-[4/3] rounded-2xl bg-slate-100/10 flex items-center justify-center border border-dashed border-slate-700">
                                    <div className="text-center">
                                        <Smartphone size={64} className="mx-auto text-blue-500 mb-4 animate-bounce" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Preview de tu Web Personal</p>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-4">
                                    <div className="h-4 w-3/4 bg-slate-800 rounded-full" />
                                    <div className="h-4 w-1/2 bg-slate-800 rounded-full" />
                                    <div className="h-4 w-5/6 bg-slate-800 rounded-full" />
                                </div>
                            </div>
                            {/* Decorative glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/20 blur-[120px] -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 5. PRUEBA SOCIAL Y AUTORIDAD --- */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            className="bg-slate-50 p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="absolute top-10 left-10 text-slate-200">
                                <svg width="80" height="60" viewBox="0 0 115 85" fill="currentColor">
                                    <path d="M37.0833 85H0L19.1667 0H54.1667L37.0833 85ZM97.9167 85H60.8333L80 0H115L97.9167 85Z" />
                                </svg>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight relative z-10 mb-10 italic">
                                “AvivaGo me permitió recuperar mi dignidad como conductor. Ahora sé exactamente a quién llevo y mis ganancias crecieron un 35% al eliminar comisiones.”
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 relative z-10">
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                                    <Users className="text-blue-600" size={40} />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">Socio Bronce</p>
                                    <p className="text-slate-500 font-bold">Ciudad de México, MX</p>
                                </div>
                            </div>

                            <div className="mt-20 pt-12 border-t border-slate-200">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Certificado oficial por</p>
                                <div className="flex justify-center items-center gap-8 grayscale opacity-50">
                                    <div className="flex items-center gap-3">
                                        <Award className="text-slate-900" size={32} />
                                        <span className="text-xl font-black text-slate-900 tracking-tighter">FUNDACIÓN AVIVA GROUP</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- 6. FAQ (DUDAS TÉCNICAS) --- */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-slate-950 mb-4 uppercase tracking-tighter">Preguntas de Conductores PRO</h2>
                            <p className="text-xl text-slate-600 font-medium">Todo lo que necesitas saber antes de dar el salto.</p>
                        </div>
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <FAQItem
                                question="¿Cómo cobro mis viajes?"
                                answer="Directamente al pasajero por el método que tú elijas (Efectivo, Transferencia, Terminal propia). AvivaGo no toca tu dinero de viaje ni retiene tus ganancias."
                            />
                            <FAQItem
                                question="¿Qué es la cuota anual?"
                                answer="Es tu acceso a toda la infraestructura tecnológica, los beneficios de salud y educación de la Fundación, y tu certificación como Miembro de la Red de Certeza."
                            />
                            <FAQItem
                                question="¿Necesito una certificación?"
                                answer="Sí. Para garantizar la 'Certeza' a los usuarios, todos nuestros socios pasan por un filtro de confianza y seguridad validado por la Fundación Aviva Group."
                            />
                            <FAQItem
                                question="¿Puedo seguir usando otras aplicaciones?"
                                answer="Totalmente. AvivaGo es una herramienta adicional para profesionalizar tu base de clientes propios, no exige exclusividad."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 7. CIERRE Y FOOTER --- */}
            <section className="py-32 relative overflow-hidden bg-white">
                <div className="absolute inset-0 bg-blue-600 skew-y-3 translate-y-24 -z-10" />
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="bg-white p-12 md:p-24 rounded-[4rem] shadow-2xl shadow-blue-900/20 max-w-5xl mx-auto border-t-8 border-blue-600"
                    >
                        <h2 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 tracking-tighter uppercase leading-[0.85]">
                            ¿Listo para ser el <br />
                            <span className="text-blue-600 italic">dueño de tu tiempo?</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium">
                            Únete a la Red de Certeza hoy mismo y empieza a construir el negocio que siempre soñaste.
                        </p>
                        <Link href="/register?role=driver">
                            <button className="bg-blue-600 hover:bg-slate-900 text-white px-12 py-6 rounded-2xl text-2xl font-black shadow-xl transition-all hover:scale-110 flex items-center justify-center gap-4 mx-auto group">
                                Únete a la Red de Certeza <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </Link>
                        <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-sm">Registro en menos de 2 minutos</p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

