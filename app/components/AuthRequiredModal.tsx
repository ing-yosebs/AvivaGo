'use client';

import { X, LogIn, UserPlus, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AvivaLogo from '@/app/components/AvivaLogo';

interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    redirectUrl?: string;
    title?: string;
    message?: string;
}

export default function AuthRequiredModal({
    isOpen,
    onClose,
    redirectUrl,
    title = "Acceso Restringido",
    message = "Esta función es exclusiva para usuarios registrados. Por favor, inicia sesión o regístrate para continuar."
}: AuthRequiredModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleAction = (action: 'login' | 'register') => {
        const urlWithRedirect = redirectUrl
            ? `/auth/${action}?redirect=${encodeURIComponent(redirectUrl)}`
            : `/auth/${action}`;

        router.push(urlWithRedirect);
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[30px] w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header with visual element */}
                <div className="bg-aviva-primary/5 pt-10 pb-6 text-center relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-blue-100/30 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 transform rotate-3">
                            <AvivaLogo className="h-10 w-auto text-aviva-primary" showText={false} />
                        </div>
                        <h2 className="text-2xl font-bold font-display text-aviva-navy px-6">{title}</h2>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-gray-600 text-center text-lg leading-relaxed">
                        {message}
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleAction('login')}
                            className="w-full bg-aviva-primary text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <LogIn className="w-5 h-5" />
                            Iniciar Sesión
                        </button>

                        <button
                            onClick={() => handleAction('register')}
                            className="w-full bg-white text-aviva-primary border-2 border-aviva-primary/10 font-bold py-4 rounded-xl hover:bg-blue-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <UserPlus className="w-5 h-5" />
                            Crear una Cuenta
                        </button>
                    </div>

                    <div className="pt-2 text-center">
                        <p className="text-xs text-gray-400">
                            Unirse a AvivaGo es rápido, seguro y gratuito.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
