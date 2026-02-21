'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Award, Copy, Check, Info, Users, Share2, DollarSign, Car, Loader2 } from 'lucide-react'


import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MembershipRequiredView from '../perfil/components/MembershipRequiredView'

export default function WalletPage() {
    const router = useRouter()
    const [balance, setBalance] = useState({ available: 0, pending: 0 })
    const [transactions, setTransactions] = useState<any[]>([])
    const [referrals, setReferrals] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [copiedCode, setCopiedCode] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [hasMembership, setHasMembership] = useState(false)
    const [membershipDate, setMembershipDate] = useState<Date | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 0. Refresh pending funds (Liberar fondos vencidos automáticamente)
            await supabase.rpc('release_pending_wallet_funds')

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

            // 3. Get Referrals List
            const { data: refs } = await supabase
                .from('users')
                .select(`
                    id,
                    full_name,
                    email,
                    avatar_url,
                    created_at,
                    roles,
                    driver_profiles (
                        id,
                        profile_photo_url,
                        driver_memberships (
                            status,
                            origin
                        )
                    )
                `)
                .eq('referred_by', user.id)
                .order('created_at', { ascending: false })

            // Process referrals to flatten status
            const processedRefs = (refs || []).map(ref => {
                const driverProfile = ref.driver_profiles?.[0]
                const isDriver = ref.roles?.includes('driver')
                const hasPaid = driverProfile?.driver_memberships?.some(
                    (m: any) => m.status === 'active' && m.origin === 'paid'
                )

                return {
                    ...ref,
                    isDriver,
                    hasPaid,
                    display_avatar: driverProfile?.profile_photo_url || ref.avatar_url
                }
            })
            setReferrals(processedRefs)

            // 4. Get Driver Profile (for Level and Referral Code)
            const { data: userData } = await supabase
                .from('users')
                .select('full_name, avatar_url, referral_code, passenger_credits')
                .eq('id', user.id)
                .maybeSingle()

            const { data: driverData } = await supabase
                .from('driver_profiles')
                .select('id, affiliate_level, referral_count, referral_count_pending, b2c_referral_count, profile_photo_url')
                .eq('user_id', user.id)
                .maybeSingle()

            if (driverData) {
                const { data: membershipData } = await supabase
                    .from('driver_memberships')
                    .select('status, expires_at, created_at')
                    .eq('driver_profile_id', driverData.id)
                    .eq('status', 'active')
                    .gt('expires_at', new Date().toISOString())
                    .maybeSingle()

                if (membershipData) {
                    setHasMembership(true)
                    setMembershipDate(new Date(membershipData.created_at)) // Assuming created_at is available or use start_date logic
                }
            }

            setProfile({
                ...userData,
                ...driverData,
                referral_code: userData?.referral_code || '',
                display_avatar: driverData?.profile_photo_url || userData?.avatar_url
            })
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
                color: 'text-yellow-600',
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                commission: 120,
                nextLevel: null,
                target: 51
            }
        }
        if (count >= 11 || currentLevel === 'silver') {
            return {
                label: 'Plata',
                color: 'text-gray-600',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                commission: 100,
                nextLevel: 'Oro',
                target: 51
            }
        }
        return {
            label: 'Bronce',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            commission: 80,
            nextLevel: 'Plata',
            target: 11
        }
    }


    // Calculate Eligible Referrals based on Membership Date
    const eligibleReferrals = referrals.filter(r => {
        if (!hasMembership || !membershipDate) return false;
        return new Date(r.created_at) > membershipDate;
    });

    const eligibleReferralCount = eligibleReferrals.filter(r => r.isDriver).length;
    // Note: B2C referrals are usually counted from profile.b2c_referral_count. 
    // If we want to strictly filter B2C, we'd need the list of B2C referrals or apply a ratio if we don't have the list.
    // For now, assuming b2c_referral_count needs to be filtered similarly, but we might not have the full list of passengers here depending on 'referrals' content.
    // However, the `referrals` state seems to hold ALL users (drivers and passengers) based on the fetch query earlier?
    // Let's check query: .select('..., isDriver:roles.cs("driver"), ...')
    // Yes, it fetches all users referred.
    const eligibleB2CCount = eligibleReferrals.filter(r => !r.isDriver).length;


    const levelData = getLevelData(hasMembership ? eligibleReferralCount : 0, profile?.affiliate_level)

    // B2C Progress
    const b2cCount = hasMembership ? eligibleB2CCount : 0
    const b2cNextGoal = 20 - (b2cCount % 20)
    const b2cProgress = (b2cCount % 20) / 20 * 100

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-4 md:p-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-[#0F2137]">
                        <Wallet className="h-10 w-10 text-emerald-500" />
                        Invitados
                    </h1>
                    <p className="text-gray-500 mt-2">Gestiona tus ingresos del Programa de Afiliados AvivaGo.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300">
                    {hasMembership && (
                        <>
                            <div className="px-4 py-2">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Nivel</p>
                                <p className={`font-black ${levelData.color}`}>{levelData.label}</p>
                            </div>
                            <div className="h-8 w-[1px] bg-gray-100" />
                        </>
                    )}
                    <div className="px-4 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Resumen Red</p>
                        <p className="font-black text-[#0F2137] flex items-center gap-2">
                            <span title="Conductores Activos">{profile?.referral_count || 0} A</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-amber-500" title="Conductores Pendientes">{profile?.referral_count_pending || 0} P</span>
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Balance Card */}
                <div className="lg:col-span-1 bg-[#0F2137] border border-blue-900/30 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl transition-all duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="h-32 w-32 text-white" />
                    </div>

                    <div className={`relative z-10 transition-all duration-700 ${!hasMembership ? 'blur-[2px] opacity-50 pointer-events-none select-none' : ''}`}>
                        <h3 className="text-sm font-bold text-blue-200 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-400" />
                            Saldo Disponible
                        </h3>

                        <div className="space-y-1">
                            <div className="text-6xl font-black text-white tracking-tighter">
                                ${balance.available.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2 text-blue-200/60 font-medium">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <span>Pendiente: ${balance.pending.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-12 space-y-4">
                            <button
                                disabled={balance.available < 500}
                                className={`w-full py-4 rounded-[1.25rem] font-black transition-all flex items-center justify-center gap-2 shadow-lg ${balance.available >= 500
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'
                                    : 'bg-white/10 text-blue-200/50 cursor-not-allowed'
                                    }`}
                            >
                                <ArrowUpRight className="h-5 w-5" />
                                Retirar Fondos
                            </button>
                            {balance.available < 500 && (
                                <p className="text-[10px] text-center text-blue-200/50 uppercase tracking-wider font-bold">
                                    Mínimo de retiro: $500.00 MXN
                                </p>
                            )}
                        </div>
                    </div>

                    {!hasMembership && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-blue-900/5">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/10 shadow-xl">
                                <Award className="h-8 w-8 text-white animate-bounce" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 text-center uppercase tracking-wider">¡Activa tu Potencial!</h3>
                            <p className="text-blue-200 text-[11px] opacity-90 mb-6 text-center max-w-[220px] font-medium leading-relaxed">
                                Los miembros Premium pueden retirar sus ganancias generadas por su red.
                            </p>
                            <Link href="/perfil?tab=payments" className="w-full py-3 bg-white text-blue-600 rounded-xl font-black text-xs hover:bg-blue-50 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] text-center uppercase tracking-widest">
                                Ver Membresía Premium
                            </Link>
                        </div>
                    )}
                </div>

                {/* Referral & Growth Section */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* B2B Referrals (Conductores) */}
                    <div className={`${levelData.bg} ${levelData.border} border rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group`}>
                        <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
                            <Car className="h-48 w-48 rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    <Car className={`h-8 w-8 ${levelData.color}`} />
                                </div>
                                {!hasMembership ? (
                                    <span className="px-4 py-1.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-600/20 animate-pulse">
                                        Premium Requerido
                                    </span>
                                ) : (
                                    <span className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-600 uppercase tracking-widest shadow-sm">
                                        Comisiones Activas
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-[#0F2137] mb-1">Conductores Recomendados</h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className="text-gray-500 text-sm font-medium">
                                            Bono por cada conductor: <span className="text-[#0F2137] font-bold">${levelData.commission} MXN</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Meta de Crecimiento</span>
                                    {levelData.nextLevel ? (
                                        <span className="text-xs font-black text-[#0F2137]">{eligibleReferralCount} / {levelData.target}</span>
                                    ) : (
                                        <span className="text-xs font-black text-yellow-500 uppercase">Máximo Nivel</span>
                                    )}
                                </div>
                                <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-100 p-0.5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${levelData.color.replace('text', 'bg')}`}
                                        style={{ width: `${levelData.nextLevel ? Math.min(((eligibleReferralCount) / levelData.target) * 100, 100) : 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center">
                            <div className="flex items-center gap-8 bg-white px-8 py-4 rounded-[1.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-black text-emerald-500 leading-none">
                                        {profile?.referral_count || 0}
                                    </span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">
                                        Activos
                                    </span>
                                </div>
                                <div className="w-[1px] h-8 bg-gray-100" />
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-black text-amber-500 leading-none">
                                        {profile?.referral_count_pending || 0}
                                    </span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">
                                        Pendientes
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                                    {levelData.nextLevel
                                        ? `Estás en nivel ${levelData.label}, te faltan ${levelData.target - eligibleReferralCount} para nivel ${levelData.nextLevel}`
                                        : '¡Embajador Oro! Máxima comisión activa.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* B2C Referrals (Pasajeros) */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 flex flex-col justify-between group shadow-soft relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
                            <Users className="h-48 w-48 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm">
                                    <Users className="h-8 w-8 text-indigo-500" />
                                </div>
                                {!hasMembership ? (
                                    <span className="px-4 py-1.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-600/20 animate-pulse">
                                        Premium Requerido
                                    </span>
                                ) : (
                                    <span className="px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                                        Comisiones Activas
                                    </span>
                                )}
                            </div>

                            <h3 className="text-2xl font-black text-[#0F2137] mb-1">Pasajeros Recomendados</h3>
                            <p className="text-gray-500 text-sm font-medium">
                                Gana <span className="text-indigo-600">$200 MXN</span> por cada 20
                            </p>

                            <div className="mt-8 space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progreso hacia el Bono</span>
                                    <span className="text-xs font-black text-[#0F2137]">{b2cCount % 20} / 20</span>
                                </div>
                                <div className="h-3 bg-white rounded-full overflow-hidden border border-indigo-100 p-0.5">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-sm"
                                        style={{ width: `${b2cProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-indigo-100 flex flex-col items-center">
                            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-indigo-100">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-black text-indigo-600 leading-none">
                                        {b2cCount}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                                        Pasajeros Registrados (Eligibles)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Section */}
            <div className="mt-12">
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 relative overflow-hidden shadow-soft">
                    <div className="absolute -top-10 -right-10 opacity-5">
                        <Share2 className="h-40 w-40 text-[#0F2137]" />
                    </div>

                    <h3 className="text-xl font-black text-[#0F2137] mb-6 flex items-center gap-3">
                        <Share2 className="h-6 w-6 text-blue-600" />
                        Invita y unifica la red
                    </h3>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1 space-y-6 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tu Código Personal</p>
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between group/code hover:border-blue-500/50 transition-colors">
                                        <code className="text-2xl font-black text-[#0F2137] tracking-[0.2em]">
                                            {profile?.referral_code || '---'}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(profile?.referral_code || '', 'code')}
                                            className="p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl transition-all text-gray-400 shadow-sm border border-gray-100"
                                        >
                                            {copiedCode ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Enlace Directo</p>
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between group/link hover:border-emerald-500/50 transition-colors">
                                        <div className="truncate text-gray-500 text-sm font-mono flex-1 mr-4">
                                            {referralLink}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(referralLink, 'link')}
                                            className="p-3 bg-white hover:bg-emerald-600 hover:text-white rounded-xl transition-all text-gray-400 shadow-sm border border-gray-100"
                                        >
                                            {copiedLink ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                <p className="text-sm text-blue-700 leading-relaxed font-medium">
                                    <strong className="text-blue-900 block mb-1">¿Sabías qué?</strong>
                                    Al invitar conductores y pasajeros, no solo ganas dinero, sino que fortaleces la seguridad de tu propia red.
                                    Cada nuevo integrante pasa por los filtros de certificación de la Fundación Aviva.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-3xl shrink-0 group/qr hover:scale-105 transition-transform duration-500 shadow-xl shadow-blue-900/5 self-center lg:self-start border border-gray-100">
                            {referralLink ? (
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralLink)}`}
                                    alt="QR de Referido"
                                    className="w-[150px] h-[150px] lg:w-[180px] lg:h-[180px]"
                                />
                            ) : (
                                <div className="w-[150px] h-[150px] lg:w-[180px] lg:h-[180px] flex items-center justify-center bg-gray-50 rounded-2xl">
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Referrals Directory Section */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-soft">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-[#0F2137]">Mi Red de Referidos</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Seguimiento de registros directos</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <Users className="h-5 w-5 text-blue-500" />
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    {referrals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {referrals.map(ref => (
                                <div key={ref.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={ref.display_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ref.full_name)}&background=random`}
                                                alt={ref.full_name}
                                                className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-white"
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${ref.isDriver ? 'bg-purple-500' : 'bg-blue-500'}`} title={ref.isDriver ? 'Conductor' : 'Pasajero'} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#0F2137] group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{ref.full_name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-black uppercase text-gray-400">
                                                    {ref.isDriver ? 'Conductor' : 'Pasajero'}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(ref.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        {ref.isDriver ? (
                                            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${ref.hasPaid
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {ref.hasPaid ? 'Activo (Pagado)' : 'Pendiente Pago'}
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                                                Completado
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                <Users className="h-10 w-10 text-gray-300" />
                            </div>
                            <h4 className="text-[#0F2137] font-black uppercase tracking-widest">Aún no tienes referidos</h4>
                            <p className="text-gray-500 text-sm mt-2">Comparte tu código para empezar a construir tu red.</p>
                        </div>
                    )}
                </div>
            </div>



            {/* Transactions History */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-soft">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-[#0F2137]">Historial de Operaciones</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Últimos movimientos</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    {transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 hover:border-blue-100 hover:bg-white transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl transition-all duration-500 ${tx.amount > 0
                                            ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                                            : 'bg-white text-gray-400 border border-gray-100 group-hover:border-gray-200'
                                            }`}>
                                            {tx.amount > 0 ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#0F2137] text-lg">{tx.description}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="h-1 w-1 rounded-full bg-gray-300" />
                                                <span className={`text-[10px] uppercase font-black tracking-widest ${tx.status === 'pending' ? 'text-amber-500' : 'text-emerald-600'
                                                    }`}>
                                                    {tx.status === 'pending' ? 'En Validación' : 'Completado'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-[#0F2137]'
                                            }`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">MXN</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                <Clock className="h-10 w-10 text-gray-300" />
                            </div>
                            <h4 className="text-[#0F2137] font-black uppercase tracking-widest">Sin actividad reciente</h4>
                            <p className="text-gray-500 text-sm mt-2">Tus movimientos aparecerán aquí automáticamente.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Rules of the game at the bottom */}
            <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <h3 className="text-xl font-black text-[#0F2137] flex items-center gap-3">
                        <Info className="h-6 w-6 text-amber-500" />
                        Reglas del Juego y Transparencia
                    </h3>
                    <span className="px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-[10px] font-black text-amber-600 uppercase tracking-widest">
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
                            <div className="h-10 w-10 rounded-2xl bg-white border border-amber-100 flex items-center justify-center shrink-0">
                                <Check className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-[#0F2137] leading-none mb-2">{item.title}</p>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
