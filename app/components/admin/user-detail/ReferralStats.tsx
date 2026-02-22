
'use client';

import React, { useState } from 'react';
import { Share2, Car, User, ChevronDown, ChevronUp, Mail, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatDateMX } from '@/lib/dateUtils';

interface ReferralStatsProps {
    referrer: any;
    driverReferrals: any[];
    passengerReferrals: any[];
    totalReferralsCount: number;
}

export default function ReferralStats({
    referrer,
    driverReferrals,
    passengerReferrals,
    totalReferralsCount
}: ReferralStatsProps) {
    const [expandedType, setExpandedType] = useState<'driver' | 'passenger' | null>(null);

    const toggleExpand = (type: 'driver' | 'passenger') => {
        if (expandedType === type) {
            setExpandedType(null);
        } else {
            setExpandedType(type);
        }
    };

    const renderReferralsList = (users: any[]) => (
        <div className="mt-4 overflow-hidden border border-white/10 rounded-xl bg-black/20">
            <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-zinc-500 uppercase tracking-widest font-bold">
                    <tr>
                        <th className="px-4 py-3">Usuario</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.length > 0 ? users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-4 py-3 text-white font-medium">{u.full_name || 'Sin nombre'}</td>
                            <td className="px-4 py-3 text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {u.email}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDateMX(u.created_at)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Link
                                    href={`/admin/users/${u.id}`}
                                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold"
                                >
                                    Ver
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-zinc-600 italic">
                                No hay usuarios registrados en esta categoría.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                <Share2 className="h-5 w-5 text-blue-400" />
                Programa de Referidos
            </h3>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Información de Origen</label>
                        {referrer ? (
                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                <div className="mb-4">
                                    <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Invitado por</label>
                                    <p className="text-white font-bold text-lg">{referrer.full_name}</p>
                                </div>
                                <div>
                                    <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Código de Referencia Usado</label>
                                    <p className="text-blue-400 font-mono font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg inline-block">
                                        {referrer.referral_code}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-center text-center h-full">
                                <p className="text-zinc-500 italic text-sm">
                                    Este usuario no fue invitado por nadie (llegó orgánicamente a la plataforma).
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Estadísticas de Invitación</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => toggleExpand('driver')}
                                className={`flex flex-col text-left p-4 rounded-2xl relative overflow-hidden transition-all active:scale-95 ${expandedType === 'driver'
                                        ? 'bg-emerald-500/20 border-emerald-500/40 ring-2 ring-emerald-500/20'
                                        : 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10'
                                    } border shadow-lg`}
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Car className="h-12 w-12 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between w-full mb-1">
                                    <p className="text-3xl font-black text-white leading-none">{driverReferrals.length}</p>
                                    {expandedType === 'driver' ? <ChevronUp className="h-4 w-4 text-emerald-500" /> : <ChevronDown className="h-4 w-4 text-emerald-500/40" />}
                                </div>
                                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Conductores</p>
                            </button>

                            <button
                                onClick={() => toggleExpand('passenger')}
                                className={`flex flex-col text-left p-4 rounded-2xl relative overflow-hidden transition-all active:scale-95 ${expandedType === 'passenger'
                                        ? 'bg-blue-500/20 border-blue-500/40 ring-2 ring-blue-500/20'
                                        : 'bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10'
                                    } border shadow-lg`}
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <User className="h-12 w-12 text-blue-500" />
                                </div>
                                <div className="flex items-center justify-between w-full mb-1">
                                    <p className="text-3xl font-black text-white leading-none">{passengerReferrals.length}</p>
                                    {expandedType === 'passenger' ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-blue-500/40" />}
                                </div>
                                <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Pasajeros</p>
                            </button>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-zinc-500 text-xs font-medium">Alcance total de la red</span>
                            <span className="text-white font-bold text-sm bg-white/10 px-2.5 py-0.5 rounded-full">{totalReferralsCount} usuarios</span>
                        </div>
                    </div>
                </div>

                {/* Expanded Table Section */}
                {expandedType && (
                    <div className="pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                {expandedType === 'driver' ? (
                                    <><Car className="h-4 w-4 text-emerald-400" /> Conductores Invitados</>
                                ) : (
                                    <><User className="h-4 w-4 text-blue-400" /> Pasajeros Invitados</>
                                )}
                            </h4>
                            <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                                Mostrando {expandedType === 'driver' ? driverReferrals.length : passengerReferrals.length} resultados
                            </span>
                        </div>
                        {renderReferralsList(expandedType === 'driver' ? driverReferrals : passengerReferrals)}
                    </div>
                )}
            </div>
        </div>
    );
}
