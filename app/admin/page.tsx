import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Car, DollarSign, Activity, AlertTriangle, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'
import RevenueChart from '@/app/components/admin/RevenueChart'
import ActivityChart from '@/app/components/admin/ActivityChart'
import DashboardTables from '@/app/components/admin/DashboardTables'

async function getSignedUrlsBatch(supabase: any, items: any[], fallbackBucket: string, photoKey: (item: any) => string | null) {
    if (!items || items.length === 0) return items;

    const pathsToSign: string[] = [];
    const itemPathMapping = new Map<any, { path: string, original: string }>();

    items.forEach(item => {
        const url = photoKey(item);
        if (!url || url.includes('placehold.co') || url.includes('via.placeholder') || url.includes('socio-avivago.png')) {
            return;
        }

        let path = url;
        let bucket = fallbackBucket;

        // Auto-detect bucket from Supabase URLs
        if (url.startsWith('http') && url.includes('/storage/v1/object/')) {
            try {
                const urlObj = new URL(url);
                const segments = urlObj.pathname.split('/');
                if (segments.length > 6) {
                    bucket = segments[5];
                    path = decodeURIComponent(segments.slice(6).join('/'));
                }
            } catch (e) {
                console.error("Error parsing URL:", url);
            }
        }

        // We only sign batch items that belong to the fallbackBucket 
        // to use a single createSignedUrls call for efficiency
        if (bucket === fallbackBucket && path) {
            pathsToSign.push(path);
            itemPathMapping.set(item, { path, original: url });
        }
    });

    if (pathsToSign.length === 0) {
        return items.map(item => ({ ...item, signed_photo_url: photoKey(item) }));
    }

    const { data } = await supabase.storage.from(fallbackBucket).createSignedUrls(pathsToSign, 3600);

    return items.map(item => {
        const mapped = itemPathMapping.get(item);
        if (mapped) {
            const signed = data?.find((d: any) => d.path === mapped.path);
            // Si la firma falla por alguna razón pero tenemos URL original que sirva, se usa
            return { ...item, signed_photo_url: signed?.signedUrl || mapped.original };
        }
        return { ...item, signed_photo_url: photoKey(item) };
    });
}

