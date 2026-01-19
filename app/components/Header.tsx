'use client'

import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, LogOut, User, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    searchTerm: string;
    onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ searchTerm, onSearchChange }: HeaderProps) {
    const [user, setUser] = useState<any>(null);
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

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl px-2 lg:px-0">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={onSearchChange}
                                className="block w-full pl-10 pr-10 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 sm:text-sm transition-all"
                                placeholder="Buscar conductor, ruta o ciudad..."
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button className="p-1 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-zinc-500 hover:text-white">
                                    <Filter className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Nav actions */}
                    <nav className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/perfil"
                                    className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    Mi Panel
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                                    title="Cerrar sesión"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/register" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-2">
                                    Registrarme
                                </Link>
                                <Link href="/auth/login" className="bg-white text-black px-5 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg">
                                    Entrar
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
