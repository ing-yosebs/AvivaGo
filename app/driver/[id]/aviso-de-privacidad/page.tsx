import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ShieldCheck, Video, Info, User } from 'lucide-react';
import Link from 'next/link';

export default async function DriverPrivacyNoticePage({ params }: { params: Promise<{ id: string }> }) {
    const resParams = await params;
    const id = resParams.id.split('/')[0].trim();
    const supabase = await createClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('driver_profiles_public').select(`
        id,
        user_id,
        user_full_name,
        user_referral_code,
        user_address_state,
        city,
        created_at,
        driver_services (records_video, video_notice_accepted_at)
    `);

    if (isUuid) {
        query = query.or(`id.eq.${id},user_id.eq.${id}`);
    } else {
        query = query.ilike('user_referral_code', id);
    }

    const { data: driver, error } = await query.maybeSingle();

    if (error) {
        console.error('Error fetching driver for privacy notice:', error);
        notFound();
    }

    if (!driver) {
        notFound();
    }

    // Services can be an array if it's a join, or a single object
    const services = Array.isArray(driver.driver_services)
        ? (driver.driver_services[0] || {})
        : (driver.driver_services || {});

    // Only render the privacy notice if the driver actually has video recording enabled
    const isVideoEnabled = (services as any)?.records_video;

    if (!isVideoEnabled) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-24 space-y-8">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-soft text-center">
                    <Info className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-[#0F2137] mb-4">Aviso de Privacidad No Disponible</h1>
                    <p className="text-gray-600">Este conductor actualmente no tiene declarado el uso de cámaras de videovigilancia en su vehículo.</p>
                </div>
            </div>
        );
    }

    const driverName = (driver as any).user_full_name || "El Conductor";
    const driverCity = driver.user_address_state || driver.city || "México";

    // Formatting Dates
    const joinedAt = new Date(driver.created_at).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const acceptedAt = (services as any).video_notice_accepted_at
        ? new Date((services as any).video_notice_accepted_at).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
        : 'Recientemente';

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-24 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-soft">

                <div className="flex flex-col items-center justify-center mb-8 pb-8 border-b border-gray-100 text-center">
                    <div className="bg-amber-50 p-4 rounded-full mb-6 relative">
                        <Video className="h-8 w-8 text-amber-600" />
                        <div className="absolute top-0 right-0 -mt-1 -mr-1">
                            <span className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white"></span>
                            </span>
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0F2137] mb-4 font-display">
                        Aviso de Privacidad por Videovigilancia (Dashcam)
                    </h1>
                    <p className="text-gray-500 font-medium">Contrato de Responsabilidad del Conductor Independiente</p>
                </div>

                <div className="space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Conductor desde</p>
                            <p className="text-sm font-bold text-[#0F2137]">{joinedAt}</p>
                        </div>
                        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
                            <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Aviso actualizado el</p>
                            <p className="text-sm font-bold text-blue-900">{acceptedAt}</p>
                        </div>
                    </div>
                    <section>
                        <h2 className="text-lg font-bold text-[#0F2137] mb-3">1. IDENTIDAD Y DOMICILIO DEL RESPONSABLE</h2>
                        <p>
                            El responsable único y exclusivo del tratamiento, captación, almacenamiento y uso de las imágenes y sonidos obtenidos por la cámara de videovigilancia (Dashcam) instalada en este vehículo es <strong>{driverName}</strong>, con domicilio de operación en <strong>{driverCity}</strong> (en lo sucesivo, "El Conductor").
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-[#0F2137] mb-3">2. DATOS PERSONALES QUE SE RECABAN</h2>
                        <p>
                            Para las finalidades establecidas en este aviso, El Conductor recaba <strong>imágenes y audios (grabaciones de voz y ruidos ambientales)</strong> a través del sistema de videovigilancia digital instalado al interior o exterior de la unidad de transporte.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-[#0F2137] mb-3">3. FINALIDAD DEL TRATAMIENTO</h2>
                        <p className="mb-3">
                            Las imágenes y audios recopilados tienen como <strong>finalidad primaria la seguridad de ambas partes</strong> durante el trayecto, para ser utilizadas como evidencia ante autoridades o aseguradoras.
                        </p>
                        <p>
                            Como <strong>finalidad secundaria</strong>, El Conductor podrá utilizar fragmentos de video para difusión en canales digitales, sujeto estrictamente a las reglas de anonimización descritas en el siguiente punto.
                        </p>
                    </section>

                    <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <h2 className="text-lg font-bold text-[#0F2137] mb-3">4. DIFUSIÓN EN REDES SOCIALES Y ANONIMIZACIÓN</h2>
                        <p className="mb-3">
                            El Conductor podrá utilizar el material videográfico para fines de marketing o entretenimiento en redes sociales, siempre que garantice la <strong>anonimización total e irreversible</strong> de los pasajeros. Esto implica:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 mb-4">
                            <li>Pixelado o difuminado permanente de rostros.</li>
                            <li>Distorsión o eliminación de audio que contenga voces identificables.</li>
                            <li>Eliminación de cualquier dato que permita la identificación (nombres, placas, direcciones).</li>
                        </ul>
                        <p className="text-xs text-gray-500 italic">
                            Cualquier incumplimiento en la anonimización será responsabilidad exclusiva del Conductor, liberando a AvivaGo de reclamaciones por daño moral o violación a la privacidad.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-[#0F2137] mb-3">5. TRANSFERENCIAS DE DATOS</h2>
                        <p>
                            Se le informa que sus datos personales (video y audio) no serán compartidos con terceros, con excepción de <strong>autoridades jurisdiccionales o administrativas</strong> que lo soliciten legalmente, o en los casos previstos por la ley mexicana.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-[#0F2137] mb-3">6. CONSENTIMIENTO</h2>
                        <p>
                            Al confirmar su viaje y abordar el vehículo de <strong>{driverName}</strong>, el pasajero manifiesta su conocimiento y <strong>otorga su consentimiento</strong> expreso para ser grabado, aceptando tanto el uso de seguridad como el uso secundario de marketing bajo las reglas de anonimización mencionadas.
                        </p>
                    </section>

                    <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                        <h2 className="text-lg font-bold text-[#0F2137] mb-3 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-amber-600" />
                            7. DESLINDE DE RESPONSABILIDAD A AVIVAGO
                        </h2>
                        <p className="mb-3 font-medium text-amber-900/90">
                            <strong>AvivaGo, S.A. de C.V.</strong> actúa única y exclusivamente como un intermediario tecnológico o plataforma de conexión de software entre usuarios y conductores independientes.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-amber-900/80">
                            <li>AvivaGo <strong>no es propietaria</strong> de la cámara de seguridad ni opera dicho dispositivo.</li>
                            <li>AvivaGo <strong>no tiene acceso técnico</strong> ni operativo a las transmisiones de la cámara.</li>
                            <li>AvivaGo <strong>no almacena, no transfiere y no controla</strong> los archivos de video resultantes de dichas grabaciones.</li>
                        </ul>
                        <p className="mt-4 text-amber-900/80">
                            En consecuencia, <strong>el pasajero reconoce y acepta que AvivaGo, S.A. de C.V. queda plenamente liberada y eximida de cualquier responsabilidad administrativa, civil, comercial o penal</strong> originada por el mal uso, publicación, filtración o retención indebida de las grabaciones generadas por El Conductor. Toda controversia o reclamación derivada del tratamiento y privacidad de dicho material videográfico deberá dirimirse directamente con El Conductor o ante las autoridades competentes.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-lg font-bold text-[#0F2137] mb-3">8. DERECHOS ARCO (Acceso, Rectificación, Cancelación u Oposición)</h2>
                        <p>
                            En el evento de que el pasajero requiera ejercer sus legítimos derechos ARCO sobre las imágenes capturadas durante el viaje donde aparece, deberá gestionar y presentar dicha solicitud <strong>directamente ante El Conductor</strong>, siendo éste el responsable exclusivo de la procedencia legal, el resguardo temporal y el borrado de las imágenes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-[#0F2137] mb-3">9. CAMBIOS AL AVISO DE PRIVACIDAD</h2>
                        <p>
                            Cualquier cambio o modificación al presente aviso podrá ser consultado directamente en el enlace dinámico proporcionado en el perfil público del conductor o solicitado físicamente al mismo.
                        </p>
                    </section>
                    
                    <div className="pt-8 text-center text-sm text-gray-500 border-t border-gray-100 mt-8 mb-8">
                        Al usar este servicio, aceptas que el conductor es el único responsable de su cámara y de lo que se grabe. AvivaGo solo es la aplicación que los conecta.
                    </div>

                    <div className="flex justify-center mt-4">
                        <Link 
                            href={`/driver/${id}`}
                            className="inline-flex items-center gap-2 bg-[#0F2137] hover:bg-[#1A365D] text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <User className="w-5 h-5" />
                            Ver Perfil Público de {driverName}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
