import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPassengerQuotes } from '@/app/actions/passenger-quotes';
import PassengerQuoteList from './components/PassengerQuoteList';
import { FileText } from 'lucide-react';

export default async function MyRequestsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { success, data: quotes, error } = await getPassengerQuotes(user.id);

    if (!success || !quotes) {
        // You might want to handle this error more gracefully in the UI
        console.error('Failed to load quotes:', error);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#0F2137] flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                        <FileText className="w-8 h-8" />
                    </div>
                    Mis Solicitudes
                </h1>
                <p className="text-gray-500">
                    Consulta el historial y estado de las cotizaciones enviadas a conductores.
                </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-soft relative overflow-hidden min-h-[400px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 w-full max-w-4xl mx-auto">
                    {success ? (
                        <PassengerQuoteList quotes={quotes || []} />
                    ) : (
                        <div className="text-center text-red-500 py-10">
                            Ocurrió un error al cargar tus solicitudes. Por favor intenta más tarde.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
