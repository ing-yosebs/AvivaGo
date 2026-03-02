'use client'

import { useEffect, useState } from 'react'
import { Server, Database, Mail, Map, Github, MessageCircle, AlertTriangle } from 'lucide-react'

type HistoricalData = {
    month_year: string
    db_size_bytes: number
    storage_size_bytes: number
    auth_mau: number
    resend_emails_est: number
    meta_whatsapp_est: number
    google_maps_requests_est: number
    github_actions_minutes: number
}

type UsageData = {
    supabase: { db_size_bytes: number; storage_size_bytes: number; auth_mau: number; auth_total: number }
    resend: { emails_sent_monthly_est: number; emails_sent_total_est: number }
    meta: { whatsapp_tokens_monthly_est: number; whatsapp_tokens_total_est: number }
    google_maps: { requests_monthly_est: number; requests_total_est: number }
    github: { action_minutes_monthly: number; action_minutes_total: number }
    historical: HistoricalData[]
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function ServiceUsageMonitor() {
    const [data, setData] = useState<UsageData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch('/api/admin/usage')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data)
                else setError(json.error || 'Error fetching usage')
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="text-zinc-400 p-4 border border-white/10 rounded-2xl animate-pulse">Cargando métricas de servicios...</div>
    if (error) return <div className="text-red-400 p-4 border border-red-500/20 bg-red-500/10 rounded-2xl flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> {error}</div>
    if (!data) return null

    // Constants for limits
    const LIMITS = {
        db: 500 * 1024 * 1024, // 500 MB
        storage: 1024 * 1024 * 1024, // 1 GB
        mau: 50000,
        resend: 3000,
        github: 2000,
        maps_free_credit: 28500 // roughly 28k loads
    }

    // Get last month data
    const prevMonth = data.historical && data.historical.length > 0 ? data.historical[0] : null

    const usageCards = [
        {
            title: "Supabase DB (Tamaño)",
            icon: <Database className="h-5 w-5 text-emerald-400" />,
            usedStr: formatBytes(data.supabase.db_size_bytes),
            secondaryStr: prevMonth ? formatBytes(prevMonth.db_size_bytes) : null,
            limitStr: "500 MB",
            percent: Math.min(100, Math.max(0, (data.supabase.db_size_bytes / LIMITS.db) * 100))
        },
        {
            title: "Supabase Storage",
            icon: <Server className="h-5 w-5 text-blue-400" />,
            usedStr: formatBytes(data.supabase.storage_size_bytes),
            secondaryStr: prevMonth ? formatBytes(prevMonth.storage_size_bytes) : null,
            limitStr: "1 GB",
            percent: Math.min(100, Math.max(0, (data.supabase.storage_size_bytes / LIMITS.storage) * 100))
        },
        {
            title: "Autenticación MAU",
            icon: <Server className="h-5 w-5 text-indigo-400" />,
            usedStr: data.supabase.auth_mau.toLocaleString(),
            secondaryStr: prevMonth ? prevMonth.auth_mau.toLocaleString() : null,
            limitStr: "50,000 / mes",
            percent: Math.min(100, Math.max(0, (data.supabase.auth_mau / LIMITS.mau) * 100))
        },
        {
            title: "Resend (Emails Est.)",
            icon: <Mail className="h-5 w-5 text-amber-400" />,
            usedStr: data.resend.emails_sent_monthly_est.toLocaleString(),
            secondaryStr: prevMonth ? prevMonth.resend_emails_est.toLocaleString() : null,
            limitStr: "3,000 / mes",
            percent: Math.min(100, Math.max(0, (data.resend.emails_sent_monthly_est / LIMITS.resend) * 100))
        },
        {
            title: "Meta WhatsApp (Est.)",
            icon: <MessageCircle className="h-5 w-5 text-green-500" />,
            usedStr: data.meta.whatsapp_tokens_monthly_est.toLocaleString(),
            secondaryStr: prevMonth ? prevMonth.meta_whatsapp_est.toLocaleString() : null,
            limitStr: "1,000 Service",
            percent: Math.min(100, Math.max(0, (data.meta.whatsapp_tokens_monthly_est / 1000) * 100)),
            costStr: `(~$${(data.meta.whatsapp_tokens_monthly_est * 0.0085).toFixed(2)} USD)`,
            warning: data.meta.whatsapp_tokens_monthly_est > 0 ? "Basado en tarifa Auth MX: ~$0.0085" : undefined
        },
        {
            title: "Google Maps (Peticiones)",
            icon: <Map className="h-5 w-5 text-red-400" />,
            usedStr: data.google_maps.requests_monthly_est.toLocaleString(),
            secondaryStr: prevMonth ? prevMonth.google_maps_requests_est.toLocaleString() : null,
            limitStr: "~28,500 / mes",
            percent: Math.min(100, Math.max(0, (data.google_maps.requests_monthly_est / LIMITS.maps_free_credit) * 100)),
            costStr: `(~$${(data.google_maps.requests_monthly_est * 0.007).toFixed(2)} USD)`,
            warning: "Cálculo aproximado: Autocompletado (x12) + Calculadora (x3)"
        },
        {
            title: "GitHub Actions",
            icon: <Github className="h-5 w-5 text-zinc-100" />,
            usedStr: `${data.github.action_minutes_monthly} mins`,
            secondaryStr: prevMonth ? `${prevMonth.github_actions_minutes} mins` : null,
            limitStr: "2,000 mins / mes",
            percent: Math.min(100, Math.max(0, (data.github.action_minutes_monthly / LIMITS.github) * 100))
        }
    ]

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl mb-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">Monitor de Consumo de APIs y Servicios</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {usageCards.map((card, i) => (
                    <div key={i} className="bg-black/20 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                {card.icon}
                            </div>
                            <h4 className="text-sm font-semibold text-zinc-300">{card.title}</h4>
                        </div>

                        <div className="flex justify-between items-end mb-2">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{card.usedStr}</span>
                                    {card.costStr && (
                                        <span className="text-sm font-semibold text-emerald-400">
                                            {card.costStr}
                                        </span>
                                    )}
                                </div>
                                {card.secondaryStr && (
                                    <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider bg-white/5 inline-flex w-fit px-1.5 py-0.5 rounded border border-white/10">
                                        Mes Pasado: {card.secondaryStr}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-medium text-zinc-500 mb-1 shrink-0">/ {card.limitStr}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2 mt-2">
                            <div
                                className={`h-full rounded-full ${card.percent > 85 ? 'bg-red-500' : card.percent > 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                style={{ width: `${card.percent}%` }}
                            />
                        </div>

                        {card.warning && <p className="text-[10px] text-amber-400 mt-2 leading-tight">{card.warning}</p>}
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-200">
                    <strong>Vercel Bandwidth & Functions:</strong> Vercel incluye 100GB y 1,000 hrs. Los límites no se exponen vía API sin tokens, pero tu arquitectura de Next.js te mantendrá en la capa gratuita en etapas tempranas. Se registrarán despliegues en GitHub.
                </p>
            </div>

            {/* Historical Table */}
            {data.historical && data.historical.length > 0 && (
                <div className="mt-12 bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <Database className="h-5 w-5 text-zinc-400" /> Histórico Mensual de Consumos
                        </h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-400">
                            <thead className="bg-white/5 text-xs uppercase font-semibold text-zinc-300">
                                <tr>
                                    <th className="px-6 py-4">Mes</th>
                                    <th className="px-6 py-4">MAU (Autenticación)</th>
                                    <th className="px-6 py-4">Emails (Resend)</th>
                                    <th className="px-6 py-4">WhatsApp (Meta)</th>
                                    <th className="px-6 py-4">Google Maps</th>
                                    <th className="px-6 py-4">GitHub Actions</th>
                                    <th className="px-6 py-4">Costo DB / Obj</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.historical.map((h, index) => (
                                    <tr key={index} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white tracking-wider">{h.month_year}</td>
                                        <td className="px-6 py-4">{h.auth_mau.toLocaleString()}</td>
                                        <td className="px-6 py-4">{h.resend_emails_est.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {h.meta_whatsapp_est.toLocaleString()}{' '}
                                            <span className="text-[10px] text-green-400 font-medium block">(${((h.meta_whatsapp_est) * 0.0085).toFixed(2)})</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {h.google_maps_requests_est.toLocaleString()}
                                            <span className="text-[10px] text-green-400 font-medium block">(${((h.google_maps_requests_est) * 0.007).toFixed(2)})</span>
                                        </td>
                                        <td className="px-6 py-4">{h.github_actions_minutes} mins</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mr-1">
                                                {formatBytes(h.db_size_bytes)}
                                            </span>
                                            <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                                                {formatBytes(h.storage_size_bytes)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
