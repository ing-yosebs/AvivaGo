
import React from 'react';
import Link from 'next/link';
import { Activity, CheckCircle } from 'lucide-react';
import DriverActions from '../DriverActions';
import MembershipManager from '../MembershipManager';
import PassengerActions from '../PassengerActions';
import DeleteUserButton from '../DeleteUserButton';

interface UserDetailSidebarProps {
    user: any;
    isDriver: boolean;
    driverProfile: any;
    membership: any;
}

export default function UserDetailSidebar({
    user,
    isDriver,
    driverProfile,
    membership
}: UserDetailSidebarProps) {
    return (
        <div className="space-y-6">
            {/* Driver Actions */}
            {isDriver && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-4 text-white">Acciones Admin</h3>
                    <p className="text-zinc-400 text-xs mb-6">
                        Revisa cuidadosamente la información antes de aprobar.
                    </p>

                    <div className="mb-4 pb-4 border-b border-white/10">
                        <Link
                            href={`/driver/${driverProfile.id}`}
                            target="_blank"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors text-sm font-medium"
                        >
                            <Activity className="h-4 w-4 text-blue-400" />
                            Ver Perfil Público
                        </Link>
                    </div>

                    <DriverActions
                        driverProfileId={driverProfile.id}
                        currentStatus={driverProfile.status}
                        isVisible={driverProfile.is_visible}
                    />
                </div>
            )}

            {/* Membership Manager */}
            {isDriver && (
                <MembershipManager
                    driverProfileId={driverProfile.id}
                    membershipStatus={membership?.status || 'inactive'}
                    expiresAt={membership?.expires_at}
                    origin={membership?.origin || 'unknown'}
                />
            )}

            {/* Passenger Verification Status */}
            {!isDriver && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-4 text-white">Estado de Validación</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-zinc-400 text-sm">Email Confirmado</span>
                            {user.email_confirmed_at ? (
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                            ) : (
                                <span className="text-xs font-bold text-zinc-500 uppercase">Pendiente</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-zinc-400 text-sm">Nombre Completo</span>
                            {user.full_name ? (
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                            ) : (
                                <span className="text-xs font-bold text-red-400 uppercase">Faltante</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-zinc-400 text-sm">Teléfono</span>
                            {user.phone_number ? (
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                            ) : (
                                <span className="text-xs font-bold text-red-400 uppercase">Faltante</span>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-zinc-500 text-center">
                                {(user.full_name && user.phone_number && user.email_confirmed_at)
                                    ? "Este usuario cumple con todos los requisitos para contactar conductores."
                                    : "El usuario debe completar su perfil para activar funciones de contacto."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Passenger Actions (Ban/Unban) */}
            {!isDriver && (
                <PassengerActions userId={user.id} isBanned={user.is_banned} />
            )}

            {/* Danger Zone */}
            <div className="backdrop-blur-xl bg-red-500/5 border border-red-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <h3 className="text-lg font-semibold mb-4 text-red-500 flex items-center gap-2">
                    Zona de Peligro
                </h3>
                <p className="text-zinc-500 text-xs mb-6">
                    Estas acciones son permanentes y no se pueden deshacer. Procede con extrema precaución.
                </p>
                <DeleteUserButton userId={user.id} />
            </div>
        </div>
    );
}
