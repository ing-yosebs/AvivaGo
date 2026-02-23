'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import AvivaLogo from '@/app/components/AvivaLogo';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        // Check session and fetch profile
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);

                if (session?.user) {
                    const { data } = await supabase
                        .from('users')
                        .select('full_name, avatar_url, roles')
                        .eq('id', session.user.id)
                        .single();
                    setProfile(data);
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [supabase]);

    if (isLoading || !session) return null;

    return (
        <>
            <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group shrink-0">
                            <AvivaLogo className="h-9 sm:h-10 w-auto" />
                        </Link>

                        {/* Desktop Actions */}
                        <div className="flex items-center gap-4">
                            {session ? (
                                (() => {
                                    const roles = profile?.roles || [];
                                    const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin';
                                    const isDriver = Array.isArray(roles) ? roles.includes('driver') : roles === 'driver';

                                    let targetLink = '/dashboard';
                                    let targetLabel = 'Mi Panel';

                                    if (isAdmin) {
                                        targetLink = '/admin';
                                        targetLabel = 'Panel Admin';
                                    } else if (isDriver) {
                                        targetLink = '/perfil?tab=driver_dashboard';
                                        targetLabel = 'Panel Conductor';
                                    } else {
                                        targetLink = '/dashboard';
                                        targetLabel = 'Panel Pasajero';
                                    }

                                    return (
                                        <Link
                                            href={targetLink}
                                            className="flex items-center gap-3 bg-white/50 hover:bg-white border border-gray-200 pl-1.5 pr-4 py-1.5 rounded-full transition-all hover:shadow-md active:scale-95 group backdrop-blur-sm"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 overflow-hidden shrink-0">
                                                {profile?.avatar_url ? (
                                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs font-bold text-gray-900 leading-none mb-0.5">
                                                    {profile?.full_name?.split(' ')[0] || session.user.email?.split('@')[0]}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-500 leading-none">{targetLabel}</span>
                                            </div>
                                        </Link>
                                    );
                                })()
                            ) : (
                                <div className="hidden sm:flex items-center gap-6">
                                    <Link
                                        href="/auth/login"
                                        className="text-sm font-bold text-gray-600 hover:text-aviva-primary transition-colors"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-aviva-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-aviva-primary/90 transition-all shadow-lg shadow-aviva-primary/10 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        Regístrate Gratis
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="relative z-50 p-2 rounded-xl bg-gray-50 text-gray-900 border border-gray-100 transition-colors hover:bg-gray-100"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className="fixed top-24 left-6 right-6 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden md:hidden"
                            >
                                <div className="p-6 flex flex-col gap-6">
                                    {session ? (
                                        (() => {
                                            const roles = profile?.roles || [];
                                            const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin';
                                            const isDriver = Array.isArray(roles) ? roles.includes('driver') : roles === 'driver';

                                            let targetLink = '/dashboard';
                                            let targetLabel = 'Mi Panel';

                                            if (isAdmin) {
                                                targetLink = '/admin';
                                                targetLabel = 'Panel Admin';
                                            } else if (isDriver) {
                                                targetLink = '/perfil?tab=driver_dashboard';
                                                targetLabel = 'Panel Conductor';
                                            } else {
                                                targetLink = '/dashboard';
                                                targetLabel = 'Panel Pasajero';
                                            }

                                            return (
                                                <Link
                                                    href={targetLink}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 transition-all active:scale-[0.98]"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 overflow-hidden shrink-0">
                                                        {profile?.avatar_url ? (
                                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="h-6 w-6" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">
                                                            {profile?.full_name || session.user.email?.split('@')[0]}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{targetLabel}</span>
                                                    </div>
                                                </Link>
                                            );
                                        })()
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <Link
                                                href="/auth/login"
                                                className="flex items-center justify-center p-4 rounded-2xl bg-gray-100 text-gray-900 font-bold border border-gray-200 hover:bg-gray-200 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Iniciar Sesión
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="flex items-center justify-center p-4 rounded-2xl bg-aviva-primary text-white font-bold shadow-lg shadow-aviva-primary/20 hover:bg-aviva-primary/90 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Registrarse Gratis
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </nav>
            <div className={`h-16 sm:h-20 ${isScrolled ? 'block' : 'hidden'}`} />
        </>
    );
}
