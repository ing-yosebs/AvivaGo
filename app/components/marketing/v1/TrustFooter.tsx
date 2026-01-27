'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

import AvivaLogo from '@/app/components/AvivaLogo';

export default function TrustFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-4 gap-8 mb-12">

                    {/* Brand & Trust */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <AvivaLogo className="h-10" showText={true} />
                        </Link>
                        <p className="text-gray-500 max-w-sm">
                            Empoderando conductores profesionales para construir negocios sostenibles y libres de comisiones.
                        </p>

                        <div className="pt-6 flex flex-wrap gap-4 items-center opacity-80">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                                <span className="text-xs font-bold text-gray-600">Fundación Aviva Group</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                                <span className="text-xs font-bold text-gray-600">Coaching Ontológico Certified</span>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Plataforma</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="#features" className="hover:text-aviva-primary">Beneficios</Link></li>
                            <li><Link href="#how-it-works" className="hover:text-aviva-primary">Cómo Funciona</Link></li>
                            <li><Link href="#pricing" className="hover:text-aviva-primary">Precios</Link></li>
                            <li><Link href="/login" className="hover:text-aviva-primary">Iniciar Sesión</Link></li>
                        </ul>
                    </div>

                    {/* Contact/Social */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Contacto</h4>
                        <ul className="space-y-2 text-sm text-gray-600 mb-6">
                            <li>soporte@avivago.com</li>
                            <li>+1 (555) 123-4567</li>
                        </ul>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-aviva-primary transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-aviva-primary transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-aviva-primary transition-colors"><Linkedin size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-aviva-primary transition-colors"><Twitter size={20} /></a>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} AvivaGo. Todos los derechos reservados.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-gray-900">Privacidad</Link>
                        <Link href="/terms" className="hover:text-gray-900">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
