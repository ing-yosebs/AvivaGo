import { ShieldCheck, Users, MapPin, Star } from 'lucide-react';
import { DriverProfile } from './types';

interface ProfileHeaderProps {
    driver: DriverProfile;
    className?: string;
}

export default function ProfileHeader({ driver, className = '' }: ProfileHeaderProps) {
    return (
        <div className={`bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] overflow-hidden ${className}`}>
            <div className="relative mb-8 text-center pt-8">
                {/* Vehicle Side Photo Background */}
                {driver.vehicleSidePhoto && (
                    <div className="absolute top-0 left-0 w-full h-44 -z-0 pointer-events-none">
                        <div className="relative w-full h-full overflow-hidden rounded-t-[30px] sm:rounded-t-[40px]">
                            <img
                                src={driver.vehicleSidePhoto}
                                alt="Vista lateral del vehículo"
                                className="w-full h-full object-cover"
                            />
                            {/* Even more minimal fade at the bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent" />
                        </div>
                    </div>
                )}

                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-white shadow-2xl group relative z-10 bg-white aspect-square">
                    <img
                        src={driver.photo}
                        alt={driver.name}
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-blue-600/5 group-hover:opacity-0 transition-opacity" />
                </div>

                {/* Icons with higher z-index to stay on top - Adjusted for w-32 photo size */}
                <div className="absolute bottom-1 right-1/2 translate-x-12 translate-y-2 bg-green-500 p-1.5 rounded-full ring-4 ring-white z-20 shadow-lg">
                    <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                {driver.social_commitment && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-12 translate-y-2 bg-violet-500 p-1.5 rounded-full ring-4 ring-white shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse z-20">
                        <Users className="h-4 w-4 text-white fill-current" />
                    </div>
                )}
            </div>

            <div className="text-center mb-6 relative z-10 px-6">
                <h1 className="text-3xl font-bold mb-2 tracking-tight text-aviva-navy font-display">{driver.name}</h1>

                {driver.social_commitment && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 border border-violet-100 text-violet-600 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                        <Users className="h-3 w-3 fill-current" />
                        Trato igualitario
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 text-aviva-subtext">
                    <MapPin className="h-4 w-4 text-aviva-primary" />
                    <span className="text-sm font-medium">{driver.city}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-4">
                    <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-sm font-bold">{driver.rating}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-aviva-subtext font-medium">{driver.reviews} reseñas</span>
                </div>
            </div>
        </div>
    );
}
