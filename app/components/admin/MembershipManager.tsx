'use client'

import { useState } from 'react'
import { extendDriverMembership } from '@/app/admin/users/actions'
import { CreditCard, Calendar, Clock, AlertTriangle, CheckCircle, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MembershipManager({
    driverProfileId,
    membershipStatus,
    expiresAt,
    origin
}: {
    driverProfileId: string
    membershipStatus: string
    expiresAt: string | null
    origin: string
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [daysToAdd, setDaysToAdd] = useState<number | ''>('')
    const [customDays, setCustomDays] = useState(false)

    const router = useRouter()

    const handleExtend = async (days: number) => {
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const result = await extendDriverMembership(driverProfileId, days)
            if (result.success) {
                setSuccess(result.message || 'Membresía extendida')
                setDaysToAdd('')
                setTimeout(() => {
                    setSuccess(null)
                    router.refresh()
                }, 2000)
            } else {
                setError(result.error || 'Error desconocido')
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            case 'expired': return 'text-red-400 bg-red-500/10 border-red-500/20'
            case 'canceled': return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
            default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        }
    }

    const isExpired = membershipStatus === 'expired' || (expiresAt && new Date(expiresAt) < new Date())

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                Membresía / Trial
            </h3>

            {/* Current Status */}
            <div className="space-y-4 mb-6">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${getStatusColor(membershipStatus)}`}>
                    <div className="flex items-center gap-2">
                        {membershipStatus === 'active' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        <span className="font-bold uppercase text-sm">{membershipStatus === 'active' ? 'Activa' : 'Inactiva'}</span>
                    </div>
                    {origin === 'trial' && <span className="text-xs font-mono uppercase border border-current px-1 rounded">Trial</span>}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-zinc-400 text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Vence el:
                    </span>
                    <span className={`font-mono font-medium ${isExpired ? 'text-red-400' : 'text-white'}`}>
                        {expiresAt
                            ? new Date(expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Nunca'
                        }
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                    Extender Manualmente (Admin)
                </label>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => handleExtend(7)}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-zinc-300 text-xs py-2 rounded-lg border border-white/5 font-medium"
                    >
                        +7 Días
                    </button>
                    <button
                        onClick={() => handleExtend(14)}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-zinc-300 text-xs py-2 rounded-lg border border-white/5 font-medium"
                    >
                        +14 Días
                    </button>
                    <button
                        onClick={() => handleExtend(30)}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-zinc-300 text-xs py-2 rounded-lg border border-white/5 font-medium"
                    >
                        +30 Días
                    </button>
                    <button
                        onClick={() => setCustomDays(!customDays)}
                        disabled={loading}
                        className={`bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs py-2 rounded-lg border border-white/5 font-medium ${customDays ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 'text-zinc-300'}`}
                    >
                        Personalizado...
                    </button>
                </div>

                {/* Custom Days Input */}
                {customDays && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                        <input
                            type="number"
                            placeholder="Días"
                            value={daysToAdd}
                            onChange={(e) => setDaysToAdd(parseInt(e.target.value) || '')}
                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-blue-500/50"
                        />
                        <button
                            onClick={() => typeof daysToAdd === 'number' && handleExtend(daysToAdd)}
                            disabled={loading || typeof daysToAdd !== 'number' || daysToAdd <= 0}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider transition-colors"
                        >
                            Aplicar
                        </button>
                    </div>
                )}

                {/* Feedback */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2 mt-2 animate-in fade-in">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2 mt-2 animate-in fade-in">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        {success}
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] text-zinc-600 italic text-center">
                    <Shield className="h-3 w-3 inline mr-1" />
                    Acción reservada para administradores.
                </p>
            </div>
        </div>
    )
}
