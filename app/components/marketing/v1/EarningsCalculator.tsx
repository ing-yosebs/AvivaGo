'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function EarningsCalculator() {
    const [referralCount, setReferralCount] = useState(10);

    // Calculator constants (matching app/legales/afiliados/page.tsx)
    const ONE_TIME_BONUS_BRONZE = 80;
    const RECURRING_COMMISSION_BRONZE = 40;

    const ONE_TIME_BONUS_SILVER = 100;
    const RECURRING_COMMISSION_SILVER = 50;

    const ONE_TIME_BONUS_GOLD = 120;
    const RECURRING_COMMISSION_GOLD = 60;

    // Calculate earnings dynamically based on tier
    const calculateEarnings = (count: number) => {
        let oneTime = 0;
        let recurring = 0;
        let tier = 'Bronce';

        if (count <= 10) {
            oneTime = count * ONE_TIME_BONUS_BRONZE;
            recurring = count * RECURRING_COMMISSION_BRONZE;
            tier = 'Bronce';
        } else if (count <= 50) {
            oneTime = count * ONE_TIME_BONUS_SILVER;
            recurring = count * RECURRING_COMMISSION_SILVER;
            tier = 'Plata';
        } else {
            oneTime = count * ONE_TIME_BONUS_GOLD;
            recurring = count * RECURRING_COMMISSION_GOLD;
            tier = 'Oro';
        }

        return { oneTime, recurring, total: oneTime + recurring, tier };
    };

    const earnings = calculateEarnings(referralCount);

    return (
        <section className="py-16 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-aviva-navy mb-4 font-display">
                        Calculadora de <span className="text-aviva-primary">Ganancias</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Estima el potencial de tu red y mira cómo crecen tus ingresos pasivos.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 md:p-12">
                            <div className="mb-12">
                                <div className="flex justify-between items-end mb-6">
                                    <label className="block text-lg font-bold text-aviva-navy">
                                        Conductores referidos estimados
                                    </label>
                                    <span className="text-4xl font-black text-aviva-primary">
                                        {referralCount}
                                    </span>
                                </div>
                                <div className="relative h-4 flex items-center">
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={referralCount}
                                        onChange={(e) => setReferralCount(parseInt(e.target.value))}
                                        className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-aviva-secondary hover:accent-aviva-primary transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-400 mt-4 uppercase tracking-wider">
                                    <span>1 Conductor</span>
                                    <span>100+ Conductores</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-gray-100">
                                <div className="text-center px-4">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Tu Nivel</p>
                                    <p className={`text-3xl font-black ${earnings.tier === 'Oro' ? 'text-yellow-500' :
                                        earnings.tier === 'Plata' ? 'text-blue-400' : 'text-orange-500'
                                        }`}>
                                        {earnings.tier}
                                    </p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Bono por Activación</p>
                                    <p className="text-3xl font-black text-aviva-navy">
                                        ${earnings.oneTime.toLocaleString()} <span className="text-sm font-bold text-gray-400">MXN</span>
                                    </p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Ingreso Recurrente</p>
                                    <p className="text-3xl font-black text-green-500">
                                        ${earnings.recurring.toLocaleString()} <span className="text-sm font-bold text-gray-400">MXN</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                                <p className="text-sm text-gray-500 italic max-w-2xl mx-auto">
                                    * Los cálculos son estimaciones basadas en los niveles actuales del programa de afiliados. Los bonos se liberan cuando el referido activa su membresía anual.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
