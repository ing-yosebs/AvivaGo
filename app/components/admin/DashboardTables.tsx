'use client'

import { Car, User, Shield, AlertTriangle, CreditCard, Clock, CheckCircle } from 'lucide-react'
import { formatDateMX } from '@/lib/dateUtils'
import Link from 'next/link'

type DashboardTablesProps = {
    view: string
    data: any[]
}

export default function DashboardTables({ view, data }: DashboardTablesProps) {
    if (!data || data.length === 0) {
        return (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-xl">
                <p className="text-zinc-500 font-medium">No hay registros para mostrar en esta vista.</p>
            </div>
        )
    }

    const renderTable = () => {
        switch (view) {
            case 'active_drivers':
                return (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-500 text-xs uppercase tracking-wider">
                                <th className="pb-4 font-semibold px-4">Conductor</th>
                                <th className="pb-4 font-semibold px-4">Vehículo</th>
                                <th className="pb-4 font-semibold px-4">Ciudad</th>
                                <th className="pb-4 font-semibold px-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map((driver) => (
                                <tr key={driver.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex flex-col justify-center items-center border border-emerald-500/20 overflow-hidden group/photo relative">
                                                {driver.signed_photo_url || driver.users?.avatar_url || driver.profile_photo_url ? (
                                                    <img src={driver.signed_photo_url || driver.users?.avatar_url || driver.profile_photo_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <>
                                                        <Car className="h-4 w-4 text-emerald-400" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-[7px] text-white font-bold uppercase">Sin Foto</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm">{driver.users?.full_name || 'Sin Nombre'}</span>
                                                <span className="text-zinc-500 text-xs">{driver.users?.phone_number || driver.users?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-300 text-sm">{driver.brand} {driver.model}</span>
                                            <span className="text-zinc-500 text-xs">{driver.year} • {driver.license_plate}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-zinc-400 text-sm">
                                        {driver.city || 'No especificada'}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <Link href={`/admin/users/${driver.id}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold px-3 py-1.5 bg-blue-500/10 rounded-lg hover:bg-blue-500/20">
                                            Ver Perfil
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )

            case 'pending_drivers':
                return (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-500 text-xs uppercase tracking-wider">
                                <th className="pb-4 font-semibold px-4">Solicitante</th>
                                <th className="pb-4 font-semibold px-4">Fecha de Solicitud</th>
                                <th className="pb-4 font-semibold px-4">Estado</th>
                                <th className="pb-4 font-semibold px-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map((driver) => (
                                <tr key={driver.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex flex-col justify-center items-center border border-orange-500/20 overflow-hidden group/photo relative">
                                                {driver.signed_photo_url || driver.users?.avatar_url || driver.profile_photo_url ? (
                                                    <img src={driver.signed_photo_url || driver.users?.avatar_url || driver.profile_photo_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <>
                                                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-[7px] text-white font-bold uppercase">Sin Foto</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm">{driver.users?.full_name || 'Sin Nombre'}</span>
                                                <span className="text-zinc-500 text-xs">{driver.users?.phone_number || driver.users?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-zinc-300 text-sm">
                                        {formatDateMX(driver.created_at)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                            Pendiente
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <Link href={`/admin/users/${driver.id}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold px-3 py-1.5 bg-blue-500/10 rounded-lg hover:bg-blue-500/20">
                                            Revisar Docs
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )

            case 'pending_payments':
                return (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-500 text-xs uppercase tracking-wider">
                                <th className="pb-4 font-semibold px-4">Usuario</th>
                                <th className="pb-4 font-semibold px-4">Fecha de Creación</th>
                                <th className="pb-4 font-semibold px-4">Monto Estimado</th>
                                <th className="pb-4 font-semibold px-4 text-right">Estado Sesión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map((payment) => (
                                <tr key={payment.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex flex-col justify-center items-center border border-purple-500/20 overflow-hidden group/photo relative">
                                                {payment.signed_photo_url || payment.users?.avatar_url ? (
                                                    <img src={payment.signed_photo_url || payment.users?.avatar_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <>
                                                        <CreditCard className="h-4 w-4 text-purple-400" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-[7px] text-white font-bold uppercase">Sin Foto</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm">{payment.users?.full_name || 'Sin Nombre'}</span>
                                                <span className="text-zinc-500 text-xs">{payment.users?.phone_number || payment.users?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-zinc-300 text-sm">
                                        {formatDateMX(payment.created_at)}
                                    </td>
                                    <td className="py-4 px-4 text-zinc-300 text-sm font-semibold">
                                        $524.00
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                                            <Clock className="w-3 h-3 mr-1.5" /> Abierta
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )

            case 'recent_users':
                return (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-500 text-xs uppercase tracking-wider">
                                <th className="pb-4 font-semibold px-4">Usuario</th>
                                <th className="pb-4 font-semibold px-4">Fecha Registro</th>
                                <th className="pb-4 font-semibold px-4">Rol Detectado</th>
                                <th className="pb-4 font-semibold px-4 text-right">Validación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map((user) => {
                                const roles = user.roles || []
                                const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin'
                                const isDriver = !!user.driver_profiles || (Array.isArray(roles) ? roles.includes('driver') : roles === 'driver')

                                return (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex flex-col justify-center items-center border border-blue-500/20 overflow-hidden group/photo relative">
                                                    {user.signed_photo_url || user.avatar_url ? (
                                                        <img src={user.signed_photo_url || user.avatar_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <>
                                                            <User className="h-4 w-4 text-blue-400" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-[7px] text-white font-bold uppercase">Sin Foto</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium text-sm">{user.full_name || 'Sin Nombre'}</span>
                                                    <span className="text-zinc-500 text-xs">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-zinc-300 text-sm">
                                            {formatDateMX(user.created_at)}
                                        </td>
                                        <td className="py-4 px-4">
                                            {isAdmin ? (
                                                <span className="text-amber-400 text-xs font-semibold flex items-center bg-amber-500/10 px-2 py-1 rounded-lg w-max border border-amber-500/20"><Shield className="w-3 h-3 mr-1.5" /> Admin</span>
                                            ) : isDriver ? (
                                                <span className="text-emerald-400 text-xs font-semibold flex items-center bg-emerald-500/10 px-2 py-1 rounded-lg w-max border border-emerald-500/20"><Car className="w-3 h-3 mr-1.5" /> Conductor</span>
                                            ) : (
                                                <span className="text-blue-400 text-xs font-semibold flex items-center bg-blue-500/10 px-2 py-1 rounded-lg w-max border border-blue-500/20"><User className="w-3 h-3 mr-1.5" /> Pasajero</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {user.email_confirmed_at ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-500 inline-block" />
                                            ) : (
                                                <span className="text-zinc-500 text-xs border border-zinc-700 rounded px-2 py-0.5">Pendiente</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )

            default:
                return null
        }
    }

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-x-auto relative animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white capitalize">
                    {view.replace('_', ' ')}
                </h3>
                {view === 'active_drivers' && <Link href="/admin/users?filter=drivers" className="text-sm text-blue-400 hover:text-blue-300">Ver Todos →</Link>}
                {view === 'pending_drivers' && <Link href="/admin/users?filter=pending" className="text-sm text-blue-400 hover:text-blue-300">Ver Todos →</Link>}
                {view === 'recent_users' && <Link href="/admin/users" className="text-sm text-blue-400 hover:text-blue-300">Ver Todos →</Link>}
                {view === 'pending_payments' && <Link href="/admin/financials" className="text-sm text-blue-400 hover:text-blue-300">Ir a Finanzas →</Link>}
            </div>

            <div className="px-2">
                {renderTable()}
            </div>
        </div>
    )
}
