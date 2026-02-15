import { ShieldCheck, Users, MapPin, Star } from 'lucide-react';
import { DriverProfile } from './types';

interface ProfileHeaderProps {
    driver: DriverProfile;
    className?: string;
}

export default function ProfileHeader({ driver, className = '' }: ProfileHeaderProps) {
    return (
        <div className={`bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] overflow-hidden ${className}`}>
            <div className="relative mb-3 sm:mb-8 text-center pt-8 sm:pt-8">
                {/* Vehicle Side Photo Background */}
                {driver.vehicleSidePhoto && (
                    <div className="absolute top-0 left-0 w-full h-24 sm:h-44 -z-0 pointer-events-none">
                        <div className="relative w-full h-full overflow-hidden rounded-t-[30px] sm:rounded-t-[40px]">
                            <img
                                src={driver.vehicleSidePhoto}
                                alt="Vista lateral del vehículo"
                                className="w-full h-full object-cover"
                            />
                            {/* Even more minimal fade at the bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-white to-transparent" />
                        </div>
                    </div>
                )}

                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden ring-4 ring-white shadow-2xl group relative z-10 bg-white aspect-square">
                    <img
                        src={driver.photo}
                        alt={driver.name}
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-blue-600/5 group-hover:opacity-0 transition-opacity" />
                </div>

                {/* Icons with higher z-index to stay on top - Adjusted for varying photo sizes */}
                <div className="absolute bottom-1 right-1/2 translate-x-9 translate-y-2 sm:translate-x-12 sm:translate-y-2 bg-green-500 p-1 sm:p-1.5 rounded-full ring-2 sm:ring-4 ring-white z-20 shadow-lg">
                    <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                {driver.social_commitment && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-9 translate-y-2 sm:-translate-x-12 sm:translate-y-2 bg-violet-500 p-1 sm:p-1.5 rounded-full ring-2 sm:ring-4 ring-white shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse z-20">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white fill-current" />
                    </div>
                )}
            </div>

            <div className="text-center mb-4 sm:mb-6 relative z-10 px-4 sm:px-6">
                <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 tracking-tight text-aviva-navy font-display line-clamp-1 sm:line-clamp-none">{driver.name}</h1>
            </div>
        </div>
    );
}
