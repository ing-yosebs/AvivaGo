import { Zap, Stethoscope, Users, Map, Globe, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { DriverProfile } from './types';

interface ProfileFeaturesProps {
    driver: DriverProfile;
}

export default function ProfileFeatures({ driver }: ProfileFeaturesProps) {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* SERVICE SEAL (Personality) */}
            {(driver.personality?.social || driver.personality?.driving || driver.personality?.assistance) && (
                <div className="bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] p-6 sm:p-8">
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-blue-50 p-2 rounded-xl">
                                <Zap className="h-5 w-5 text-aviva-primary" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Sello de Servicio Profesional</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {driver.personality?.social && (
                                <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm hover:shadow-soft transition-all">
                                    <div className="text-[10px] font-bold text-aviva-subtext uppercase tracking-widest">Interacción Social</div>
                                    <div className="text-lg font-bold text-aviva-primary">"{driver.personality.social.label}"</div>
                                    <p className="text-xs text-aviva-subtext leading-relaxed">
                                        La interacción social de este conductor es principalmente de <span className="text-aviva-navy font-semibold">"{driver.personality.social.label}"</span>. {driver.personality.social.desc}
                                    </p>
                                </div>
                            )}
                            {driver.personality?.driving && (
                                <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm hover:shadow-soft transition-all">
                                    <div className="text-[10px] font-bold text-aviva-subtext uppercase tracking-widest">Estilo de Conducción</div>
                                    <div className="text-lg font-bold text-purple-600">"{driver.personality.driving.label}"</div>
                                    <p className="text-xs text-aviva-subtext leading-relaxed">
                                        Su estilo de conducción es <span className="text-aviva-navy font-semibold">"{driver.personality.driving.label}"</span>. {driver.personality.driving.desc}
                                    </p>
                                </div>
                            )}
                            {driver.personality?.assistance && (
                                <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm hover:shadow-soft transition-all">
                                    <div className="text-[10px] font-bold text-aviva-subtext uppercase tracking-widest">Nivel de Asistencia</div>
                                    <div className="text-lg font-bold text-emerald-600">"{driver.personality.assistance.label}"</div>
                                    <p className="text-xs text-aviva-subtext leading-relaxed">
                                        El nivel de asistencia es <span className="text-aviva-navy font-semibold">"{driver.personality.assistance.label}"</span>. {driver.personality.assistance.desc}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
