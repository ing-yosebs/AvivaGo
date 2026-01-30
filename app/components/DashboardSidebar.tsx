'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
    Home,
    User,
    Users,
    Heart,
    LogOut,
    ChevronRight,
    Shield,
    Menu,
    X,
    Wallet,
    CreditCard,
    Lock,
    Briefcase,
    LayoutDashboard
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AvivaLogo from './AvivaLogo'

export default function DashboardSidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
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
        { icon: LayoutDashboard, label: 'Panel Principal', href: '/dashboard' },
        { icon: User, label: 'Datos Personales', href: '/perfil?tab=personal' },
        ...(isDriver ? [{ icon: Wallet, label: 'Mi Billetera', href: '/billetera' }] : []),
        ...(isDriver ? [{ icon: CreditCard, label: 'Membresía', href: '/perfil?tab=payments' }] : []),
        ...(isDriver ? [
            {
                icon: Briefcase,
                label: 'Gestión de Servicio',
                href: '/perfil?tab=services',
                subItems: [
                    { label: 'Mis Servicios', href: '/perfil?tab=services' },
                    { label: 'Mis Vehículos', href: '/perfil?tab=vehicles' },
                    { label: 'Mis Pasajeros', href: '/perfil?tab=my_passengers' }
                ]
            }
        ] : []),
        ...(!isDriver ? [{ icon: Shield, label: 'Mis Conductores', href: '/perfil?tab=trusted_drivers' }] : []),
        { icon: Lock, label: 'Seguridad', href: '/perfil?tab=security' },
        { icon: Users, label: 'Comunidad', href: '/comunidad' },
        { icon: Heart, label: 'Mis Favoritos', href: '/favoritos' },
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const toggleSidebar = () => setIsOpen(!isOpen)

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-6 z-[60]">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <AvivaLogo className="w-full h-full" showText={false} />
                    </div>
                    <span className="text-xl font-bold text-[#0F2137] tracking-tight">AvivaGo</span>
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-gray-600 hover:text-[#0F2137] transition-colors"
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
                fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-[58]
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 hidden lg:block">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 flex items-center justify-center group-hover:rotate-12 transition-transform h-auto">
                            <AvivaLogo className="w-full h-full" showText={false} />
                        </div>
                        <span className="text-xl font-bold text-[#0F2137] tracking-tight">AvivaGo</span>
                    </Link>
                </div>

                <div className="lg:hidden h-16" /> {/* Spacer for mobile header height */}

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const currentTab = searchParams.get('tab')
                        const itemTab = item.href.includes('tab=') ? item.href.split('tab=')[1] : null
                        const hasSubItems = item.subItems && item.subItems.length > 0

                        let isActive = false
                        if (hasSubItems) {
                            const isAnySubActive = (item.subItems as any[]).some(sub => {
                                const subTab = sub.href.includes('tab=') ? sub.href.split('tab=')[1] : null
                                return pathname === '/perfil' && currentTab === subTab
                            })
                            isActive = isAnySubActive || (pathname === '/perfil' && currentTab === itemTab) || (pathname === item.href && !currentTab)
                        } else if (itemTab) {
                            isActive = pathname === '/perfil' && currentTab === itemTab
                        } else {
                            isActive = pathname === item.href && !currentTab
                        }

                        return (
                            <div key={item.label} className="space-y-1">
                                <Link
                                    href={item.href}
                                    onClick={() => !hasSubItems && setIsOpen(false)}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#0F2137]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 transition-colors'}`} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                    {isActive && !hasSubItems && <ChevronRight className="h-4 w-4" />}
                                </Link>

                                {hasSubItems && (
                                    <div className="pl-9 space-y-1 mt-1 border-l border-gray-200 ml-5">
                                        {item.subItems.map((sub) => {
                                            const subTab = sub.href.includes('tab=') ? sub.href.split('tab=')[1] : null
                                            const isSubActive = pathname === '/perfil' && currentTab === subTab;

                                            return (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center gap-3 p-2 rounded-lg text-xs font-medium transition-all ${isSubActive
                                                        ? 'text-blue-600 bg-blue-50'
                                                        : 'text-gray-500 hover:text-[#0F2137] hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSubActive ? 'bg-blue-600' : 'bg-gray-300 group-hover:bg-gray-400'}`} />
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

                <div className="p-4 border-t border-gray-200 space-y-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
