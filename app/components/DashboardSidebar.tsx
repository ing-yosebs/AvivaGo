'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    User,
    Users,
    Heart,
    Settings,
    LogOut,
    ChevronRight,
    CreditCard,
    Car,
    Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const menuItems = [
    { icon: Home, label: 'Inicio', href: '/' },
    { icon: Shield, label: 'Panel Principal', href: '/driver/dashboard' },
    { icon: User, label: 'Mi Perfil', href: '/perfil' },
    { icon: Users, label: 'Comunidad', href: '/comunidad' },
    { icon: Heart, label: 'Mis Favoritos', href: '/favoritos' },
]

export default function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
        router.refresh()
    }

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-white/5 flex flex-col z-50">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">AvivaGo</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
    )
}
