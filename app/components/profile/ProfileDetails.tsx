import { Languages, Zap, Stethoscope, Users, Map, Globe, CreditCard, Clock, CheckCircle, ShieldCheck, Award, Car, MapPin, Video } from 'lucide-react';
import { DriverProfile } from './types';

interface ProfileDetailsProps {
    driver: DriverProfile;
}

export default function ProfileDetails({ driver }: ProfileDetailsProps) {
    return (
        <div className="bg-white border border-gray-100 shadow-soft rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 lg:p-12 space-y-12">

            {/* Social Commitment */}
            {driver.social_commitment && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-violet-50 p-2 rounded-xl">
                            <Users className="h-5 w-5 text-violet-600" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Compromiso de Trato Igualitario</h3>
                    </div>

                    <div className="p-8 bg-violet-50 border border-violet-100 rounded-[2.5rem] relative overflow-hidden group shadow-soft">
                        <Users className="absolute -right-4 -bottom-4 h-32 w-32 text-violet-500/5 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 pl-0">
                            <p className="text-violet-900/80 text-lg leading-relaxed font-medium">
                                "Me comprometo a brindar un trato cordial, respetuoso y equitativo a hombres, mujeres y a la comunidad LGBTQ+, sin distinción por ideologías o creencias religiosas de mis pasajeros."
                            </p>
                            <div className="flex items-center gap-2 pt-6">
                                <ShieldCheck className="h-4 w-4 text-violet-600" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600/70">Conductor Comprometido con la Inclusión</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Video Recording Privacy Notice */}
            {driver.records_video && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                            <Video className="h-5 w-5 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Aviso de Privacidad (Cámaras en Vehículo)</h3>
                    </div>

                    <div className="p-8 bg-amber-50/50 border border-amber-200 rounded-[2.5rem] relative overflow-hidden group shadow-soft">
                        <Video className="absolute -right-4 -bottom-4 h-32 w-32 text-amber-500/5 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 pl-0">
                            <p className="text-amber-900/80 text-sm md:text-base leading-relaxed font-medium">
                                "Este vehículo es monitoreado y cuenta con grabación de video operada exclusivamente por el Conductor, quien actúa como responsable independiente del tratamiento de estas imágenes para fines estrictamente de seguridad de ambas partes. AvivaGo no tiene acceso, control ni responsabilidad alguna sobre estas grabaciones. Al abordar el vehículo, consientes ser grabado en dichos términos."
                            </p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70">MONITOREO DE SEGURIDAD INDEPENDIENTE</span>
                                </div>
                                <a href={`/driver/${driver.referral_code || driver.id}/aviso-de-privacidad`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2 transition-colors">
                                    Leer Aviso Integral
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Inclusive Communication */}
            {driver.knows_sign_language && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-50 p-2 rounded-xl">
                            <Languages className="h-5 w-5 text-aviva-primary" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Comunicación Inclusiva</h3>
                    </div>
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                        <div>
                            <p className="text-aviva-navy font-bold text-lg">Intérprete de Lenguaje de Señas (LSM)</p>
                            <p className="text-aviva-subtext text-sm">Este conductor está capacitado para comunicarse con personas con discapacidad auditiva.</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Specialties */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-50 p-2 rounded-xl">
                        <Award className="h-5 w-5 text-aviva-primary" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Especialidades y Equipamiento</h3>
                </div>

                <div className="space-y-10">
                    {[
                        {
                            title: 'Capacidad Técnica',
                            color: 'blue',
                            icon: Zap,
                            tags: [
                                { id: 'cargo', label: 'Carga de Alto Volumen' },
                                { id: 'sport', label: 'Equipo Deportivo' },
                                { id: 'rack', label: 'Canastilla / Rack' },
                                { id: 'baby', label: 'Silla para Bebé' },
                                { id: 'charge', label: 'Kit de carga diversos celulares' },
                                { id: 'ac', label: 'Aire Acondicionado' }
                            ]
                        },
                        {
                            title: 'Inclusión y Salud',
                            color: 'red',
                            icon: Stethoscope,
                            tags: [
                                { id: 'mobility', label: 'Movilidad Reducida' },
                                { id: 'sensory', label: 'Asistencia Sensorial' },
                                { id: 'medical', label: 'Soporte Médico' },
                                { id: 'plus', label: 'Espacio Confort' },
                                { id: 'neuro', label: 'Neurodiversidad' }
                            ]
                        },
                        {
                            title: 'Logística y Estilo de Vida',
                            color: 'emerald',
                            icon: Users,
                            tags: [
                                { id: 'pet', label: 'Pet Friendly' },
                                { id: 'move', label: 'Mudanza Ligera' },
                                { id: 'shopping', label: 'Turismo de Compras' },
                                { id: 'party', label: 'Traslado de Fiesta' }
                            ]
                        },
                        {
                            title: 'Turismo y Cultura',
                            color: 'amber',
                            icon: Map,
                            tags: [
                                { id: 'native', label: 'Anfitrión Extranjeros' },
                                { id: 'guide', label: 'Guía e Información' },
                                { id: 'roads', label: 'Traslados Foráneos' },
                                { id: 'universal', label: 'Compromiso Universal' }
                            ]
                        }
                    ].map((cat) => {
                        const activeTags = cat.tags.filter(t => driver.tags.includes(t.id));
                        if (activeTags.length === 0) return null;

                        const colorClasses: any = {
                            blue: 'bg-blue-50 text-aviva-primary border-blue-100',
                            red: 'bg-red-50 text-red-600 border-red-100',
                            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                            amber: 'bg-amber-50 text-amber-600 border-amber-100'
                        };

                        const Icon = cat.icon;

                        return (
                            <div key={cat.title} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${colorClasses[cat.color].split(' ').pop()}`} />
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{cat.title}</h4>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {activeTags.map(tag => (
                                        <span
                                            key={tag.id}
                                            className={`px-4 py-2 border rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 ${colorClasses[cat.color].split(' ').slice(0, 3).join(' ')}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${cat.color === 'blue' ? 'bg-blue-400' : cat.color === 'red' ? 'bg-red-400' : cat.color === 'emerald' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                            {tag.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Payment Methods */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-50 p-2 rounded-xl">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Formas de Pago Aceptadas</h3>
                </div>
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                    {driver.payment_methods && driver.payment_methods.length > 0 ? (
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                {driver.payment_methods.map(method => (
                                    <span key={method} className="px-4 py-2 bg-white border border-emerald-100 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                                        {method === 'Efectivo' && '💵'}
                                        {method === 'Transferencia Bancaria' && '🏦'}
                                        {method === 'Tarjeta de Crédito/Débito' && '💳'}
                                        {method === 'Pago en Línea' && '🌐'}
                                        {method}
                                    </span>
                                ))}
                            </div>

                            {driver.is_premium && driver.hasAcceptedQuote && driver.payment_link && driver.payment_methods?.includes('Pago en Línea') && (
                                <a
                                    href={driver.payment_link.startsWith('http') ? driver.payment_link : `https://${driver.payment_link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] group"
                                >
                                    <Globe className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    Pagar en Línea ahora
                                </a>
                            )}
                        </div>
                    ) : (
                        <span className="text-aviva-subtext italic">No especificado</span>
                    )}
                </div>
            </section>

            {/* Zones - Premium Only */}
            {driver.is_premium && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-amber-50 p-2 rounded-xl">
                            <MapPin className="h-5 w-5 text-amber-800" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Zonas de Cobertura</h3>
                    </div>
                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl text-sm">
                        <div className="flex flex-wrap gap-2">
                            {(driver.zones || []).length > 0 ? (
                                (driver.zones || []).map(zone => (
                                    <span key={zone} className="px-3 py-1 bg-white border border-amber-200 text-amber-900 rounded-lg font-bold shadow-sm">{zone}</span>
                                ))
                            ) : <span className="text-aviva-subtext italic">No especificado</span>}
                        </div>
                    </div>
                </section>
            )}

            {/* Languages & Platforms */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Languages */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-50 p-2 rounded-xl">
                                <Globe className="h-5 w-5 text-aviva-primary" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Idiomas</h3>
                        </div>
                        <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl h-full">
                            <div className="flex flex-wrap gap-2">
                                {(driver.languages || []).length > 0 ? (
                                    (driver.languages || []).map(lang => (
                                        <span key={lang} className="px-3 py-1 bg-white border border-blue-100 text-aviva-primary rounded-lg text-sm font-bold shadow-sm">{lang}</span>
                                    ))
                                ) : <span className="text-aviva-subtext italic">Español</span>}
                            </div>
                        </div>
                    </section>

                    {/* Indigenous Languages */}
                    {(driver.indigenous || []).length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-50 p-2 rounded-xl">
                                    <Globe className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Lenguas Indígenas</h3>
                            </div>
                            <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl h-full">
                                <div className="flex flex-wrap gap-2">
                                    {driver.indigenous?.map((lang: string) => (
                                        <span key={lang} className="px-3 py-1 bg-white border border-purple-100 text-purple-600 rounded-lg text-sm font-bold shadow-sm">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Transport Platforms - Full Width Below */}
                {driver.transport_platforms && driver.transport_platforms.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gray-100 p-2 rounded-xl">
                                <Car className="h-5 w-5 text-gray-700" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Experiencia en Plataformas de Movilidad</h3>
                        </div>
                        <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                            <div className="flex flex-wrap gap-3">
                                {driver.transport_platforms.map(platform => (
                                    <div key={platform} className="px-4 py-2 bg-gray-700 border border-gray-700 rounded-xl text-sm font-bold text-white shadow-sm">
                                        {platform}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Schedule - Premium Only */}
            {driver.is_premium && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-50 p-2 rounded-xl">
                            <Clock className="h-5 w-5 text-aviva-primary" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-aviva-navy font-display">Horario y Disponibilidad</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
                            const time = driver.schedule?.[day];
                            const isActive = time && time.start !== '00:00' && time.end !== '00:00';

                            return (
                                <div key={day} className={`p-4 rounded-2xl border transition-all ${isActive ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-aviva-subtext mb-1">{day}</div>
                                    <div className={`text-sm font-bold ${isActive ? 'text-aviva-navy' : 'text-gray-300'}`}>
                                        {isActive ? `${time.start} - ${time.end}` : 'No disponible'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
