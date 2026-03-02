'use client';

import React from 'react';
import { X, Lightbulb, Users, Smartphone, TrendingUp } from 'lucide-react';

interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnderstood: () => void;
}

export function TipModal({ isOpen, onClose, onUnderstood }: TipModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex flex-col items-center justify-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <Lightbulb className="w-8 h-8 text-yellow-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center">¡El Secreto del Éxito!</h2>
                    <p className="text-blue-100 text-center mt-2">
                        No esperes que los clientes lleguen solos. Transforma a tus pasajeros actuales en clientes recurrentes.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <span className="font-bold">1</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">¡Enamóralos de tu Servicio!</h3>
                            <p className="text-sm text-slate-600 mt-1">Regálales una experiencia única: una sonrisa, limpieza impecable, aire acondicionado o su música favorita. ¡Haz que no quieran viajar con nadie más!</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <span className="font-bold">2</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">El Código QR es Clave</h3>
                            <p className="text-sm text-slate-600 mt-1">Invítales a registrarse en AvivaGo escaneando el QR que colocaste en tu auto. Dile: <em>"Si te gustó mi servicio, regístrate con mi código para agendarme directo para tu próximo viaje."</em></p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <span className="font-bold">3</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Crece tu Cartera</h3>
                            <p className="text-sm text-slate-600 mt-1">¡Esta es la clave para hacer crecer tu cartera de clientes! Al registrarse y verificar su cuenta, se vuelven tus clientes fieles y te agendarán directamente para siempre.</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-slate-50 flex justify-center">
                    <button
                        onClick={onUnderstood}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-10 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        ¡Entendido, a conseguir clientes!
                    </button>
                </div>
            </div>
        </div>
    );
}
