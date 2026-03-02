'use client'

import { ExternalLink, CreditCard, Shield, Activity, Receipt } from 'lucide-react'

export function BillingQuickLinks() {
    const providers = [
        {
            name: "Meta / WhatsApp API",
            desc: "Mensajes de Autenticación (~$0.0085 USD cada uno)",
            url: "https://business.facebook.com/wa/manage",
            icon: <CreditCard className="h-4 w-4 text-green-400" />
        },
        {
            name: "Google Maps Platform",
            desc: "Autocompletado de direcciones y Calculator Routes",
            url: "https://console.cloud.google.com/google/maps-apis/overview",
            icon: <Activity className="h-4 w-4 text-red-400" />
        },
        {
            name: "Supabase Dashboard",
            desc: "Uso de Base de Datos, Storage y Autenticación MAU",
            url: "https://supabase.com/dashboard/project/xwwejpkfvttorwizvkvj/settings/billing",
            icon: <Shield className="h-4 w-4 text-emerald-400" />
        },
        {
            name: "Resend (Emails)",
            desc: "Envíos de correos de confirmación (3,000 gratis/mes)",
            url: "https://resend.com/emails",
            icon: <Receipt className="h-4 w-4 text-amber-400" />
        },
        {
            name: "GitHub Billing",
            desc: "Minutos de GitHub Actions y despliegues (2,000 gratis/mes)",
            url: "https://github.com/settings/billing",
            icon: <ExternalLink className="h-4 w-4 text-zinc-100" />
        }
    ]

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">Enlaces Directos de Facturación Real</h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Utiliza estos enlaces para contrastar las estimaciones de este panel con los portales oficiales de cada proveedor.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((p, i) => (
                    <a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/5 hover:border-blue-500/50 hover:bg-white/5 transition-all"
                    >
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                            {p.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                                {p.name}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-medium leading-tight mt-0.5">
                                {p.desc}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    )
}
