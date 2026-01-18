'use client';

import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';

export default function OnboardingForm() {
    const router = useRouter();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert("¡Perfil creado con éxito! Redirigiendo al inicio...");
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header searchTerm="" onSearchChange={() => { }} />

            <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="text-sm font-semibold text-gray-500 hover:text-aviva-primary flex items-center gap-2 transition-colors"
                        >
                            ← Cancelar
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-aviva-border p-8">
                        <h2 className="text-2xl font-bold text-aviva-text mb-6">Registro de Conductor</h2>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Juan Pérez"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-aviva-primary focus:border-transparent outline-none transition text-aviva-text placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+57 300 ..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-aviva-primary focus:border-transparent outline-none transition text-aviva-text placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo (Modelo y Año)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Toyota Corolla 2022"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-aviva-primary focus:border-transparent outline-none transition text-aviva-text placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Biografía Profesional</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Describe tu experiencia, certificaciones y enfoque de servicio..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-aviva-primary focus:border-transparent outline-none transition text-aviva-text placeholder-gray-400 resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-aviva-primary text-white font-bold py-4 rounded-lg hover:bg-aviva-primaryHover transition-colors shadow-sm mt-4"
                            >
                                Crear Perfil
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
