'use client'

import DashboardSidebar from '@/app/components/DashboardSidebar'
import Header from '@/app/components/Header'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Rocket } from 'lucide-react'

export default function PanelLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
            } else {
                setUser(user)
                setLoading(false)
            }
        }
        checkAuth()
    }, [supabase, router, pathname])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAF8] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
            </div>
        )
    }

    const showSidebar = !!user;

    return (
        <div className="min-h-screen bg-[#F9FAF8] text-[#0F2137] flex flex-col lg:flex-row">
            {showSidebar ? (
                <DashboardSidebar />
            ) : (
                <Header />
            )}

            {/* Main Content Area */}
            <main className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen relative overflow-x-hidden pt-20 ${showSidebar ? 'lg:ml-64 lg:pt-8' : 'lg:pt-24'}`}>
                {/* Background Decorations - Adjusted for Light Mode */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none -z-10" />

                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
