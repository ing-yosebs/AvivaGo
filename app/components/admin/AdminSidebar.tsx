'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, Activity, Settings, LogOut, Menu, X } from 'lucide-react'
import AvivaLogo from '../AvivaLogo'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Finanzas', href: '/admin/financials', icon: CreditCard },
    { name: 'Sistema', href: '/admin/system', icon: Activity },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const toggleSidebar = () => setIsOpen(!isOpen)

    return (
        <>
            <div className="lg:hidden fixed top-0 left-0 w-full bg-black/60 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-6 z-[60]">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <AvivaLogo className="w-full h-full" showText={false} />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">AvivaGo Admin</span>
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed left-0 top-0 h-full w-72 bg-zinc-950 border-r border-white/10 flex flex-col z-[58]
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
                    <div className="hidden lg:flex h-16 shrink-0 items-center gap-2 mt-4 group">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex items-center justify-center group-hover:rotate-12 transition-transform h-10">
                                <AvivaLogo className="h-10 w-auto" showText={false} />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                AvivaGo Admin
                            </span>
                        </Link>
                    </div>

                    <div className="lg:hidden h-16" /> {/* Spacer for mobile header height */}

                    <nav className="flex flex-1 flex-col mt-4 lg:mt-0">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setIsOpen(false)}
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
                            <li className="mt-auto border-t border-white/5 pt-4">
                                <Link
                                    href="/admin/settings/admins"
                                    onClick={() => setIsOpen(false)}
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
            </aside>
        </>
    )
}
