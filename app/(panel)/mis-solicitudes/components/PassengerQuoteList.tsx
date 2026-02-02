'use client';

import { useState } from 'react';
import { Calendar, FileText, Clock, MapPin, User } from 'lucide-react';

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
        }
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
                const rideDate = new Date(quote.scheduled_date).toLocaleString();

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
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 overflow-hidden">
                                    {driverAvatar ? (
                                        <img src={driverAvatar} alt={driverName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#0F2137] font-display">
                                        Solicitud a {driverName}
                                    </h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Enviada el: {new Date(quote.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">
                                            Fecha de Viaje: {rideDate}
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
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
