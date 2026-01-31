'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AlertTriangle, X } from 'lucide-react'

export default function BanGuard({ isBanned }: { isBanned: boolean }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        if (isBanned) {
            // Option 1: Transactional Block
            // Only force redirect if trying to access sensitive "write" or "spend" paths
            const restrictedPaths = ['/checkout', '/payment', '/driver/onboarding', '/profile/edit']

            // Exact match or startsWith logic
            const isRestricted = restrictedPaths.some(path => pathname.startsWith(path))

            if (isRestricted) {
                // Determine where to redirect? Maybe back to home or just show alert and redirect
                // Ideally, Server Actions should also protect these, but client redirect helps UX
                router.replace('/?banned_action=true')
            }
        }
    }, [isBanned, pathname, router])

    if (!isBanned || !isVisible) return null

    // Render a non-intrusive banner
    return (
        <div className="fixed bottom-0 left-0 w-full z-[9999] bg-red-600 text-white p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-500">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full hidden sm:block">
                        <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm sm:text-base">Tu cuenta está suspendida</p>
                        <p className="text-xs sm:text-sm text-white/80">
                            No puedes realizar pagos ni contactar conductores.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="mailto:soporte@avivago.mx"
                        className="text-xs font-bold bg-white text-red-600 px-4 py-2 rounded-full whitespace-nowrap hover:bg-white/90 transition-colors"
                    >
                        Contactar Soporte
                    </a>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Cerrar aviso"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
