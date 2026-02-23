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

    const navLinks: { name: string; href: string }[] = [];

    return (
        <>
            <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16 gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                            <AvivaLogo className="h-8 sm:h-9 w-auto" showText={true} />
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

                        {/* Right side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Desktop CTA */}
                            <div className="hidden md:flex items-center gap-4">
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
                                                    <span className="text-[10px] font-medium text-gray-400 leading-none">{targetLabel}</span>
                                                </div>
                                            </Link>
                                        );
                                    })()
                                ) : (
                                    <>
                                        <Link
                                            href="/auth/login"
                                            className="text-sm font-medium text-aviva-primary hover:text-aviva-primary/80 transition-colors px-4"
                                        >
                                            Iniciar Sesión
                                        </Link>
                                        <Link
                                            href="/register?role=driver"
                                            onClick={() => {
                                                if (typeof window.fbq !== 'undefined') {
                                                    window.fbq('track', 'Lead', {
                                                        content_name: 'Navbar CTA - Registration',
                                                        content_category: 'Drivers'
                                                    });
                                                }
                                                if (typeof window.ttq !== 'undefined') {
                                                    window.ttq.track('Lead', {
                                                        content_name: 'Navbar CTA - Registration',
                                                        content_category: 'Drivers'
                                                    });
                                                }
                                            }}
                                            className="bg-aviva-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-aviva-primary/90 transition-all shadow-lg shadow-aviva-primary/20 hover:-translate-y-0.5"
                                        >
                                            Regístrate Ya
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden p-2 text-gray-600 hover:text-aviva-primary hover:bg-blue-50 rounded-lg transition-colors"
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
                            className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto"
                        >
                            <div className="p-4 space-y-3">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="block text-base font-medium text-gray-600 hover:text-aviva-primary py-2 px-4"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                                <div className="border-t border-gray-100 my-2 pt-2">
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
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 mb-2 transition-all active:scale-[0.98]"
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
                                                className="flex items-center justify-center p-4 rounded-2xl bg-gray-100 text-gray-900 font-bold border border-gray-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Iniciar Sesión
                                            </Link>
                                            <Link
                                                href="/register?role=driver"
                                                className="flex items-center justify-center p-4 rounded-2xl bg-aviva-primary text-white font-bold shadow-lg shadow-aviva-primary/20"
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    if (typeof window.fbq !== 'undefined') {
                                                        window.fbq('track', 'Lead', {
                                                            content_name: 'Mobile Navbar CTA - Registration',
                                                            content_category: 'Drivers'
                                                        });
                                                    }
                                                    if (typeof window.ttq !== 'undefined') {
                                                        window.ttq.track('Lead', {
                                                            content_name: 'Mobile Navbar CTA - Registration',
                                                            content_category: 'Drivers'
                                                        });
                                                    }
                                                }}
                                            >
                                                Regístrate Ya
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            <div className="h-14 sm:h-16" />
        </>
    );
}
