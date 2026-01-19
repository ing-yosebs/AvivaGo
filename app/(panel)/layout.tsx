'use client'

import DashboardSidebar from '@/app/components/DashboardSidebar'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PanelLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()
    const router = useRouter()

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
    }, [supabase, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col lg:flex-row">
            <DashboardSidebar />

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen relative overflow-x-hidden pt-20 lg:pt-8">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
