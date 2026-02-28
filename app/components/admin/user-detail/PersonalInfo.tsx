
import React from 'react';
import Image from 'next/image';
import { User, MapPin } from 'lucide-react';
import { formatDateMX } from '@/lib/dateUtils';

interface PersonalInfoProps {
    user: any;
    driverProfile: any;
    profilePhotoUrl: string | null;
}

export default function PersonalInfo({ user, driverProfile, profilePhotoUrl }: PersonalInfoProps) {
    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-purple-400" />
                Información Personal
            </h3>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 space-y-4">
                    {profilePhotoUrl ? (
                        <div className="w-full md:w-48 aspect-square relative rounded-xl overflow-hidden border border-white/10 bg-black/20 group">
                            <Image
                                src={profilePhotoUrl}
                                alt="Profile"
                                className="object-cover"
                                fill sizes="(max-width: 768px) 100vw, 300px"
                            />
                            <div className="absolute bottom-0 left-0 w-full bg-black/60 p-2 text-[10px] text-center text-white uppercase font-bold">Foto de Perfil</div>
                        </div>
                    ) : (
                        <div className="w-full md:w-48 aspect-square flex flex-col items-center justify-center bg-white/5 rounded-xl border border-white/10 text-zinc-500 text-sm p-4 text-center gap-3">
                            <div className="p-4 rounded-full bg-white/5 border border-white/10">
                                <User className="h-8 w-8 text-zinc-600" />
                            </div>
                            <span className="font-semibold uppercase tracking-wider text-[10px]">Sin foto de perfil</span>
                        </div>
                    )}
                </div>

                <div className="flex-grow space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1">
                            <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Nombre Completo</label>
                            <p className="text-white font-bold text-xl sm:text-2xl leading-tight">{user.full_name}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Correo Electrónico</label>
                                <p className="text-white font-medium text-sm sm:text-base break-all">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Teléfono</label>
                                <p className="text-white font-bold text-base">
                                    {(() => {
                                        const phone = user.phone_number || driverProfile?.whatsapp_number;
                                        if (!phone) return 'No registrado';
                                        return phone; // Muestra el teléfono completo para el administrador
                                    })()}
                                </p>
                            </div>
                        </div>

                        {/* Datos de Identidad */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                                <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Fecha Nacimiento</label>
                                <p className="text-white font-medium text-sm">{user.birthday ? formatDateMX(user.birthday) : 'No registrada'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Nacionalidad</label>
                                <p className="text-white font-medium text-sm">{user.nationality || 'No registrada'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">CURP / ID</label>
                                <p className="text-white font-mono text-sm tracking-wider">{user.curp || 'No especificada'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                                <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Nivel de Estudios</label>
                                <p className="text-white font-medium text-sm">{user.education_level || 'No especificado'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Contacto Emergencia</label>
                                <p className="text-white font-medium text-sm">
                                    {user.emergency_contact_name ? (
                                        <>
                                            {user.emergency_contact_name} ({user.emergency_contact_relationship}) <br />
                                            <span className="text-xs text-zinc-400">{user.emergency_contact_phone}</span>
                                        </>
                                    ) : 'No especificado'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                            <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Dirección de Residencia</label>
                            <div className="flex items-start gap-2 text-white font-medium text-sm leading-relaxed">
                                <MapPin className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                                <p>
                                    {user.address_text || [
                                        user.address_street,
                                        user.address_number_ext,
                                        user.address_number_int ? `Int. ${user.address_number_int}` : null,
                                        user.address_suburb,
                                        user.address_postal_code,
                                        user.address_state,
                                        user.address_country
                                    ].filter(Boolean).join(', ') || 'No registrada'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
