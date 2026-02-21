'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Loader2, Check, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SecuritySection({ profile }: { profile: any }) {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const supabase = createClient()

    const handleUpdatePassword = async () => {
        setMessage(null)

        if (!password || !confirmPassword) {
            setMessage({ type: 'error', text: 'Por favor, completa ambos campos.' })
            return
        }

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
            return
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' })
            setPassword('')
            setConfirmPassword('')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">


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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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

                    {message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}

                    <button
                        onClick={handleUpdatePassword}
                        disabled={loading}
                        className="w-full bg-[#0F2137] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#0F2137]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#0F2137]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                </div>
            </div>
        </div>
    )
}