async function getDashboardData(view?: string) {
    const supabase = createAdminClient()
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)

    // Run foundational queries in parallel
    const [
        { count: totalUsers },
        { count: activeDrivers },
        { count: pendingDrivers },
        { count: paidMembershipsCount },
        { count: monthlyMembershipsCount },
        { data: pendingPaymentsData },
        { data: abandonedPaymentsData },
        { data: historicalMemberships },
        { data: recentUsersForChart },
        { data: recentDriversForChart },
        { count: totalHistoricalMembershipsCount }
    ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
        // KPI: Total active paid memberships
        supabase.from('driver_memberships').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('origin', 'paid'),
        // Revenue: Memberships created/renewed this month
        supabase.from('driver_memberships').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('origin', 'paid').gte('created_at', firstDayOfMonth),
        supabase.from('pending_payments').select('user_id').eq('status', 'open'),
        supabase.from('pending_payments').select('user_id').in('status', ['expired', 'failed']),
        // Historical Revenue: Memberships over last 6 months
        supabase.from('driver_memberships').select('created_at').eq('status', 'active').eq('origin', 'paid').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('users').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('driver_profiles').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        // All Historical Total Memberships Paid
        supabase.from('driver_memberships').select('*', { count: 'exact', head: true }).eq('origin', 'paid')
    ])

    // Math: $524 MXN per membership
    const PRICE_PER_MEMBERSHIP = 524;
    const monthlyRevenue = (monthlyMembershipsCount || 0) * PRICE_PER_MEMBERSHIP;
    const totalRevenue = (totalHistoricalMembershipsCount || 0) * PRICE_PER_MEMBERSHIP;

    // Deduplicate pending payments counters by user_id
    const openUserIds = new Set((pendingPaymentsData || []).map((p: any) => p.user_id));
    const abandonedUserIds = new Set((abandonedPaymentsData || []).map((p: any) => p.user_id));

    // Remove users from abandoned if they have an open payment (optional but clean)
    // or simply just count unique user_ids
    const uniquePendingCount = openUserIds.size;
    const uniqueAbandonedCount = abandonedUserIds.size;

    const estimatedPendingRevenue = uniquePendingCount * PRICE_PER_MEMBERSHIP;

    // Chart Formatting
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const range = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        return { month: d.getMonth(), year: d.getFullYear(), name: monthNames[d.getMonth()] }
    }).reverse()

    const revenueChartData = range.map(r => {
        const countForMonth = historicalMemberships?.filter(mem => {
            const d = new Date(mem.created_at)
            return d.getMonth() === r.month && d.getFullYear() === r.year
        }).length || 0;

        return {
            ...r,
            total: countForMonth * PRICE_PER_MEMBERSHIP
        }
    })

    const activityChartData = range.map(r => ({
        ...r,
        users: recentUsersForChart?.filter(u => {
            const d = new Date(u.created_at)
            return d.getMonth() === r.month && d.getFullYear() === r.year
        }).length || 0,
        drivers: recentDriversForChart?.filter(d => {
            const dt = new Date(d.created_at)
            return dt.getMonth() === r.month && dt.getFullYear() === r.year
        }).length || 0
    }))

    // Helper para extraer la selfie del objeto identity_verifications si existe
    const getSelfie = (u: any) => {
        if (!u || !u.identity_verifications) return null;
        return Array.isArray(u.identity_verifications) ? u.identity_verifications[0]?.selfie_url : u.identity_verifications.selfie_url;
    };

    const getValidPhoto = (...urls: any[]) => {
        for (const url of urls) {
            if (url && typeof url === 'string' && !url.includes('placehold.co') && !url.includes('via.placeholder') && !url.includes('socio-avivago.png') && url.trim() !== '') {
                return url;
            }
        }
        return null;
    };

    // 6. Conditional View Data fetching
    let viewData = []
    if (view === 'active_drivers') {
        const { data } = await supabase.from('driver_profiles').select('*, users(full_name, email, phone_number, avatar_url, identity_verifications(selfie_url))').eq('status', 'active').limit(50).order('created_at', { ascending: false })
        viewData = data || []
        // Batch sign
        viewData = await getSignedUrlsBatch(supabase, viewData, 'avatars', (d) => getValidPhoto(d.profile_photo_url, d.users?.avatar_url, getSelfie(d.users)))
    } else if (view === 'pending_drivers') {
        const { data } = await supabase.from('driver_profiles').select('*, users(full_name, email, phone_number, avatar_url, identity_verifications(selfie_url))').eq('status', 'pending_approval').limit(50).order('created_at', { ascending: false })
        viewData = data || []
        // Batch sign
        viewData = await getSignedUrlsBatch(supabase, viewData, 'avatars', (d) => getValidPhoto(d.profile_photo_url, d.users?.avatar_url, getSelfie(d.users)))
    } else if (view === 'pending_payments') {
        const { data } = await supabase.from('pending_payments').select('*, users(full_name, email, phone_number, avatar_url, identity_verifications(selfie_url))').in('status', ['open', 'expired', 'failed']).limit(200).order('created_at', { ascending: false })

        // Deduplicate by user_id to avoid showing the same user's multiple attempts
        const uniquePayments: any[] = [];
        const seenUsers = new Map();
        if (data) {
            data.forEach((payment) => {
                if (!seenUsers.has(payment.user_id)) {
                    payment.attempts_count = 1;
                    seenUsers.set(payment.user_id, payment);
                    uniquePayments.push(payment);
                } else {
                    const existing = seenUsers.get(payment.user_id);
                    existing.attempts_count = (existing.attempts_count || 1) + 1;
                }
            });
        }

        viewData = uniquePayments.slice(0, 50); // Keep only the latest 50 distinct attempts
        // Batch sign
        viewData = await getSignedUrlsBatch(supabase, viewData, 'avatars', (p) => getValidPhoto(p.users?.avatar_url, getSelfie(p.users)))
    } else if (view === 'monthly_revenue') {
        const { data } = await supabase.from('driver_memberships').select('*, driver_profiles(id, status, profile_photo_url, users(full_name, email, phone_number, avatar_url, identity_verifications(selfie_url)))').eq('origin', 'paid').limit(50).order('created_at', { ascending: false })
        viewData = data || []
        // Batch sign
        viewData = await getSignedUrlsBatch(supabase, viewData, 'avatars', (m) => getValidPhoto(m.driver_profiles?.profile_photo_url, m.driver_profiles?.users?.avatar_url, getSelfie(m.driver_profiles?.users)))
    } else if (view === 'recent_users') {
        const { data } = await supabase.from('users').select('*, driver_profiles(id, status, profile_photo_url), identity_verifications(selfie_url)').limit(20).order('created_at', { ascending: false })
        viewData = data || []
        // Batch sign
        viewData = await getSignedUrlsBatch(supabase, viewData, 'avatars', (u) => getValidPhoto(Array.isArray(u.driver_profiles) ? u.driver_profiles[0]?.profile_photo_url : u.driver_profiles?.profile_photo_url, u.avatar_url, getSelfie(u)))
    } else if (view === 'paid_memberships') {
        const { data } = await supabase.from('driver_memberships').select('*, driver_profiles(*, users(full_name, email, phone_number, avatar_url, identity_verifications(selfie_url)))').eq('status', 'active').eq('origin', 'paid').limit(50).order('created_at', { ascending: false })
        viewData = data || []
        // Optional batch join:
        viewData = await getSignedUrlsBatch(supabase, viewData, 'avatars', (m) => getValidPhoto(m.driver_profiles?.profile_photo_url, m.driver_profiles?.users?.avatar_url, getSelfie(m.driver_profiles?.users)))
    }

    return {
        totalUsers: totalUsers || 0,
        activeDrivers: activeDrivers || 0,
        pendingDrivers: pendingDrivers || 0,
        paidMembershipsCount: paidMembershipsCount || 0,
        monthlyRevenue,
        totalRevenue,
        pendingPaymentsCount: uniquePendingCount || 0,
        abandonedPaymentsCount: uniqueAbandonedCount || 0,
        estimatedPendingRevenue,
        revenueChartData,
        activityChartData,
        viewData
    }
}

