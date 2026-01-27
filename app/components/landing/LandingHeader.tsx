'use client'

import Link from 'next/link';
import AvivaLogo from '../AvivaLogo';
import { LogIn } from 'lucide-react';

export default function LandingHeader() {
    return (
        <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <AvivaLogo className="h-9 sm:h-10 w-auto" showText={true} />
                    </Link>

                    {/* Simple Nav actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/auth/login"
                            className="hidden sm:flex items-center gap-2 text-gray-600 font-medium hover:text-blue-600 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Iniciar Sesión</span>
                        </Link>

                        <Link
                            href="/register"
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5"
                        >
                            Registrarme
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
