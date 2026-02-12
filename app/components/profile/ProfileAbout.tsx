import { Award, User, Car, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { DriverProfile } from './types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileAboutProps {
    driver: DriverProfile;
}

export default function ProfileAbout({ driver }: ProfileAboutProps) {
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const photos = driver.vehiclePhotos || [];

    return (
        <div className="bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 lg:p-12">
            <section className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-50 p-2 rounded-xl">
                        <Award className="h-5 w-5 text-aviva-primary" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Experiencia Profesional</h3>
                </div>
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                    <p className="text-aviva-subtext text-lg leading-relaxed font-medium">
                        {driver.bio}
                    </p>
                </div>
            </section>

            <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-50 p-2 rounded-xl">
                        <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Sobre mí (Reseña Personal)</h3>
                </div>
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                    <p className={`text-lg leading-relaxed font-medium ${driver.personal_bio ? 'text-aviva-subtext' : 'text-gray-400 italic'}`}>
                        {driver.personal_bio || "Este conductor aun no ha redactado su reseña personal."}
                    </p>
                </div>
            </section>

            {/* Vehicle */}
            <section className="mb-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-xl">
                            <Car className="h-5 w-5 text-aviva-primary" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Vehículo Registrado</h3>
                    </div>
                    {photos.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2 text-aviva-subtext text-xs font-bold uppercase tracking-widest">
                            <Camera className="h-4 w-4" />
                            {photos.length} Fotos
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    {/* Main Image Viewer */}
                    <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                        {photos.length > 0 ? (
                            <>
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={selectedPhoto}
                                        src={photos[selectedPhoto]}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                                        style={{
                                            imageRendering: 'auto',
                                        }}
                                        alt={`${driver.vehicle} - Foto ${selectedPhoto + 1}`}
                                    />
                                </AnimatePresence>

                                {/* Subtle grain and vignette overlay to enhance perceived quality */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/60 z-10" />
                                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-10" />

                                {/* Navigation arrows (mobile + desktop) */}
                                {photos.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedPhoto((p) => (p === 0 ? photos.length - 1 : p - 1))}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all z-20"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedPhoto((p) => (p === photos.length - 1 ? 0 : p + 1))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all z-20"
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                <Car className="h-12 w-12 opacity-20" />
                                <span className="text-sm font-medium">Sin fotos adicionales</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-8 text-white z-10">
                            <div className="text-2xl font-bold mb-1 drop-shadow-md">{driver.vehicle}</div>
                            <p className="text-white/90 text-sm font-medium drop-shadow-md">
                                Modelo {driver.year} • {driver.passenger_capacity || 4} Pasajeros
                                {driver.trunk_capacity && ` • Cajuela: ${driver.trunk_capacity}`}
                            </p>
                        </div>
                    </div>

                    {/* Thumbnails Strip */}
                    {photos.length > 1 && (
                        <div className="p-4 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100">
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-2">
                                {photos.map((photo, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedPhoto(idx)}
                                        className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${selectedPhoto === idx ? 'border-aviva-primary scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={photo} className="w-full h-full object-cover" alt="miniatura" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
