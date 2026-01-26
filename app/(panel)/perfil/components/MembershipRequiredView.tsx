'use client'

import { CreditCard, ArrowRight } from 'lucide-react'

export default function MembershipRequiredView({ onTabChange }: { onTabChange: (tab: string) => void }) {
    return (
        <div className="py-20 flex flex-col items-center text-center max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center ring-8 ring-indigo-600/5">
                <CreditCard className="h-10 w-10 text-indigo-500" />
            </div>
            <div className="space-y-4">
                <h3 className="text-3xl font-black text-white">Membresía Requerida</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                    Para configurar tus servicios y ser visible en la plataforma, necesitas activar tu Membresía Driver Premium.
                </p>
            </div>
            <button
                onClick={() => onTabChange('payments')}
                className="group flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
                Ir a Pagos y Membresía
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    )
}
