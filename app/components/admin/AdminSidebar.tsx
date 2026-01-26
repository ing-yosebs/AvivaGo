'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, Activity, Settings, LogOut } from 'lucide-react'
import AvivaLogo from '../AvivaLogo'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Finanzas', href: '/admin/financials', icon: CreditCard },
    { name: 'Sistema', href: '/admin/system', icon: Activity },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/40 backdrop-blur-xl border-r border-white/10 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center gap-2 mt-4 group">
                    <div className="flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <AvivaLogo className="h-10 w-auto" showText={false} />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        AvivaGo Admin
                    </span>
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={`
                                                    group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all
                                                    ${isActive
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                                    }
                                                `}
                                            >
                                                <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                {item.name}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>
                        <li className="mt-auto">
                            <Link
                                href="/admin/settings/admins"
                                className="group -mx-2 flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                            >
                                <Settings className="h-6 w-6 shrink-0" aria-hidden="true" />
                                Gestión de Admins
                            </Link>
                            <button
                                onClick={async () => {
                                    await fetch('/api/auth/signout', { method: 'POST' })
                                    window.location.href = '/'
                                }}
                                className="w-full group -mx-2 flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left"
                            >
                                <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                                Cerrar Sesión
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
