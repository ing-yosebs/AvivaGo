'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Award, Copy, Check, Info, Users, Share2, DollarSign } from 'lucide-react'

export default function WalletPage() {
    const [balance, setBalance] = useState({ available: 0, pending: 0 })
    const [transactions, setTransactions] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [copiedCode, setCopiedCode] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Get Wallet
            const { data: wallet } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (wallet) {
                setBalance({
                    available: Number(wallet.balance_available) || 0,
                    pending: Number(wallet.balance_pending) || 0
                })
            }

            // 2. Get Transactions
            if (wallet) {
                const { data: txs } = await supabase
                    .from('wallet_transactions')
                    .select('*')
                    .eq('wallet_id', wallet.id)
                    .order('created_at', { ascending: false })
                    .limit(20)
                setTransactions(txs || [])
            }

            // 3. Get Driver Profile (for Level and Referral Code)
            const { data: userData } = await supabase
                .from('users')
                .select('referral_code, passenger_credits')
                .eq('id', user.id)
                .single()

            const { data: driverData } = await supabase
                .from('driver_profiles')
                .select('affiliate_level, referral_count, b2c_referral_count')
                .eq('user_id', user.id)
                .single()

            setProfile({ ...userData, ...driverData })
            setLoading(false)
        }
        fetchData()
    }, [supabase])

    useEffect(() => {
        if (typeof window !== 'undefined' && profile?.referral_code) {
            setReferralLink(`${window.location.origin}/register?ref=${profile.referral_code}`)
        }
    }, [profile])

    const copyToClipboard = (text: string, type: 'code' | 'link') => {
        navigator.clipboard.writeText(text)
        if (type === 'code') {
            setCopiedCode(true)
            setTimeout(() => setCopiedCode(false), 2000)
        } else {
            setCopiedLink(true)
            setTimeout(() => setCopiedLink(false), 2000)
        }
    }

    if (loading) return <div className="p-8"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent" /></div>

    // Calculate level thresholds
    const getLevelData = (count = 0, currentLevel = 'bronze') => {
        if (currentLevel === 'gold' || count >= 51) {
            return {
                label: 'Oro',
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/20',
                commission: 120,
                nextLevel: null,
                target: 51
            }
        }
        if (count >= 11 || currentLevel === 'silver') {
            return {
                label: 'Plata',
                color: 'text-zinc-300',
                bg: 'bg-zinc-400/10',
                border: 'border-zinc-400/20',
                commission: 100,
                nextLevel: 'Oro',
                target: 51
            }
        }
        return {
            label: 'Bronce',
            color: 'text-amber-500',
            bg: 'bg-amber-700/10',
            border: 'border-amber-700/20',
            commission: 80,
            nextLevel: 'Plata',
            target: 11
        }
    }

    const levelData = getLevelData(profile?.referral_count, profile?.affiliate_level)

    // B2C Progress
    const b2cCount = profile?.b2c_referral_count || 0
    const b2cNextGoal = 20 - (b2cCount % 20)
    const b2cProgress = (b2cCount % 20) / 20 * 100

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-4 md:p-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-white">
                        <Wallet className="h-10 w-10 text-emerald-500" />
                        Mi Billetera
                    </h1>
                    <p className="text-zinc-400 mt-2">Gestiona tus ingresos del Programa de Afiliados AvivaGo.</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                    <div className="px-4 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Nivel</p>
                        <p className={`font-black ${levelData.color}`}>{levelData.label}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="px-4 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Referidos B2B</p>
                        <p className="font-black text-white">{profile?.referral_count || 0}</p>
                    </div>
                </div>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Balance Card */}
                <div className="lg:col-span-1 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="h-32 w-32" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            Saldo Disponible
                        </h3>

                        <div className="space-y-1">
                            <div className="text-6xl font-black text-white tracking-tighter">
                                ${balance.available.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400 font-medium">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <span>Pendiente: ${balance.pending.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-12 space-y-4">
                            <button
                                disabled={balance.available < 500}
                                className={`w-full py-4 rounded-[1.25rem] font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/10 ${balance.available >= 500
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <ArrowUpRight className="h-5 w-5" />
                                Retirar Fondos
                            </button>
                            {balance.available < 500 && (
                                <p className="text-[10px] text-center text-zinc-500 uppercase tracking-wider font-bold">
                                    Mínimo de retiro: $500.00 MXN
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Referral & Growth Section */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* B2B Referrals (Conductores) */}
                    <div className={`${levelData.bg} ${levelData.border} border rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group`}>
                        <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
                            <Award className="h-48 w-48 rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <Award className={`h-8 w-8 ${levelData.color}`} />
                                </div>
                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-widest">
                                    Modelo B2B
                                </span>
                            </div>

                            <h3 className={`text-2xl font-black ${levelData.color} mb-1`}>Nivel {levelData.label}</h3>
                            <p className="text-zinc-400 text-sm font-medium">Bono: <span className="text-white">${levelData.commission} MXN</span> por activación</p>

                            <div className="mt-8 space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Progreso Siguiente Nivel</span>
                                    {levelData.nextLevel ? (
                                        <span className="text-xs font-black text-white">{profile?.referral_count || 0} / {levelData.target}</span>
                                    ) : (
                                        <span className="text-xs font-black text-yellow-400 uppercase">Máximo Nivel</span>
                                    )}
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${levelData.color.replace('text', 'bg')}`}
                                        style={{ width: `${levelData.nextLevel ? Math.min(((profile?.referral_count || 0) / levelData.target) * 100, 100) : 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="mt-6 text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-relaxed">
                            {levelData.nextLevel
                                ? `Te faltan ${levelData.target - (profile?.referral_count || 0)} conductores para llegar a nivel ${levelData.nextLevel}`
                                : '¡Eres un embajador Oro! Disfrutas de las máximas comisiones.'}
                        </p>
                    </div>

                    {/* B2C Referrals (Pasajeros) */}
                    <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-8 flex flex-col justify-between group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                    <Users className="h-8 w-8 text-indigo-400" />
                                </div>
                                <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                                    Modelo B2C
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-1">Pasajeros Recomendados</h3>
                            <p className="text-zinc-400 text-sm font-medium">
                                Gana <span className="text-indigo-400">$200 MXN</span> por cada 20 registros
                            </p>

                            <div className="mt-8 space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-indigo-500/50 uppercase tracking-widest text-indigo-400">Próxima Recompensa</span>
                                    <span className="text-xs font-black text-white">{b2cCount % 20} / 20</span>
                                </div>
                                <div className="h-3 bg-indigo-950/50 rounded-full overflow-hidden border border-indigo-500/10 p-0.5">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                        style={{ width: `${b2cProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3 p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/10">
                            <TrendingUp className="h-4 w-4 text-indigo-400" />
                            <p className="text-xs text-indigo-200 font-bold">Total: {b2cCount} pasajeros registrados</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Section */}
            <div className="mt-12">
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-5">
                        <Share2 className="h-40 w-40" />
                    </div>

                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                        <Share2 className="h-6 w-6 text-blue-500" />
                        Invita y unifica la red
                    </h3>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1 space-y-6 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Tu Código Personal</p>
                                    <div className="bg-black border border-white/10 rounded-2xl p-4 flex items-center justify-between group/code hover:border-blue-500/50 transition-colors">
                                        <code className="text-2xl font-black text-white tracking-[0.2em]">
                                            {profile?.referral_code || '---'}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(profile?.referral_code || '', 'code')}
                                            className="p-3 bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl transition-all text-zinc-400"
                                        >
                                            {copiedCode ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Enlace Directo</p>
                                    <div className="bg-black border border-white/10 rounded-2xl p-4 flex items-center justify-between group/link hover:border-emerald-500/50 transition-colors">
                                        <div className="truncate text-zinc-400 text-sm font-mono flex-1 mr-4">
                                            {referralLink}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(referralLink, 'link')}
                                            className="p-3 bg-white/5 hover:bg-emerald-600 hover:text-white rounded-xl transition-all text-zinc-400"
                                        >
                                            {copiedLink ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20">
                                <p className="text-sm text-blue-200 leading-relaxed font-medium">
                                    <strong className="text-white block mb-1">¿Sabías qué?</strong>
                                    Al invitar conductores y pasajeros, no solo ganas dinero, sino que fortaleces la seguridad de tu propia red.
                                    Cada nuevo integrante pasa por los filtros de certificación de la Fundación Aviva.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-3xl shrink-0 group/qr hover:scale-105 transition-transform duration-500 shadow-2xl shadow-blue-500/10 self-center lg:self-start">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralLink)}`}
                                alt="QR de Referido"
                                className="w-[150px] h-[150px] lg:w-[180px] lg:h-[180px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white">Historial de Operaciones</h3>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Últimos movimientos</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <Clock className="h-5 w-5 text-zinc-400" />
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    {transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-5 bg-black/40 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl transition-all duration-500 ${tx.amount > 0
                                            ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
                                            : 'bg-zinc-800 text-zinc-400 group-hover:bg-white group-hover:text-black'
                                            }`}>
                                            {tx.amount > 0 ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-lg">{tx.description}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="h-1 w-1 rounded-full bg-zinc-700" />
                                                <span className={`text-[10px] uppercase font-black tracking-widest ${tx.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'
                                                    }`}>
                                                    {tx.status === 'pending' ? 'En Validación' : 'Completado'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'
                                            }`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.1em]">MXN</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="h-10 w-10 text-zinc-700" />
                            </div>
                            <h4 className="text-zinc-400 font-black uppercase tracking-widest">Sin actividad reciente</h4>
                            <p className="text-zinc-600 text-sm mt-2">Tus movimientos aparecerán aquí automáticamente.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Rules of the game at the bottom */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <Info className="h-6 w-6 text-amber-500" />
                        Reglas del Juego y Transparencia
                    </h3>
                    <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        Versión 1.0 (México)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { title: 'Validación de 15 días', desc: 'Las comisiones de conductores entran en estado pendiente por 15 días tras el pago de su anualidad.' },
                        { title: 'Requisitos de Activación', desc: 'Tu referido debe pagar su anualidad ($524 MXN) y aprobar la certificación de la Fundación Aviva.' },
                        { title: 'Transparencia Total', desc: 'Puedes retirar desde $500 MXN. Los retiros se procesan los días 5 de cada mes.' },
                        { title: 'Escalabilidad', desc: 'Tus beneficios aumentan automáticamente al subir de nivel (Bronce → Plata → Oro).' }
                    ].map((item, i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                <Check className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white leading-none mb-2">{item.title}</p>
                                <p className="text-xs text-zinc-400 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
