'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function DeleteSuccessNotification() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [show, setShow] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (searchParams.get('deleted') === 'true') {
            setShow(true)
            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                handleClose()
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [searchParams])

    const handleClose = () => {
        setShow(false)
        // Clean up the URL without a full refresh
        const params = new URLSearchParams(window.location.search)
        params.delete('deleted')
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '')
        window.history.replaceState({}, '', newUrl)
    }

    if (!mounted || !show) return null

    return createPortal(
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-emerald-500 text-white rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 flex items-center gap-4 border border-white/20 backdrop-blur-md">
                <div className="bg-white/20 p-2 rounded-xl">
                    <CheckCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm">¡Usuario Eliminado!</p>
                    <p className="text-white/80 text-xs">Los datos han sido borrados permanentemente.</p>
                </div>
                <button
                    onClick={handleClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>,
        document.body
    )
}
