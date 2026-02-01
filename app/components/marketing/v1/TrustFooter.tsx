'use client';

import Link from 'next/link';
import AvivaLogo from '@/app/components/AvivaLogo';

export default function TrustFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 py-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-4 gap-8">

                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2 space-y-4 pr-8">
                        <Link href="/" className="flex items-center gap-2">
                            <AvivaLogo className="h-10" showText={true} />
                        </Link>
                        <p className="text-gray-500 max-w-sm leading-relaxed">
                            Empoderando conductores profesionales para construir negocios sostenibles y libres de comisiones.
                        </p>
                        <p className="text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} AvivaGo. Todos los derechos reservados.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Plataforma</h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li>
                                <Link href="/legales/aviso-de-privacidad" className="hover:text-[#0066FF] transition-colors">
                                    Aviso de Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link href="/legales/afiliados" className="hover:text-[#0066FF] transition-colors">
                                    Afiliados
                                </Link>
                            </li>
                            <li>
                                <Link href="/legales/terminos-y-condiciones" className="hover:text-[#0066FF] transition-colors">
                                    Términos y Condiciones
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Contacto</h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li>
                                <a href="mailto:soporte@avivago.mx" className="hover:text-[#0066FF] transition-colors">
                                    soporte@avivago.mx
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
}
