'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: string;
    currency: string;
    onConfirm: () => void;
    isLoading?: boolean;
}

export default function PaymentConfirmationModal({
    isOpen,
    onClose,
    amount,
    currency,
    onConfirm,
    isLoading = false
}: PaymentConfirmationModalProps) {
    const [authorized, setAuthorized] = useState(false);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[30px] w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* LARGE BACKGROUND ICON (Watermark Effect) */}
                <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.05]">
                    <ShieldCheck size={400} className="text-emerald-500 transform -rotate-12" />
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100/50 hover:bg-gray-200 text-gray-400 rounded-full transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Simplified Header */}
                <div className="bg-aviva-primary/5 pt-10 pb-6 text-center relative overflow-hidden z-10">
                    <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-blue-100/30 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-2xl font-bold font-display text-aviva-navy px-8 mt-2">Confirmación de Pago Seguro</h2>
                        <p className="text-xs font-bold text-aviva-primary uppercase tracking-widest mt-2">Membresía Profesional Anual</p>
                    </div>
                </div>

                <div className="p-8 space-y-6 relative z-10">
                    {/* Amount Display */}
                    <div className="text-center">
                        <div className="inline-flex items-baseline gap-2 bg-white px-8 py-4 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-5xl font-black text-aviva-navy">${amount}</span>
                            <span className="text-xl font-bold text-gray-400">{currency}</span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium mt-3">Suscripción anual sin cargos automaticos</p>
                    </div>

                    {/* Information Box */}
                    <div className="space-y-4">
                        <div className="flex gap-4 p-5 bg-white/80 rounded-2xl border border-blue-50">
                            <CreditCard size={20} className="text-aviva-primary shrink-0" />
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Tu pago se procesará de forma segura a través de <strong className="text-aviva-navy">Stripe</strong>. AvivaGo no almacena información de tarjetas.
                            </p>
                        </div>
                    </div>

                    {/* Authorization Checkbox */}
                    <label className="flex gap-4 cursor-pointer group select-none items-center">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                checked={authorized}
                                onChange={(e) => setAuthorized(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className={`w-6 h-6 border-2 rounded-lg transition-all flex items-center justify-center shadow-sm ${
                                authorized ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200 group-hover:border-emerald-500'
                            }`}>
                                <Check size={14} className={`text-white transition-all duration-300 ${authorized ? 'scale-110 opacity-100' : 'scale-0 opacity-0'}`} />
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 group-hover:text-aviva-navy transition-colors leading-tight">
                            Autorizo que se me dirija al portal de pagos seguro de Stripe para completar la transacción.
                        </span>
                    </label>

                    {/* Action Button */}
                    <div className="pt-2">
                        <button
                            disabled={!authorized || isLoading}
                            onClick={onConfirm}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                                authorized && !isLoading
                                    ? 'bg-aviva-primary text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
                            }`}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    Proceder al Pago
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function Check({ className, size }: { className?: string; size?: number }) {
    return (
        <svg 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );
}
