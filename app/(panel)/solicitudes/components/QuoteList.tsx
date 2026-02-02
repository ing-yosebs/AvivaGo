'use client';

import { useState } from 'react';
import { Calendar, FileText, Check, X, MessageCircle, Clock } from 'lucide-react';
import { updateQuoteStatus } from '@/app/driver/actions';

interface Quote {
    id: string;
    passenger_id: string;
    driver_id: string;
    scheduled_date: string;
    details: string;
    contact_phone: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    created_at: string;
    passenger?: {
        full_name: string;
        avatar_url: string;
    };
}

export default function QuoteList({ quotes }: { quotes: Quote[] }) {
    const [localQuotes, setLocalQuotes] = useState(quotes);
    const [loadingIds, setLoadingIds] = useState<string[]>([]);

    async function handleStatusUpdate(id: string, newStatus: 'accepted' | 'rejected') {
        setLoadingIds(prev => [...prev, id]);

        const result = await updateQuoteStatus(id, newStatus);

        if (result.success) {
            setLocalQuotes(prev => prev.map(q =>
                q.id === id ? { ...q, status: newStatus } : q
            ));
        } else {
            alert('Error al actualizar estado');
        }

        setLoadingIds(prev => prev.filter(loadingId => loadingId !== id));
    }

    if (localQuotes.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[30px] border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sin solicitudes pendientes</h3>
                <p className="text-gray-500">Aún no has recibido solicitudes de cotización.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {localQuotes.map((quote) => {
                const passengerName = quote.passenger?.full_name || 'Pasajero';
                const rideDate = new Date(quote.scheduled_date).toLocaleString();
                const whatsappText = encodeURIComponent(
                    `Hola ${passengerName}, soy tu conductor de AvivaGo. Recibí tu solicitud de cotización realizada el ${new Date(quote.created_at).toLocaleDateString()} para el viaje programado el ${rideDate}. ¿Cómo te encuentras?`
                );

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
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Passenger Info */}
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400">
                                    {quote.passenger?.avatar_url ? (
                                        <img src={quote.passenger.avatar_url} alt="User" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span className="text-xl">?</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#0F2137] font-display">
                                        {passengerName} <span className="text-gray-500 font-normal">solicitó una cotización</span>
                                    </h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Realizada el: {new Date(quote.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">
                                            Fecha de Viaje: {rideDate}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm text-gray-600 italic">
                                    "{quote.details}"
                                </div>

                                {/* Actions */}
                                <div className="pt-2 flex gap-3">
                                    {quote.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(quote.id, 'accepted')}
                                                disabled={loadingIds.includes(quote.id)}
                                                className="flex-1 bg-aviva-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Aceptar Solicitud
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(quote.id, 'rejected')}
                                                disabled={loadingIds.includes(quote.id)}
                                                className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}

                                    {quote.status === 'accepted' && (
                                        <a
                                            href={`https://wa.me/${quote.contact_phone.replace(/\D/g, '')}?text=${whatsappText}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => {
                                                import('@/app/driver/actions').then(({ logQuoteInteraction }) => {
                                                    logQuoteInteraction(quote.id, 'contact_viewed');
                                                });
                                            }}
                                            className="w-full bg-green-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Contactar por WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
