'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import { Rocket, Phone, Car, BookOpen, User, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { submitOnboarding } from '@/app/driver/actions';

export default function OnboardingForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await submitOnboarding(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/driver/dashboard');
                    router.refresh();
                }, 2000);
            }
        });
    };

    if (success) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center backdrop-blur-xl">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-500/20 p-4 rounded-full animate-bounce">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">¡Perfil Creado!</h2>
                    <p className="text-zinc-400">Tu cuenta de conductor ha sido activada correctamente. Redirigiendo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <Header />

            <main className="flex-1 pt-24 pb-12 px-4 relative z-10">
                <div className="max-w-xl mx-auto">
                    <div className="mb-6 flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Cancelar
                        </button>
                    </div>

                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="inline-flex bg-white/10 p-3 rounded-2xl border border-white/10 mb-4">
                                <Rocket className="h-6 w-6 text-white transform -rotate-45" />
                            </div>
                            <h2 className="text-2xl font-bold">Completa tu Perfil</h2>
                            <p className="text-zinc-500 text-sm mt-1">Sube la información necesaria para empezar a recibir clientes</p>
                        </div>

                        <form action={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-zinc-600" />
                                        <input
                                            name="fullName"
                                            type="text"
                                            required
                                            placeholder="Ej. Juan Pérez"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Teléfono (WhatsApp)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-5 w-5 text-zinc-600" />
                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            placeholder="+503 7000 0000"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Vehículo (Marca, Modelo, Año)</label>
                                    <div className="relative">
                                        <Car className="absolute left-3 top-3 h-5 w-5 text-zinc-600" />
                                        <input
                                            name="vehicleInfo"
                                            type="text"
                                            required
                                            placeholder="Ej. Toyota Corolla 2022 Blanco"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Biografía Profesional</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-3 h-5 w-5 text-zinc-600" />
                                        <textarea
                                            name="bio"
                                            required
                                            rows={4}
                                            placeholder="Describe tu experiencia, zonas que cubres y enfoque de servicio..."
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Crear Perfil de Conductor'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
