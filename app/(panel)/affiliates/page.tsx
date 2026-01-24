'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Users,
    Wallet,
    Award,
    Copy,
    ArrowUpRight,
    QrCode,
    History,
    CheckCircle
} from 'lucide-react'

export default function AffiliatesPage() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [wallet, setWallet] = useState<any>(null)
    const [referralLink, setReferralLink] = useState('')
    const [transactions, setTransactions] = useState<any[]>([])

    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // 1. Get User & Profile Data (Referral Code, Level)
                const { data: userData } = await supabase
                    .from('users')
                    .select('*, driver_profiles(*)')
                    .eq('id', user.id)
                    .single()

                // 2. Get Wallet
                const { data: walletData } = await supabase
                    .from('wallets')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                // 3. Get Transactions
                if (walletData) {
                    const { data: txs } = await supabase
                        .from('wallet_transactions')
                        .select('*')
                        .eq('wallet_id', walletData.id)
                        .order('created_at', { ascending: false })
                        .limit(5)
                    setTransactions(txs || [])
                }

                if (userData) {
                    const driverProfile = userData.driver_profiles?.[0] || {}
                    setProfile({
                        ...driverProfile,
                        referral_code: userData.referral_code,
                        full_name: userData.full_name
                    })
                    setWallet(walletData || { balance_available: 0, balance_pending: 0 })

                    // Generate Link
                    const origin = window.location.origin
                    setReferralLink(`${origin}/register?ref=${userData.referral_code}`)
                }
            }
            setLoading(false)
        }
        fetchData()
    }, [supabase])

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink)
        alert('Enlace copiado al portapapeles')
    }

    if (loading) {
        return <div className="p-10 text-center text-zinc-500">Cargando datos de afiliados...</div>
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-purple-500/10 text-purple-400 border-purple-500/20">
                        Programa Red de Certeza
                    </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Panel de Afiliados
                </h1>
                <p className="text-zinc-400">
                    Gana comisiones invitando a conductores y pasajeros a unirse a AvivaGo.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Wallet className="h-5 w-5 text-green-500" />}
                    label="Saldo Disponible"
                    value={`$${wallet?.balance_available || '0.00'}`}
                    sub="MXN"
                />
                <StatCard
                    icon={<History className="h-5 w-5 text-orange-500" />}
                    label="Saldo Pendiente"
                    value={`$${wallet?.balance_pending || '0.00'}`}
                    sub="En validación (15 días)"
                />
                <StatCard
                    icon={<Users className="h-5 w-5 text-blue-500" />}
                    label="Conductores Referidos"
                    value={profile?.referral_count || 0}
                    sub="Activos"
                />
                <div className={`backdrop-blur-xl border rounded-2xl p-6 transition-colors cursor-default ${profile?.affiliate_level === 'gold' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        profile?.affiliate_level === 'silver' ? 'bg-zinc-400/10 border-zinc-400/30' :
                            'bg-amber-700/10 border-amber-700/30'
                    }`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 rounded-lg bg-black/20">
                            <Award className={`h-5 w-5 ${profile?.affiliate_level === 'gold' ? 'text-yellow-400' :
                                    profile?.affiliate_level === 'silver' ? 'text-zinc-300' :
                                        'text-amber-600'
                                }`} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10">
                            Nivel Actual
                        </span>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-sm mb-1">Tu Rango</p>
                        <h4 className="text-2xl font-bold capitalize">{profile?.affiliate_level || 'Bronze'}</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Link & List */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Share Box */}
                    <div className="backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-8">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-blue-400" />
                            Tu Enlace de Referido
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            Comparte este enlace con otros conductores o pasajeros. Cuando se registren y activen, ganarás recompensas automáticamente.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 font-mono text-sm truncate flex items-center">
                                {referralLink || 'Generando enlace...'}
                            </div>
                            <button
                                onClick={copyLink}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Copiar
                            </button>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                            <span className="font-bold text-white">Código:</span> {profile?.referral_code || '---'}
                            <span className="px-2">•</span>
                            Invita Pasajeros y Conductores con este mismo enlace.
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                        <h3 className="text-xl font-bold mb-6">Historial de Transacciones</h3>
                        {transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.map((tx) => (
                                    <TransactionItem key={tx.id} tx={tx} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-zinc-500 border border-dashed border-white/10 rounded-xl">
                                <Wallet className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p>Aún no tienes movimientos en tu billetera.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="font-bold mb-4 text-green-400">¿Cómo ganar más?</h3>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>Gana <strong className="text-white">$80-$120 MXN</strong> por cada conductor que actives.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>Recibe <strong className="text-white">$200 MXN</strong> por cada 20 pasajeros registrados.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>Bonos anuales por renovación de tu red.</span>
                            </li>
                        </ul>
                    </div>

                    <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group">
                        Solicitar Retiro
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                    <p className="text-xs text-center text-zinc-600">
                        Mínimo de retiro: $500.00 MXN
                    </p>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, sub }: any) {
    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-default">
            <div className="flex items-start justify-between mb-4">
                <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-zinc-500 text-sm mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h4 className="text-2xl font-bold">{value}</h4>
                    {sub && <span className="text-xs text-zinc-500">{sub}</span>}
                </div>
            </div>
        </div>
    )
}

function TransactionItem({ tx }: any) {
    const isPositive = tx.amount > 0
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${isPositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                </div>
                <div>
                    <p className="font-medium text-white">{tx.description || 'Movimiento de saldo'}</p>
                    <p className="text-xs text-zinc-500 capitalize">{tx.transaction_type?.replace('_', ' ')} • {new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold ${isPositive ? 'text-green-400' : 'text-white'}`}>
                    {isPositive ? '+' : ''}{tx.amount}
                </p>
                <p className={`text-xs ${tx.status === 'available' ? 'text-green-600' :
                        tx.status === 'pending' ? 'text-orange-500' : 'text-zinc-600'
                    }`}>
                    {tx.status === 'available' ? 'Disponible' : 'Pendiente'}
                </p>
            </div>
        </div>
    )
}
