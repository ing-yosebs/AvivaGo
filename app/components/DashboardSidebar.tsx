'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    User,
    Users,
    Heart,
    LogOut,
    ChevronRight,
    Shield,
    Menu,
    X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const menuItems = [
    { icon: Home, label: 'Inicio', href: '/' },
    { icon: Shield, label: 'Panel Principal', href: '/dashboard' },
    { icon: User, label: 'Mi Perfil', href: '/perfil' },
    { icon: Users, label: 'Comunidad', href: '/comunidad' },
    { icon: Heart, label: 'Mis Favoritos', href: '/favoritos' },
]

export default function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
        router.refresh()
    }

    const toggleSidebar = () => setIsOpen(!isOpen)

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 w-full bg-zinc-950 border-b border-white/5 h-16 flex items-center justify-between px-6 z-[60]">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">AvivaGo</span>
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
                fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-white/5 flex flex-col z-[58]
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 hidden lg:block">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">AvivaGo</span>
                    </Link>
                </div>

                <div className="lg:hidden h-16" /> {/* Spacer for mobile header height */}

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-blue-400 transition-colors'}`} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4" />}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
