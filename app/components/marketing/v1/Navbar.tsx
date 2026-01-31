'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import AvivaLogo from '@/app/components/AvivaLogo';

import { User } from 'lucide-react';

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

    const navLinks = [
        { name: 'Cómo Funciona', href: '/legales/como-funciona' },
        { name: 'Precios', href: '/legales/precios' },
        { name: 'Aviso de Privacidad', href: '/legales/aviso-de-privacidad' },
        { name: 'Términos y Condiciones', href: '/legales/terminos-y-condiciones' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <AvivaLogo className="h-8 md:h-10" showText={true} />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-gray-600 hover:text-aviva-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        {session ? (
                            <Link
                                href="/dashboard"
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
                                        {profile?.full_name?.split(' ')[0] || session.user.email?.split('@')[0]}
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-400 leading-none">Mi Perfil</span>
                                </div>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-aviva-primary hover:text-aviva-primary/80 transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-aviva-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-aviva-primary/90 transition-all shadow-lg shadow-aviva-primary/20 hover:shadow-aviva-primary/40"
                                >
                                    Regístrate Ya
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-aviva-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-base font-medium text-gray-600 hover:text-aviva-primary py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-gray-100 my-2" />
                            {session ? (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-4 rounded-xl"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 overflow-hidden shrink-0">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-bold text-gray-900 leading-none mb-1">
                                            {profile?.full_name?.split(' ')[0] || session.user.email?.split('@')[0]}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400 leading-none">Mi Perfil</span>
                                    </div>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-base font-medium text-aviva-primary hover:text-aviva-primary/80 py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-aviva-primary text-white px-5 py-3 rounded-full text-base font-medium text-center hover:bg-aviva-primary/90 transition-all shadow-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Regístrate Ya
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
