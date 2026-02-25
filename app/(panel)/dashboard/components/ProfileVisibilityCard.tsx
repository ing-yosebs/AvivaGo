'use client'

import { ShieldCheck, Eye, EyeOff } from 'lucide-react'

interface ProfileVisibilityCardProps {
    isVisible: boolean
    onToggleVisibility: (visible: boolean) => Promise<void>
    updating?: boolean
    disabled?: boolean
}

export function ProfileVisibilityCard({ isVisible, onToggleVisibility, updating, disabled }: ProfileVisibilityCardProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
                <div className="space-y-1 w-full text-center sm:text-left">
                    <h3 className="text-lg font-bold text-[#0F2137] flex items-center justify-center sm:justify-start gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        Visibilidad del Perfil
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed w-full">
                        Un potenciador para tu negocio: únete al <strong>Catálogo de Búsqueda Nacional</strong> para que pasajeros nuevos de tu ciudad puedan encontrarte.
                    </p>
                </div>
                <div className="flex justify-center sm:justify-end py-2 sm:py-0">
                    <button
                        onClick={() => !updating && !disabled && onToggleVisibility(!isVisible)}
                        disabled={updating || disabled}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white ${isVisible ? 'bg-blue-600' : 'bg-gray-200'} ${updating || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isVisible ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isVisible
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-orange-50 border-orange-100 text-orange-700'
                }`}>
                {isVisible ? (
                    <>
                        <Eye className="h-5 w-5 shrink-0" />
                        <div className="text-xs">
                            <p className="font-bold uppercase tracking-wider">Visible en Catálogo</p>
                            <p className="opacity-80">Apareces en el radar de clientes nuevos que buscan conductores de confianza.</p>
                        </div>
                    </>
                ) : (
                    <>
                        <EyeOff className="h-5 w-5 shrink-0" />
                        <div className="text-xs">
                            <p className="font-bold uppercase tracking-wider">No Visible en Catálogo</p>
                            <p className="opacity-80">No estás en búsquedas. Sigue construyendo tu cartera fidelizando directamente a tus pasajeros.</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
