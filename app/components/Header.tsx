'use client'

import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, LogOut, User, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
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
