'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, LogOut, ArrowRight, LayoutDashboard } from 'lucide-react'

export default function SessionActivePage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    // Determine where they were trying to go
    const intendedPath = searchParams.get('next') || '/auth/register'

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // If not logged in, why are they here? Redirect to intended path
                router.replace(intendedPath)
                return
            }
            setUser(user)
            setLoading(false)
        }
        getUser()
    }, [supabase, router, intendedPath])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push(intendedPath) // Send them where they wanted to go (register/login)
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    Ya tienes una sesión activa
                </h1>

                <p className="text-center text-gray-500 mb-6">
                    Actualmente estás conectado como:
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-center gap-3 justify-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-mono text-blue-800 font-medium">
                        {user.email}
                    </span>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Ir a mi Panel Principal
                    </Link>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-2 text-xs text-gray-400 uppercase font-medium">o si prefieres</span>
                        </div>
                    </div>

                    <p className="text-xs text-center text-gray-400 px-4">
                        Si quieres crear una cuenta nueva o entrar con otro usuario, primero debes cerrar la sesión actual.
                    </p>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión y Continuar
                    </button>
                </div>
            </div>
        </div>
    )
}