export default async function AdminDashboard({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const view = params.view as string | undefined

    const stats = await getDashboardData(view)

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Dashboard Operativo</h1>
                    <p className="text-zinc-400 text-lg">Resumen general y control de la plataforma AvivaGo en tiempo real.</p>
                </div>
                {view && (
                    <Link href="/admin" className="text-sm font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/5">
                        Limpiar Vista
                    </Link>
                )}
            </div>

            {/* KPI Grid - Interactive */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Users KPI */}
                <Link href="/admin?view=recent_users" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'recent_users' ? 'bg-blue-500/10 border-blue-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'recent_users' ? 'bg-blue-500/20 border-blue-400/30' : 'bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20'}`}>
                            <Users className="h-7 w-7 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Usuarios Registrados</p>
                            <p className="text-3xl font-black text-white tracking-tight">{stats.totalUsers}</p>
                        </div>
                    </div>
                </Link>

                {/* Active Drivers KPI */}
                <Link href="/admin?view=active_drivers" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'active_drivers' ? 'bg-emerald-500/10 border-emerald-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'active_drivers' ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20'}`}>
                            <Car className="h-7 w-7 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Conductores Activos</p>
                            <p className="text-3xl font-black text-white tracking-tight">{stats.activeDrivers}</p>
                        </div>
                    </div>
                </Link>

                {/* Paid Memberships KPI */}
                <Link href="/admin?view=paid_memberships" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'paid_memberships' ? 'bg-amber-500/10 border-amber-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'paid_memberships' ? 'bg-amber-500/20 border-amber-400/30' : 'bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20'}`}>
                            <DollarSign className="h-7 w-7 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Membresías Pagadas</p>
                            <p className="text-3xl font-black text-white tracking-tight">{stats.paidMembershipsCount}</p>
                        </div>
                    </div>
                </Link>

                {/* Revenue KPI */}
                <Link href="/admin?view=monthly_revenue" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'monthly_revenue' ? 'bg-purple-500/10 border-purple-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'monthly_revenue' ? 'bg-purple-500/20 border-purple-400/30' : 'bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20'}`}>
                            <DollarSign className="h-7 w-7 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Ingresos</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-white tracking-tight">
                                    ${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <p className="text-[12px] text-zinc-500 font-medium mt-1">
                                <span className="text-purple-400 font-bold">${stats.monthlyRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span> este mes
                            </p>
                        </div>
                    </div>
                </Link>

                {/* All Pending & Abandoned Payments KPI */}
                <Link href="/admin?view=pending_payments" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'pending_payments' ? 'bg-red-500/10 border-red-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className={`absolute inset-0 transition-opacity ${(stats.abandonedPaymentsCount + stats.pendingPaymentsCount) > 0 && view !== 'pending_payments' ? 'bg-red-500/5 opacity-100' : 'opacity-0'}`} />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'pending_payments' ? 'bg-red-500/20 border-red-400/30' : 'bg-red-500/10 border-red-500/20 group-hover:bg-red-500/20'}`}>
                            <AlertTriangle className="h-7 w-7 text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Alertas de Pagos</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-white tracking-tight">{stats.abandonedPaymentsCount + stats.pendingPaymentsCount}</p>
                                <span className="text-xs text-zinc-500 font-medium">personas</span>
                            </div>
                            <p className="text-[12px] text-zinc-500 font-medium mt-1">
                                <span className="text-zinc-300 font-bold">{stats.pendingPaymentsCount}</span> pendientes • <span className="text-red-400 font-bold">{stats.abandonedPaymentsCount}</span> expiraron
                            </p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin?view=pending_drivers" scroll={false} className={`block backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${view === 'pending_drivers' ? 'bg-orange-500/10 border-orange-500/50 scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className={`absolute inset-0 transition-opacity ${stats.pendingDrivers > 0 && view !== 'pending_drivers' ? 'bg-orange-500/5 opacity-100' : 'opacity-0'}`} />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-4 rounded-2xl border transition-colors ${view === 'pending_drivers' ? 'bg-orange-500/20 border-orange-400/30' : 'bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500/20'}`}>
                            <Shield className="h-7 w-7 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Req. Aprobación</p>
                            <p className="text-3xl font-black text-white tracking-tight">{stats.pendingDrivers}</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Drill-down conditional rendering */}
            {view && (
                <div className="mt-8">
                    <DashboardTables view={view} data={stats.viewData} />
                </div>
            )}

            {/* Charts Section */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-500 ${view ? 'opacity-80 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                {/* Activity Chart */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="mb-6 flex justify-between items-center relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Crecimiento de Red</h3>
                            <p className="text-sm text-zinc-500 mt-1">Nuevos usuarios y conductores diarios</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-emerald-400">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <ActivityChart data={stats.activityChartData} />
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="mb-6 flex justify-between items-center relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Ingresos Mensuales</h3>
                            <p className="text-sm text-zinc-500 mt-1">Histórico de últimos 6 meses</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-purple-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <RevenueChart data={stats.revenueChartData} />
                    </div>
                </div>
            </div>
        </div>
    )
}
