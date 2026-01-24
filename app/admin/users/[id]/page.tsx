
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, Car, MapPin, Calendar, CheckCircle, Shield } from 'lucide-react'
import DriverActions from '@/app/components/admin/DriverActions'

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    // Await params first (Next.js 15+ requirement)
    const { id } = await params

    const supabase = await createClient()

    const { data: user, error } = await supabase
        .from('users')
        .select(`
            *,
            driver_profiles (
                id,
                status,
                city,
                bio,
                profile_photo_url,
                is_visible,
                created_at,
                service_radius_km,
                whatsapp_number
            ),
            vehicles (
                brand,
                model,
                year,
                color,
                plate_number,
                status
            )
        `)
        .eq('id', id)
        .single()

    if (error || !user) {
        notFound()
    }

    const driverProfile = Array.isArray(user.driver_profiles) ? user.driver_profiles[0] : user.driver_profiles
    const vehicle = Array.isArray(user.vehicles) ? user.vehicles[0] : user.vehicles // Assuming single vehicle for now

    const isDriver = !!driverProfile

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/users"
                    className="p-2 bg-white/5 border border-white/10 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">{user.full_name}</h1>
                    <p className="text-zinc-400 text-sm">{user.email}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    {driverProfile && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${driverProfile.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                driverProfile.status === 'pending_approval' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                            }`}>
                            {driverProfile.status === 'pending_approval' ? 'Pendiente' : driverProfile.status}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Documents / Photos Section if Driver */}
                    {isDriver && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-400" />
                                Documentación y Fotos
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {driverProfile.profile_photo_url ? (
                                    <div className="aspect-square relative rounded-xl overflow-hidden border border-white/10 bg-black/20 group">
                                        <Image
                                            src={driverProfile.profile_photo_url}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 w-full bg-black/60 p-2 text-xs text-center text-white">Foto de Perfil</div>
                                    </div>
                                ) : (
                                    <div className="aspect-square flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-zinc-500">
                                        Sin foto de perfil
                                    </div>
                                )}

                                {/* Placeholder for other documents if we had URLs */}
                                <div className="aspect-square flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-zinc-500 border-dashed">
                                    Documento ID (No disponible)
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Driver Actions */}
                    {isDriver && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4">Acciones de Administrador</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Revisa cuidadosamente la información antes de aprobar. La aprobación hará que el conductor sea visible (siempre que tenga membresía activa y visibilidad activada).
                            </p>
                            <DriverActions
                                driverProfileId={driverProfile.id}
                                currentStatus={driverProfile.status}
                                isVisible={driverProfile.is_visible}
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Personal Details */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-400" />
                            Detalles Personales
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Nombre Completo</label>
                                <p className="text-white font-medium">{user.full_name}</p>
                            </div>
                            <div>
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Correo</label>
                                <p className="text-white font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Teléfono</label>
                                <p className="text-white font-medium">{user.phone_number || driverProfile?.whatsapp_number || 'No registrado'}</p>
                            </div>
                            <div>
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Ciudad / Estado</label>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <MapPin className="h-4 w-4 text-zinc-400" />
                                    {driverProfile?.city || user.address_state || 'No registrado'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Fecha de Registro</label>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <Calendar className="h-4 w-4 text-zinc-400" />
                                    {new Date(user.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Details */}
                    {isDriver && vehicle && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Car className="h-5 w-5 text-emerald-400" />
                                Vehículo
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Marca</label>
                                        <p className="text-white font-medium">{vehicle.brand}</p>
                                    </div>
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Modelo</label>
                                        <p className="text-white font-medium">{vehicle.model}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Año</label>
                                        <p className="text-white font-medium">{vehicle.year}</p>
                                    </div>
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Color</label>
                                        <p className="text-white font-medium">{vehicle.color}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Placas</label>
                                    <p className="text-white font-mono bg-black/20 px-2 py-1 rounded border border-white/5 inline-block">
                                        {vehicle.plate_number || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
