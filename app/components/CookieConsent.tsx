'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem('avivago_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('avivago_cookie_consent', 'true');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('avivago_cookie_consent', 'false');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-aviva-navy/95 text-white p-4 shadow-lg border-t border-aviva-gold/30 backdrop-blur-sm transition-transform duration-500 ease-in-out transform translate-y-0">
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm md:text-base text-gray-200">
                    <p>
                        Utilizamos cookies para mejorar tu experiencia en AvivaGo.
                        Al continuar navegando, aceptas nuestro uso de cookies de acuerdo con nuestro{' '}
                        <Link href="/legales/aviso-de-privacidad" className="text-aviva-gold hover:underline font-medium">
                            Aviso de Privacidad
                        </Link>.
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 bg-aviva-gold hover:bg-yellow-600 text-aviva-navy font-bold rounded-lg shadow-md transition-all transform hover:scale-105 active:scale-95 text-sm"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}
