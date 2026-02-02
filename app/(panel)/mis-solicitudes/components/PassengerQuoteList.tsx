'use client';

import { useState } from 'react';
import { Calendar, FileText, Clock, MapPin, User, Globe } from 'lucide-react';
import Link from 'next/link';

interface Quote {
    id: string;
    passenger_id: string;
    driver_id: string;
    scheduled_date: string;
    details: string;
    origin_location?: string;
    destination_location?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    created_at: string;
    driver?: {
        user?: {
            full_name: string;
            avatar_url: string;
        },
        services?: {
            payment_methods?: string[];
            payment_link?: string;
        }[] | {
            payment_methods?: string[];
            payment_link?: string;
        };
    };
}

export default function PassengerQuoteList({ quotes }: { quotes: Quote[] }) {
    if (quotes.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[30px] border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sin solicitudes activas</h3>
                <p className="text-gray-500">Aún no has enviado ninguna solicitud de cotización.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {quotes.map((quote) => {
                const driverName = quote.driver?.user?.full_name || 'Conductor';
                const driverAvatar = quote.driver?.user?.avatar_url;
                const rideDate = new Date(quote.scheduled_date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const rideTime = new Date(quote.scheduled_date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

                return (
                    <div key={quote.id} className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        {/* Status Badge */}
                        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest
                            ${quote.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                quote.status === 'accepted' ? 'bg-green-100 text-green-600' :
                                    quote.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}
                        `}>
                            {quote.status === 'pending' && 'Pendiente'}
                            {quote.status === 'accepted' && 'Aceptada'}
                            {quote.status === 'rejected' && 'Rechazada'}
                            {quote.status === 'completed' && 'Completada'}
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Driver Info */}
                            <Link href={`/driver/${quote.driver_id}`} className="flex-shrink-0 group/avatar">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 overflow-hidden ring-0 group-hover/avatar:ring-4 group-hover/avatar:ring-blue-50 transition-all">
                                    {driverAvatar ? (
                                        <img src={driverAvatar} alt={driverName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                </div>
                            </Link>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#0F2137] font-display">
                                        Solicitud a{' '}
                                        <Link href={`/driver/${quote.driver_id}`} className="hover:text-blue-600 transition-colors hover:underline decoration-blue-200 underline-offset-4">
                                            {driverName}
                                        </Link>
                                    </h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Enviada el: {new Date(quote.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">
                                            Fecha de Viaje: {rideDate} a las {rideTime}
                                        </span>
                                    </div>
                                    {(quote.origin_location || quote.destination_location) && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-red-500" />
                                            <span className="truncate max-w-[200px]" title={`${quote.origin_location} -> ${quote.destination_location}`}>
                                                {quote.origin_location ? `${quote.origin_location} -> ` : ''}{quote.destination_location || 'Destino no especificado'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm text-gray-600 italic">
                                    "{quote.details}"
                                </div>

                                {/* Online Payment Button */}
                                {quote.status === 'accepted' && (() => {
                                    const services = Array.isArray(quote.driver?.services)
                                        ? quote.driver?.services[0]
                                        : quote.driver?.services;

                                    const hasOnlinePayment = services?.payment_methods?.includes('Pago en Línea');
                                    const paymentLink = services?.payment_link;

                                    if (hasOnlinePayment && paymentLink) {
                                        return (
                                            <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                                <a
                                                    href={paymentLink.startsWith('http') ? paymentLink : `https://${paymentLink}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] group text-sm w-full md:w-auto"
                                                >
                                                    <Globe className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                                    Pagar en Línea ahora
                                                </a>
                                                <p className="text-[10px] text-emerald-600 mt-1.5 font-medium ml-1">
                                                    * El conductor ha habilitado pagos directos para esta reserva.
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
