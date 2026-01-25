'use client'

import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, LogOut, User, Rocket, Menu, X, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AvivaLogo from './AvivaLogo';

export default function Header() {
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsMenuOpen(false);
        router.refresh();
        router.push('/');
    };

    return (
        <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <AvivaLogo className="h-10 w-auto" showText={true} />
                    </Link>

                    {/* Navigation - Public Section */}
                    <nav className="hidden md:flex items-center gap-8 md:ml-12">
                        <Link
                            href="/comunidad"
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <Users className="h-4 w-4 opacity-70" />
                            <span>Comunidad</span>
                        </Link>
                    </nav>

                    {/* Nav actions */}
                    <div className="flex items-center gap-3">
                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <>
                                    <Link href="/perfil" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="max-w-[100px] truncate hidden lg:inline">{user.email?.split('@')[0]}</span>
                                    </Link>
                                    <Link href="/dashboard" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition-colors shadow-lg hover:-translate-y-0.5 transform duration-200">
                                        Mi Panel
                                    </Link>
                                    <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/register" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-4">
                                        Registrarme
                                    </Link>
                                    <Link href="/auth/login" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">
                                        Iniciar Sesión
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto">
                    <div className="p-4 space-y-3">

                        <Link
                            href="/comunidad"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
                        >
                            <Users className="h-5 w-5 text-gray-400" />
                            <span>Comunidad</span>
                        </Link>

                        <div className="border-t border-gray-100 my-2 pt-2">
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 font-bold mb-2"
                                    >
                                        <User className="h-5 w-5" />
                                        <span>Mi Perfil</span>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50 font-medium"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center p-3 rounded-xl bg-gray-50 text-gray-900 font-bold border border-gray-200 mb-2"
                                    >
                                        Registrarme
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center p-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
                                    >
                                        Entrar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
