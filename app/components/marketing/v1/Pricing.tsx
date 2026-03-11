'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, CreditCard, Car } from 'lucide-react';
import AvivaLogo from '@/app/components/AvivaLogo';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Pricing() {
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
                    // Limpiar URL
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
                    setPricing({
                        amount: '30',
                        currency: 'USD'
                    });
                } else {
                    setPricing({
                        amount: '524',
                        currency: 'MXN'
                    });
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
            // Ya sabemos que hay usuario por el handleCTAClick

            // Si está logueado, iniciamos el flujo de Stripe
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
        <section className="py-12 bg-gray-50" id="pricing">
            <PaymentConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                amount={pricing.amount}
                currency={pricing.currency}
                onConfirm={handleConfirmPayment}
                isLoading={isPurchasing}
            />
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
                        Invierte en <span className="text-aviva-primary">Tu Futuro</span>
                    </h2>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto px-4">
                        Todo lo que necesitas para operar como una empresa profesional, por una fracción de lo que costaría desarrollarlo desde cero.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">

                    {/* Main Pricing Card */}
                    <div className="bg-aviva-navy text-white rounded-3xl p-8 md:p-12 border border-aviva-primary/30 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-aviva-secondary text-white text-xs font-bold px-4 py-2 rounded-bl-xl uppercase tracking-wider">
                            Membresía Anual
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <AvivaLogo className="h-16 w-auto" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Todo Incluido</h3>
                                    <p className="text-blue-100 text-sm md:text-base">Tu plataforma profesional lista en minutos.</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <div className="flex items-baseline md:justify-end gap-1">
                                    <span className="text-6xl font-extrabold text-white">${pricing.amount}<sup className="text-2xl font-normal text-white/70 ml-1">*</sup></span>
                                    <span className="text-xl font-bold text-white/90">{pricing.currency}</span>
                                </div>
                                <p className="text-white/80 text-sm mt-1">Pago único anual</p>
                                {pricing.currency === 'MXN' && (
                                    <p className="text-aviva-secondary text-sm font-bold mt-1">
                                        3 meses sin intereses con tarjetas de crédito
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-10 md:mb-12">
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5 shrink-0" />
                                    <span className="text-white text-sm md:text-base">Perfil Web Pro Indexado en Google</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5 shrink-0" />
                                    <span className="text-white text-sm md:text-base">Gestión de Cartera Propia Directa</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5 shrink-0" />
                                    <span className="text-white text-sm md:text-base">Botón de Pago Directo a Tu Banco</span>
                                </li>
                            </ul>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5 shrink-0" />
                                    <span className="text-white text-sm md:text-base">Directorio VIP (Nuevos Pasajeros)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5 shrink-0" />
                                    <span className="text-white text-sm md:text-base">Kit de Marketing Pro (Físico/Digital)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={22} className="text-aviva-secondary mt-0.5 shrink-0" />
                                    <span className="text-white text-sm md:text-base">Certificación y Sello de Verificado</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <span className="text-sm font-bold text-white/90 tracking-widest -mb-4 uppercase">
                                Activa tu Perfil Profesional
                            </span>
                            <Link
                                href="/register?role=driver"
                                onClick={handleCTAClick}
                                className="w-full bg-aviva-secondary hover:bg-aviva-secondary/90 text-white font-bold text-xl py-5 rounded-2xl transition-all shadow-lg hover:shadow-aviva-secondary/40 text-center flex items-center justify-center gap-3"
                            >
                                <Car size={24} />
                                Activar Plan Pro
                            </Link>
                            <p className="text-white/80 text-sm font-medium text-center px-4">
                                * Para aparecer en el Buscador VIP, recibir solicitudes de nuevos pasajeros e indexar tu perfil en Google, es necesario tener la Membresía Activa.
                            </p>

                            <div className="flex flex-col items-center gap-3">
                                <p className="text-white/80 text-sm flex items-center gap-2">
                                    <CreditCard size={18} />
                                    Aceptamos tarjetas de Crédito y Débito
                                </p>
                                <div className="flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                                    {/* Placeholder icons for cards */}
                                    <div className="text-xs font-bold border border-white/20 px-2 py-1 rounded">VISA</div>
                                    <div className="text-xs font-bold border border-white/20 px-2 py-1 rounded">MASTERCARD</div>
                                    <div className="text-xs font-bold border border-white/20 px-2 py-1 rounded">AMEX</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
