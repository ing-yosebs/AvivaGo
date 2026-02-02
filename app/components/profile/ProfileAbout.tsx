import { Award, User, Car } from 'lucide-react';
import { DriverProfile } from './types';

interface ProfileAboutProps {
    driver: DriverProfile;
}

export default function ProfileAbout({ driver }: ProfileAboutProps) {
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
            <section className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-50 p-2 rounded-xl">
                        <Car className="h-5 w-5 text-aviva-primary" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Vehículo Registrado</h3>
                </div>
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                    <div className="text-xl font-bold text-aviva-navy mb-1">{driver.vehicle}</div>
                    <div className="text-sm text-aviva-subtext font-medium">Modelo {driver.year} • Capacidad para 4 pasajeros</div>
                </div>
            </section>
        </div>
    );
}
