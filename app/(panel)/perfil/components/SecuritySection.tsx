'use client'

import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react'

export default function SecuritySection({ isDriver, isVisible, onToggleVisibility }: any) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Visibilidad del Perfil (Solo para conductores) */}
            {isDriver && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-[#0F2137] flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                                Visibilidad del Perfil
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                                Controla si los pasajeros pueden encontrarte en los resultados de búsqueda.
                            </p>
                        </div>
                        <button
                            onClick={() => onToggleVisibility(!isVisible)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white ${isVisible ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isVisible ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>

                    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isVisible
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-orange-50 border-orange-100 text-orange-700'
                        }`}>
                        {isVisible ? (
                            <>
                                <Eye className="h-5 w-5 shrink-0" />
                                <div className="text-xs">
                                    <p className="font-bold uppercase tracking-wider">Perfil Público</p>
                                    <p className="opacity-80">Los pasajeros pueden ver tu información y contactarte.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <EyeOff className="h-5 w-5 shrink-0" />
                                <div className="text-xs">
                                    <p className="font-bold uppercase tracking-wider">Perfil Oculto</p>
                                    <p className="opacity-80">No aparecerás en las búsquedas hasta que lo actives.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Cambio de Contraseña */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 space-y-8 shadow-soft">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#0F2137] flex items-center gap-2">
                        <Lock className="h-5 w-5 text-blue-600" />
                        Seguridad de la Cuenta
                    </h3>
                    <p className="text-gray-500 text-sm">Actualiza tu contraseña periódicamente para mantener tu cuenta segura. Tu nueva contraseña debe tener al menos 6 caracteres.</p>
                </div>

                <div className="space-y-6 max-w-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nueva Contraseña */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Nueva Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-5 pr-12 py-3.5 text-[#0F2137] placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F2137] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Confirmar</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-5 pr-12 py-3.5 text-[#0F2137] placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F2137] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-[#0F2137] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#0F2137]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#0F2137]/20">
                        Actualizar Contraseña
                    </button>
                </div>
            </div>
        </div>
    )
}
