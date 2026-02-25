
import React from 'react';
import { Car } from 'lucide-react';

interface ServiceInfoProps {
    driverProfile: any;
}

export default function ServiceInfo({ driverProfile }: ServiceInfoProps) {
    if (!driverProfile) return null;

    const services = Array.isArray(driverProfile.driver_services)
        ? driverProfile.driver_services[0]
        : driverProfile.driver_services;

    if (!services) return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Car className="h-5 w-5 text-purple-400" />
                Información de Servicio
            </h3>
            <p className="text-zinc-500 italic">No hay información de servicios registrada.</p>
        </div>
    );

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Car className="h-5 w-5 text-purple-400" />
                Información de Servicio
            </h3>

            <div className="space-y-6">
                {/* Bio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Reseña Profesional</h4>
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                            {services.professional_questionnaire?.bio || 'No especificada'}
                        </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Reseña Personal</h4>
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                            {services.personal_bio || 'No especificada'}
                        </p>
                    </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Plataformas</h4>
                        <div className="flex flex-wrap gap-2">
                            {services.transport_platforms?.length > 0 ? services.transport_platforms.map((p: string) => (
                                <span key={p} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-lg font-medium">
                                    {p}
                                </span>
                            )) : <span className="text-zinc-500 text-xs italic">Ninguna</span>}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Zonas e Idiomas</h4>
                        <div className="flex flex-wrap gap-2">
                            {services.preferred_zones?.map((z: string) => (
                                <span key={z} className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-lg font-medium">{z}</span>
                            ))}
                            {services.languages?.map((l: string) => (
                                <span key={l} className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs rounded-lg font-medium">{l}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment & Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Métodos de Pago</h4>
                        <div className="flex flex-wrap gap-2">
                            {services.payment_methods?.length > 0 ? services.payment_methods.map((m: string) => (
                                <span key={m} className="px-2 py-1 bg-zinc-500/10 text-zinc-300 border border-zinc-500/20 text-[10px] rounded-lg font-medium">{m}</span>
                            )) : <span className="text-zinc-500 text-xs italic">No especificados</span>}
                        </div>
                    </div>
                    {services.payment_link && (
                        <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Link de Cobro</h4>
                            <a
                                href={services.payment_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium underline break-all"
                            >
                                {services.payment_link}
                            </a>
                        </div>
                    )}
                </div>

                {/* Commitments */}
                <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${services.knows_sign_language ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-zinc-300">Sabe Lenguaje de Señas (LSM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${services.social_commitment ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-zinc-300">Compromiso Social Firmado</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
