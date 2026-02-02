'use client'

import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, LogOut, User, Rocket, Menu, X, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AvivaLogo from './AvivaLogo';

export default function Header() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            const { data } = await supabase
                .from('users')
                .select('full_name, avatar_url, roles')
                .eq('id', userId)
                .single();
            setProfile(data);
        };

        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsMenuOpen(false);
        router.refresh();
        router.push('/');
    };

    const isAdmin = Array.isArray(profile?.roles) ? profile.roles.includes('admin') : profile?.roles === 'admin';
    const targetLink = isAdmin ? '/admin' : '/dashboard';
    const targetLabel = isAdmin ? 'Panel Admin' : 'Mi Perfil';

    return (
        <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <AvivaLogo className="h-8 sm:h-9 w-auto" showText={true} />
                    </Link>


                    {/* Nav actions */}
                    <div className="flex items-center gap-3">
                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <>
                                    <Link
                                        href={targetLink}
                                        className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 pl-1.5 pr-4 py-1.5 rounded-2xl transition-all hover:shadow-soft active:scale-95 group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 overflow-hidden shrink-0">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-xs font-bold text-gray-900 leading-none mb-0.5">
                                                {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                                            </span>
                                            <span className="text-[10px] font-medium text-gray-400 leading-none">{targetLabel}</span>
                                        </div>
                                    </Link>

                                    <div className="w-px h-8 bg-gray-100 mx-1" />

                                    <button
                                        onClick={handleSignOut}
                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                        title="Cerrar Sesión"
                                    >
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


                        <div className="border-t border-gray-100 my-2 pt-2">
                            {user ? (
                                <>
                                    <Link
                                        href={targetLink}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 mb-2 transition-all active:scale-[0.98]"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 overflow-hidden">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{profile?.full_name || user.email?.split('@')[0]}</span>
                                            <span className="text-xs text-gray-500">{isAdmin ? 'Panel General' : 'Mi Perfil y Panel'}</span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 w-full p-4 rounded-2xl text-red-600 hover:bg-red-50 font-bold transition-colors"
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
                                        className="flex items-center justify-center p-4 rounded-2xl bg-gray-50 text-gray-900 font-bold border border-gray-200 mb-2"
                                    >
                                        Registrarme
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center p-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
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
