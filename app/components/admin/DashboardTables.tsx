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
            case 'abandoned_payments':
                return (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-500 text-xs uppercase tracking-wider">
                                <th className="pb-4 font-semibold px-4">Usuario</th>
                                <th className="pb-4 font-semibold px-4">Fecha de Creación</th>
                                <th className="pb-4 font-semibold px-4">Estado</th>
                                <th className="pb-4 font-semibold px-4 text-right">Contacto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map((payment) => {
                                const phone = payment.users?.phone_number
                                const whatsappUrl = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : null

                                return (
                                    <tr key={payment.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="py-4 px-4">
                                            {payment.driver_profile_id ? (
                                                <Link
                                                    href={`/driver/${payment.driver_profile_id}`}
                                                    target="_blank"
                                                    className="hover:opacity-80 transition-opacity block group/link"
                                                    title="Ver Perfil Público"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex flex-col justify-center items-center border border-purple-500/20 overflow-hidden group-hover/link:border-purple-400/50 relative transition-colors">
                                                            {payment.signed_photo_url || payment.users?.avatar_url ? (
                                                                <img src={payment.signed_photo_url || payment.users?.avatar_url} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <>
                                                                    <CreditCard className="h-4 w-4 text-purple-400" />
                                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/link:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <span className="text-[7px] text-white font-bold uppercase">Ver Perfil</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-medium text-sm group-hover/link:text-purple-400 transition-colors">{payment.users?.full_name || 'Sin Nombre'}</span>
                                                            <span className="text-zinc-500 text-xs">{phone || payment.users?.email}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex flex-col justify-center items-center border border-purple-500/20 overflow-hidden relative">
                                                        {payment.signed_photo_url || payment.users?.avatar_url ? (
                                                            <img src={payment.signed_photo_url || payment.users?.avatar_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <CreditCard className="h-4 w-4 text-purple-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-medium text-sm">{payment.users?.full_name || 'Sin Nombre'}</span>
                                                        <span className="text-zinc-500 text-xs">{phone || payment.users?.email}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-zinc-300 text-sm">
                                            {formatDateMX(payment.created_at)}
                                        </td>
                                        <td className="py-4 px-4">
                                            {payment.status === 'open' ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                                                    <Clock className="w-3 h-3 mr-1.5" /> Abierta (Pendiente)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                                    <AlertTriangle className="w-3 h-3 mr-1.5" /> {payment.status === 'expired' ? 'Expirada' : 'Fallida'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {whatsappUrl ? (
                                                <a
                                                    href={whatsappUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all active:scale-95"
                                                >
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.559.925 3.197 1.413 4.885 1.415 5.4 0 9.792-4.392 9.795-9.793.002-2.618-1.019-5.074-2.876-6.931s-4.314-2.878-6.931-2.878c-5.401 0-9.794 4.392-9.796 9.795-.001 1.763.5 3.447 1.448 4.887l-1.042 3.804 3.903-1.024zm11.354-1.291c.311.17.653.246.994.246.401 0 .8-.104 1.156-.309l1.62-.958c.204-.12.338-.323.364-.56s-.066-.467-.251-.62l-3.321-2.736c-.195-.16-.464-.2-.693-.1s-4.484 1.956-6.529.432l2.365-2.839c.148-.178.196-.419.127-.639l-1.026-3.264c-.08-.255-.3-.443-.564-.481s-.528.055-.719.24l-1.543 1.493c-2.43 2.352-.803 7.854 3.327 12.235zm-2.585-11.106l.534 1.698-1.233 1.48c-.628.754-1.397.747-1.93.303-.532-.443-.654-1.21-.026-1.964s1.233-1.48 1.93-.303z" />
                                                    </svg>
                                                    WhatsApp
                                                </a>
                                            ) : (
                                                <span className="text-xs text-zinc-500 italic">No Teléfono</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )

            case 'paid_memberships':
                return (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-500 text-xs uppercase tracking-wider">
                                <th className="pb-4 font-semibold px-4">Conductor</th>
                                <th className="pb-4 font-semibold px-4">Vigencia</th>
                                <th className="pb-4 font-semibold px-4 text-right">Membresía</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map((membership) => (
                                <tr key={membership.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex flex-col justify-center items-center border border-amber-500/20 overflow-hidden relative">
                                                {membership.signed_photo_url || membership.driver_profiles?.profile_photo_url || membership.driver_profiles?.users?.avatar_url ? (
                                                    <img src={membership.signed_photo_url || membership.driver_profiles?.profile_photo_url || membership.driver_profiles?.users?.avatar_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-4 w-4 text-amber-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm">{membership.driver_profiles?.users?.full_name || 'Sin Nombre'}</span>
                                                <span className="text-zinc-500 text-xs">{membership.driver_profiles?.users?.phone_number || membership.driver_profiles?.users?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm">
                                        <span className="text-zinc-300 block">{formatDateMX(membership.started_at)}</span>
                                        <span className="text-zinc-500 text-xs">Expiración: {formatDateMX(membership.expires_at)}</span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            Activa (Pagada)
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
                {view === 'paid_memberships' && <Link href="/admin/users?filter=drivers" className="text-sm text-blue-400 hover:text-blue-300">Ver Conductores →</Link>}
            </div>

            <div className="px-2">
                {renderTable()}
            </div>
        </div>
    )
}
