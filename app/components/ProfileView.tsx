'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from './Header';
import {
    MapPin,
    Star,
    CheckCircle,
    ChevronLeft,
    MessageCircle,
    Lock,
    ShieldCheck,
    Calendar,
    Car,
    Clock,
    Award
} from 'lucide-react';

interface ProfileViewProps {
    driver: {
        id: string | number;
        name: string;
        city: string;
        area: string;
        vehicle: string;
        year: number;
        photo: string;
        rating: number;
        reviews: number;
        price: number;
        year_joined?: string;
        tags: string[];
        bio: string;
        phone?: string;
    }
}

const ProfileView = ({ driver }: ProfileViewProps) => {
    // Initial state is locked (false) to show the contact information hidden
    const [isUnlocked, setIsUnlocked] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <Header />

            <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Back Navigation */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all mb-8 group"
                    >
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Volver al buscador
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar: Profile Info and CTA */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[40px] overflow-hidden p-8 sticky top-24">
                                <div className="relative mb-8 text-center">
                                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-blue-600/20 group relative">
                                        <img
                                            src={driver.photo}
                                            alt={driver.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/20 group-hover:opacity-0 transition-opacity" />
                                    </div>
                                    <div className="absolute bottom-0 right-1/2 translate-x-12 translate-y-1 bg-green-500 p-1.5 rounded-full ring-4 ring-zinc-950">
                                        <ShieldCheck className="h-4 w-4 text-white" />
                                    </div>
                                </div>

                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold mb-2 tracking-tight">{driver.name}</h1>
                                    <div className="flex items-center justify-center gap-2 text-zinc-400">
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium">{driver.city}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 mt-4">
                                        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                                            <Star className="h-3.5 w-3.5 fill-current" />
                                            <span className="text-sm font-bold">{driver.rating}</span>
                                        </div>
                                        <span className="text-zinc-600">•</span>
                                        <span className="text-sm text-zinc-500 font-medium">{driver.reviews} reseñas</span>
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="space-y-4">
                                    {isUnlocked ? (
                                        <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                                            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl text-center">
                                                <p className="text-green-500 font-bold text-[10px] uppercase tracking-widest mb-2">Contacto Desbloqueado</p>
                                                <p className="text-2xl font-mono font-bold text-white mb-6 tracking-wider">
                                                    {driver.phone}
                                                </p>
                                                <a
                                                    href={`https://wa.me/${driver.phone?.replace(/\D/g, '')}?text=Hola ${driver.name}, vi tu perfil en AvivaGo y me gustaría consultar por un servicio.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
                                                >
                                                    <MessageCircle className="h-5 w-5 fill-current" />
                                                    Escribir al WhatsApp
                                                </a>
                                            </div>
                                            <p className="text-[10px] text-center text-zinc-500 uppercase font-bold">Sin cargos adicionales por contacto directo</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-white border border-white/10 rounded-3xl text-center shadow-xl">
                                                <p className="text-zinc-500 text-sm mb-2">Costo para contactar</p>
                                                <h4 className="text-4xl font-bold text-black mb-6">${driver.price.toFixed(2)} <span className="text-sm font-medium text-zinc-400">USD</span></h4>
                                                <button
                                                    onClick={() => setIsUnlocked(true)}
                                                    className="w-full flex items-center justify-center gap-3 bg-zinc-950 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg group active:scale-[0.98]"
                                                >
                                                    <Lock className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                                    Desbloquear ahora
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-zinc-500">
                                                <ShieldCheck className="h-4 w-4 text-green-500/50" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Protección al cliente</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Bio, Vehicle, Reviews */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Bio Card */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[40px] p-8 lg:p-12">
                                <section className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <Award className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">Experiencia Profesional</h3>
                                    </div>
                                    <p className="text-zinc-400 text-lg leading-relaxed font-medium line-height-relaxed">
                                        {driver.bio}
                                    </p>
                                </section>

                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-3xl">
                                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                                            <Car className="h-4 w-4" />
                                            Vehículo Registrado
                                        </div>
                                        <div className="text-xl font-bold">{driver.vehicle}</div>
                                        <div className="text-sm text-zinc-500">Modelo {driver.year} • Capacidad para 4 pasajeros</div>
                                    </div>
                                    <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-3xl">
                                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                                            <Calendar className="h-4 w-4" />
                                            Miembro AvivaGo
                                        </div>
                                        <div className="text-xl font-bold">Desde {driver.year_joined}</div>
                                        <div className="text-sm text-zinc-500">Perfil verificado por nuestro equipo</div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <Clock className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">Mis Servicios</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {driver.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-colors"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Verification Badge */}
                            <div className="backdrop-blur-xl bg-blue-600/5 border border-blue-600/20 rounded-[40px] p-8 flex items-center gap-6">
                                <div className="bg-blue-600 p-4 rounded-3xl">
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-1">Verificación de Identidad</h4>
                                    <p className="text-zinc-400 text-sm">Este conductor ha pasado por nuestro proceso de validación de documentos y antecedentes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfileView;
