'use client'

import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, LogOut, User, Rocket, Menu, X, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
        <header className="fixed w-full top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <div className="bg-white/10 p-1.5 rounded-lg border border-white/10 group-hover:bg-white/20 transition-colors">
                            <Rocket className="h-5 w-5 text-white transform -rotate-45" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">AvivaGo</span>
                    </Link>

                    {/* Navigation - Public Section */}
                    <nav className="flex items-center gap-1 sm:gap-6 flex-1 justify-center md:justify-start md:ml-8">
                        <Link
                            href="/comunidad"
                            className="flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-white transition-all bg-white/5 md:bg-transparent px-3 py-1.5 rounded-full border border-white/5 md:border-none"
                        >
                            <Users className="h-4 w-4 md:hidden" />
                            <span>Comunidad</span>
                        </Link>
                    </nav>

                    {/* Nav actions */}
                    <div className="flex items-center gap-2">
                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <>
                                    <Link href="/perfil" className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                                    </Link>
                                    <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                        Mi Panel
                                    </Link>
                                    <button onClick={handleSignOut} className="p-2 text-zinc-400 hover:text-red-400 transition-colors">
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/register" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-2">
                                        Registrarme
                                    </Link>
                                    <Link href="/auth/login" className="bg-white text-black px-5 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg font-black">
                                        Entrar
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-zinc-950 border-b border-white/10 animate-in slide-in-from-top-2 duration-200 shadow-2xl overflow-hidden">
                    <div className="p-4 space-y-3 bg-zinc-900/50 backdrop-blur-xl">
                        {user ? (
                            <>
                                <Link
                                    href="/perfil"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 text-white font-bold"
                                >
                                    <User className="h-5 w-5 text-blue-400" />
                                    <span>Mi Perfil</span>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 p-4 rounded-2xl bg-blue-600 text-white font-bold"
                                >
                                    <Rocket className="h-5 w-5" />
                                    <span>Ir al Panel Principal</span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-3 w-full p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold"
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
                                    className="flex items-center justify-center p-4 rounded-2xl bg-white/5 text-white font-black border border-white/10"
                                >
                                    Registrarme
                                </Link>
                                <Link
                                    href="/auth/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center p-4 rounded-2xl bg-white text-black font-black"
                                >
                                    Entrar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
