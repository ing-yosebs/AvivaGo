import { ShieldCheck, Users, MapPin, Star } from 'lucide-react';
import { DriverProfile } from './types';

interface ProfileInfoProps {
    driver: DriverProfile;
    className?: string;
}

export default function ProfileInfo({ driver, className = '' }: ProfileInfoProps) {
    return (
        <div className={`text-center mb-6 relative z-10 px-6 ${className}`}>

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
    );
}
