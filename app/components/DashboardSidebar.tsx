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
import { useState, useEffect } from 'react'

export default function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isDriver, setIsDriver] = useState(false)

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: userData } = await supabase
                .from('users')
                .select('roles')
                .eq('id', user.id)
                .single()

            if (userData?.roles?.includes('driver')) {
                setIsDriver(true)
            }
        }
        checkRole()
    }, [supabase])

    const menuItems = [
        { icon: Home, label: 'Inicio', href: '/' },
        { icon: Shield, label: 'Panel Principal', href: '/dashboard' },
        {
            icon: User,
            label: 'Mi Perfil',
            href: '/perfil',
            subItems: [
                { label: 'Datos Personales', href: '/perfil?tab=personal' },
                ...(isDriver ? [
                    { label: 'Mis Vehículos', href: '/perfil?tab=vehicles' },
                    { label: 'Mis Servicios', href: '/perfil?tab=services' }
                ] : [
                    { label: 'Conductores de Confianza', href: '/perfil?tab=trusted_drivers' }
                ]),
                { label: isDriver ? 'Pagos y Membresía' : 'Mis Pagos', href: '/perfil?tab=payments' },
                { label: 'Seguridad', href: '/perfil?tab=security' },
            ]
        },
        { icon: Users, label: 'Comunidad', href: '/comunidad' },
        { icon: Heart, label: 'Mis Favoritos', href: '/favoritos' },
    ]

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
                        const isActive = pathname === item.href || (item.subItems && pathname.startsWith(item.href))
                        const hasSubItems = item.subItems && item.subItems.length > 0

                        return (
                            <div key={item.label} className="space-y-1">
                                <Link
                                    href={item.href}
                                    onClick={() => !hasSubItems && setIsOpen(false)}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-blue-400 transition-colors'}`} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                    {isActive && !hasSubItems && <ChevronRight className="h-4 w-4" />}
                                </Link>

                                {hasSubItems && (
                                    <div className="pl-9 space-y-1 mt-1 border-l border-white/5 ml-5">
                                        {item.subItems.map((sub) => {
                                            const isSubActive = pathname === '/perfil' && typeof window !== 'undefined' && window.location.search.includes(sub.href.split('?')[1]);

                                            return (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center gap-3 p-2 rounded-lg text-xs font-medium transition-all ${isSubActive
                                                        ? 'text-white bg-white/10'
                                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSubActive ? 'bg-blue-500' : 'bg-zinc-800'}`} />
                                                    {sub.label}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
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
