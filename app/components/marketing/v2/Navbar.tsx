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
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        // Check session and fetch profile
        const checkSession = async () => {
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
        };
        checkSession();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [supabase]);

    return (
        <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <AvivaLogo className="h-9 sm:h-10 w-auto" showText={true} />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {/* 
                         * Currently no middle links as requested, focus is on Registration.
                         * Can add links like "Cómo funciona" or "Beneficios" here later.
                         */}
                    </div>

                    {/* Right side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Desktop CTA */}
                        <div className="hidden md:flex items-center gap-4">
                            {session ? (
                                (() => {
                                    const roles = profile?.roles || [];
                                    const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin';
                                    const targetLink = isAdmin ? '/admin' : '/dashboard';
                                    const targetLabel = isAdmin ? 'Panel Admin' : 'Mi Cuenta';

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
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="text-sm font-semibold text-gray-700 hover:text-aviva-primary transition-colors px-4 py-2"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-aviva-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-aviva-primary/90 transition-all shadow-lg shadow-aviva-primary/20 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-xl"
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600 hover:text-aviva-primary hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl overflow-hidden rounded-b-2xl"
                    >
                        <div className="p-6 space-y-4">
                            <div className="grid gap-3">
                                {session ? (
                                    (() => {
                                        const roles = profile?.roles || [];
                                        const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin';
                                        const targetLink = isAdmin ? '/admin' : '/dashboard';
                                        const targetLabel = isAdmin ? 'Panel Admin' : 'Ir a mi Panel';

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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
