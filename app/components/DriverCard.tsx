import Link from 'next/link';
import { Star, MapPin, CheckCircle, Car, ArrowRight } from 'lucide-react';

interface DriverCardProps {
    driver: any;
}

export default function DriverCard({ driver }: DriverCardProps) {
    const fullName = driver.users?.full_name || 'Conductor AvivaGo';
    const vehicle = driver.vehicles?.[0]
        ? `${driver.vehicles[0].brand} ${driver.vehicles[0].model} ${driver.vehicles[0].year}`
        : 'Vehículo Confort';

    return (
        <Link
            href={`/driver/${driver.id}`}
            className="group relative block backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 shadow-2xl hover:shadow-white/5"
        >
            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="relative md:w-[35%] h-56 md:h-auto overflow-hidden">
                    <img
                        src={driver.profile_photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop'}
                        alt={fullName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 md:hidden" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Verificado</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {fullName}
                                </h3>
                                <div className="flex items-center gap-2 text-zinc-500 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-sm">{driver.city}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                                <span className="text-sm font-bold text-white">{driver.average_rating || '5.0'}</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Car className="h-4 w-4 opacity-50" />
                                <span className="text-sm truncate">{vehicle}</span>
                            </div>
                            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed italic">
                                "{driver.bio || 'Preparado para brindarte el mejor servicio de transporte privado con seguridad y puntualidad.'}"
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Disponible ahora</span>
                        <div className="flex items-center gap-2 text-white font-semibold text-sm group/btn">
                            Ver Perfil
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
