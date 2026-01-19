'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Driver } from '../lib/mockData';
import Header from './Header';

// Icons
const LocationIcon = () => (
    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
);

const ProfileView = ({ driver }: { driver: Driver }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);

    // In a real app, Header state would be lifted or context
    const [searchTerm, setSearchTerm] = useState('');

    const handleUnlock = () => {
        if (confirm("Confirmar pago simulado")) {
            setIsUnlocked(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Back Nav */}
                    <div className="mb-6">
                        <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-aviva-primary flex items-center gap-2 transition-colors">
                            ← Volver al listado
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-aviva-border overflow-hidden">
                        {/* Profile Header Mobile */}
                        <div className="md:hidden h-52 bg-gray-100 relative">
                            <img src={driver.photo} className="w-full h-full object-cover" alt={driver.name} />
                        </div>

                        <div className="flex flex-col md:flex-row">
                            {/* Sidebar / Left Column */}
                            <div className="w-full md:w-1/3 bg-white p-8 border-r border-gray-100 flex flex-col">
                                <img
                                    src={driver.photo}
                                    className="hidden md:block w-32 h-32 rounded-full object-cover mb-6 ring-4 ring-gray-100 shadow-sm"
                                    alt={driver.name}
                                />

                                <h1 className="text-2xl font-bold text-aviva-text mb-1">{driver.name}</h1>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-6">
                                    <LocationIcon /> {driver.city}
                                </div>

                                {/* Contact Card (Dynamic State) */}
                                {isUnlocked ? (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mt-6 animate-fade-in">
                                        <div className="flex justify-center mb-2">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckIcon />
                                            </div>
                                        </div>
                                        <p className="text-green-800 font-bold text-sm uppercase tracking-wide mb-2">Contacto Directo</p>
                                        <p className="text-xl lg:text-2xl font-mono font-bold text-aviva-text tracking-tight mb-4 select-all">
                                            {driver.phone}
                                        </p>
                                        <a
                                            href={`https://wa.me/?text=Hola ${driver.name}, vi tu perfil en AvivaGo.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full block bg-[#25D366] text-white font-bold py-3 rounded-lg hover:bg-green-600 transition shadow-sm text-sm"
                                        >
                                            Escribir al WhatsApp
                                        </a>
                                    </div>
                                ) : (
                                    <div className="bg-aviva-tag border border-aviva-border rounded-xl p-6 mt-6">
                                        <div className="text-center mb-6">
                                            <p className="text-gray-500 text-sm mb-1">Costo de desbloqueo</p>
                                            <div className="flex justify-center items-baseline gap-1">
                                                <span className="text-3xl font-bold text-aviva-text">${driver.price.toFixed(2)}</span>
                                                <span className="text-sm font-normal text-gray-400">USD</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Pago único • Acceso ilimitado</p>
                                        </div>
                                        <button
                                            onClick={handleUnlock}
                                            className="w-full bg-aviva-primary text-white font-bold py-3.5 rounded-lg hover:bg-aviva-primaryHover transition-colors shadow-sm text-sm"
                                        >
                                            Desbloquear Contacto
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Main Content / Right Column */}
                            <div className="flex-1 p-8 md:bg-gray-50/30">
                                <div className="max-w-none text-gray-600">
                                    <div className="border-b border-gray-200 pb-2 mb-4">
                                        <h3 className="text-aviva-text font-bold text-base uppercase tracking-wide">Perfil Profesional</h3>
                                    </div>
                                    <p className="leading-relaxed mb-8 text-gray-600">{driver.bio}</p>

                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vehículo</span>
                                            <span className="text-aviva-text font-semibold">{driver.vehicle}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Año</span>
                                            <span className="text-aviva-text font-semibold">{driver.year}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Miembro Desde</span>
                                            <span className="text-aviva-text font-semibold">{driver.year_joined || "2023"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Viajes</span>
                                            <span className="text-aviva-text font-semibold">{driver.reviews}+</span>
                                        </div>
                                    </div>

                                    <div className="border-b border-gray-200 pb-2 mb-4">
                                        <h3 className="text-aviva-text font-bold text-base uppercase tracking-wide">Servicios & Etiquetas</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {driver.tags.map(tag => (
                                            <span key={tag} className="bg-white px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
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
