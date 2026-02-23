import { ShieldCheck, Users, User } from 'lucide-react';
import { DriverProfile } from './types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileHeaderProps {
    driver: DriverProfile;
    className?: string;
}

export default function ProfileHeader({ driver, className = '' }: ProfileHeaderProps) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const heroPhotos = driver.heroPhotos || [];
    const profilePhotos = [driver.photo, driver.selfiePhoto].filter(Boolean) as string[];

    useEffect(() => {
        const hasHeroCarousel = heroPhotos.length > 1;
        const hasProfileCarousel = profilePhotos.length > 1;

        if (!hasHeroCarousel && !hasProfileCarousel) return;

        const timer = setInterval(() => {
            if (hasHeroCarousel) {
                setCurrentPhotoIndex((prev) => (prev + 1) % heroPhotos.length);
            }
            if (hasProfileCarousel) {
                setCurrentProfileIndex((prev) => (prev + 1) % profilePhotos.length);
            }
        }, 15000);

        return () => clearInterval(timer);
    }, [heroPhotos.length, profilePhotos.length]);

    return (
        <div className={`bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] overflow-hidden ${className}`}>
            <div className="relative mb-3 sm:mb-8 text-center pt-8 sm:pt-8">
                {/* Vehicle Photos Carousel Background (Premium only) */}
                {heroPhotos.length > 0 && (
                    <div className="absolute top-0 left-0 w-full h-24 sm:h-44 -z-0 pointer-events-none">
                        <div className="relative w-full h-full overflow-hidden rounded-t-[30px] sm:rounded-t-[40px]">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentPhotoIndex}
                                    src={heroPhotos[currentPhotoIndex]}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    alt={`Vista del vehículo ${currentPhotoIndex + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            {/* Even more minimal fade at the bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-white to-transparent" />
                        </div>
                    </div>
                )}

                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden ring-4 ring-white shadow-2xl group relative z-10 bg-white aspect-square">
                    {profilePhotos.length > 0 ? (
                        profilePhotos.length > 1 ? (
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentProfileIndex}
                                    src={profilePhotos[currentProfileIndex]}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    alt={driver.name}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                        ) : (
                            <img
                                src={profilePhotos[0]}
                                alt={driver.name}
                                className="w-full h-full object-cover"
                            />
                        )
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-blue-600/5 transition-opacity" />
                </div>

                {/* Icons with higher z-index to stay on top - Adjusted for varying photo sizes */}
                {driver.is_premium && (
                    <div className="absolute bottom-1 right-1/2 translate-x-9 translate-y-2 sm:translate-x-12 sm:translate-y-2 bg-green-500 p-1 sm:p-1.5 rounded-full ring-2 sm:ring-4 ring-white z-20 shadow-lg">
                        <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                )}
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
