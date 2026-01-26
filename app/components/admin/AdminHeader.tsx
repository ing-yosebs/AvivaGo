'use client'

import { Bell, User } from 'lucide-react'

export default function AdminHeader() {
    return (
        <div className="hidden lg:flex sticky top-0 z-40 h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form className="relative flex flex-1" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">
                        Buscar
                    </label>
                    {/* Search bar could go here if needed globally */}
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button type="button" className="-m-2.5 p-2.5 text-zinc-400 hover:text-zinc-300">
                        <span className="sr-only">Ver notificaciones</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />
                    <div className="flex items-center gap-x-4 p-1">
                        <div className="bg-white/10 p-1 rounded-full">
                            <User className="h-6 w-6 text-zinc-400" />
                        </div>
                        <span className="hidden lg:flex lg:items-center">
                            <span className="text-sm font-semibold leading-6 text-white" aria-hidden="true">
                                Administrador
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
