import { BadgeCheck, Calendar } from 'lucide-react'

export default function MembershipStatusCard() {
    return (
        <>
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <BadgeCheck className="h-32 w-32 text-indigo-900" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg text-white">Membresía Activa</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-[#0F2137]">Plan Driver Premium</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md">Tu suscripción anual te permite aparecer en los resultados de búsqueda y recibir contactos directos de pasajeros.</p>

                <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        <span>Próximo cobro: {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>
        </>
    )
}
