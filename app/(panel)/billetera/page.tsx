'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Award, Copy, Check, Info } from 'lucide-react'

export default function WalletPage() {
    const [balance, setBalance] = useState({ available: 0, pending: 0 })
    const [transactions, setTransactions] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
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
            // Referral code is on public.users
            const { data: userData } = await supabase
                .from('users')
                .select('referral_code, passenger_credits')
                .eq('id', user.id)
                .single()

            const { data: driverData } = await supabase
                .from('driver_profiles')
                .select('affiliate_level, referral_count')
                .eq('user_id', user.id)
                .single()

            setProfile({ ...userData, ...driverData })
            setLoading(false)
        }
        fetchData()
    }, [supabase])

    const copyCode = () => {
        if (!profile?.referral_code) return
        navigator.clipboard.writeText(profile.referral_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return <div className="p-8"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent" /></div>

    const levelColors: any = {
        bronze: { bg: 'bg-amber-700/20', text: 'text-amber-500', border: 'border-amber-700/30', label: 'Bronce' },
        silver: { bg: 'bg-zinc-400/20', text: 'text-zinc-300', border: 'border-zinc-400/30', label: 'Plata' },
        gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Oro' }
    }

    const currentLevel = levelColors[profile?.affiliate_level || 'bronze']

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Wallet className="h-8 w-8 text-emerald-500" />
                    Mi Billetera
                </h1>
                <p className="text-zinc-400 mt-2">Gestiona tus ganancias y nivel de afiliado.</p>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Balance Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="h-24 w-24" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Saldo Disponible</h3>
                    <div className="text-4xl font-mono font-bold text-white mb-2">
                        ${balance.available.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Clock className="h-4 w-4" />
                        <span>Pendiente: ${balance.pending.toFixed(2)}</span>
                    </div>
                    <button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        <ArrowUpRight className="h-5 w-5" />
                        Retirar Fondos
                    </button>
                </div>

                {/* Level Card */}
                <div className={`border rounded-3xl p-6 relative overflow-hidden ${currentLevel.bg} ${currentLevel.border}`}>
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Award className="h-24 w-24" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <Award className={`h-6 w-6 ${currentLevel.text}`} />
                        <h3 className={`text-sm font-bold uppercase tracking-widest ${currentLevel.text}`}>Nivel Actual</h3>
                    </div>
                    <div className={`text-4xl font-black ${currentLevel.text} mb-2`}>
                        {currentLevel.label}
                    </div>
                    <p className="text-sm text-zinc-400 mb-6">
                        Comisión por referido: <span className="text-white font-bold">${profile?.affiliate_level === 'gold' ? '120.00' : (profile?.affiliate_level === 'silver' ? '100.00' : '80.00')} MXN</span>
                    </p>
                    <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                        <div className={`h-full rounded-full ${currentLevel.text.replace('text', 'bg')} w-[${Math.min((profile?.referral_count / 10) * 100, 100)}%] transition-all`} style={{ width: `${Math.min((profile?.referral_count / 10) * 100, 100)}%` }} />
                    </div>
                    <p className="text-xs text-zinc-500 text-right">{profile?.referral_count} / 10 referidos para siguiente nivel</p>
                </div>

                {/* Referral Code Card */}
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Tu Código de Invitar</h3>
                    <div className="bg-zinc-950 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between mb-4">
                        <code className="text-2xl font-black text-white tracking-wider">
                            {profile?.referral_code || '---'}
                        </code>
                        <button onClick={copyCode} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-indigo-400">
                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </button>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">
                        Comparte este código con otros conductores.
                    </p>
                    <div className="p-3 bg-indigo-500/10 rounded-xl flex items-start gap-3">
                        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-300">
                            Ganas cuando tu referido activa su membresía anual. Los fondos se liberan 15 días después.
                        </p>
                    </div>
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6">Historial de Movimientos</h3>
                {transactions.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {tx.amount > 0 ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{tx.description}</h4>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(tx.created_at).toLocaleDateString()} • {tx.status === 'pending' ? 'Pendiente' : 'Disponible'}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-xl font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'
                                    }`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-zinc-500">
                        No tienes movimientos registrados todavía.
                    </div>
                )}
            </div>
        </div>
    )
}
