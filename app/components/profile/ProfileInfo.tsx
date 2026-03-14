import { MapPin, Star, Users } from 'lucide-react';
import { DriverProfile } from './types';

interface ProfileInfoProps {
    driver: DriverProfile;
    className?: string;
}

export default function ProfileInfo({ driver, className = '' }: ProfileInfoProps) {
    return (
        <div className={`text-center mb-2 relative z-10 ${className}`}>
            <div className="bg-white border border-gray-100 rounded-[30px] sm:rounded-[40px] p-5 sm:p-6 space-y-5 shadow-soft">
                {/* Primera línea: Trato igualitario y Ciudad */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {driver.social_commitment && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-100 text-violet-600 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm">
                            <Users className="h-3.5 w-3.5 fill-current" />
                            Trato igualitario
                        </div>
                    )}

                    <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm">
                        <MapPin className="h-4 w-4 text-aviva-primary" />
                        <span className="text-sm font-bold text-aviva-navy">{driver.city}</span>
                    </div>
                </div>
                
                {/* Segunda línea: Estrellas y Reseñas */}
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3.5 py-1.5 rounded-full border border-yellow-200 shadow-sm">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-base font-black">{driver.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100 shadow-sm">
                        <span className="text-sm text-aviva-navy font-bold">{driver.reviews}</span>
                        <span className="text-[10px] text-aviva-subtext font-bold uppercase tracking-widest">Reseñas</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
