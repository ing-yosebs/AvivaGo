import React from 'react';

export default function AvisoPrivacidadPage() {
    return (
        <>
            <h1 className="text-3xl font-bold text-center text-[#0F2137] mb-8 border-b pb-4">
                AVISO DE PRIVACIDAD INTEGRAL – AVIVAGO
            </h1>

            <div className="space-y-8 text-gray-700 leading-relaxed">
                {/* 1. IDENTIDAD Y DOMICILIO */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        1. IDENTIDAD Y DOMICILIO DEL RESPONSABLE
                    </h2>
                    <p>
                        El responsable del tratamiento de sus datos personales es <strong>AvivaGo, S.A. de C.V.</strong>, operando bajo la marca comercial AvivaGo, con domicilio en Oriente 116, número 2951, Colonia Ampliación Gabriel Ramos Millán, Código Postal 08020, Ciudad de México, quien es responsable del uso y protección de sus datos personales, en cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su normativa aplicable.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 2. DATOS PERSONALES */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        2. DATOS PERSONALES QUE RECOLECTAMOS
                    </h2>
                    <p className="mb-4">
                        Para cumplir con las finalidades de nuestra plataforma de conexión y catálogo de movilidad programada, AvivaGo podrá recabar las siguientes categorías de datos personales:
                    </p>

                    <div className="pl-4 space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-900">a) Datos de Identificación</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Nombre completo</li>
                                <li>Identificación oficial (para la validación de conductores y usuarios)</li>
                                <li>Fotografía de perfil</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900">b) Datos de Contacto y Verificación</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Correo electrónico</li>
                                <li>Número telefónico (WhatsApp)</li>
                                <li>Domicilio particular (utilizado exclusivamente para validación de residencia y seguridad de la comunidad)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900">c) Datos Patrimoniales y Financieros</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Datos de tarjetas de crédito o débito</li>
                                <li>Datos de cuentas bancarias</li>
                            </ul>
                            <p className="mt-2 italic text-sm">
                                Estos datos son procesados exclusivamente a través de plataformas de pago seguras de terceros, y AvivaGo no almacena información financiera sensible.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900">d) Datos de Preferencias y Características del Servicio</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Preferencias de viaje</li>
                                <li>Especificaciones del vehículo</li>
                                <li>Afinidad con mascotas</li>
                                <li>Atención a adultos mayores</li>
                                <li>Validación del servicio</li>
                                <li>Características del vehículo (en el caso de conductores)</li>
                            </ul>
                            <p className="mt-2 italic text-sm">
                                Estos datos se utilizan únicamente para facilitar la correcta coincidencia (“match”) entre usuarios y conductores conforme a sus necesidades y vocación de servicio.
                            </p>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* 3. FINALIDADES */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        3. FINALIDADES DEL TRATAMIENTO
                    </h2>

                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">A. Finalidades Primarias (necesarias para la prestación del servicio):</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Gestionar el registro de usuarios y conductores.</li>
                            <li>Validar la identidad de los miembros de la comunidad.</li>
                            <li>Publicar el perfil del conductor dentro del catálogo de servicios.</li>
                            <li>Facilitar la coincidencia entre las necesidades del usuario y la vocación del conductor.</li>
                            <li>Procesar el cobro de la anualidad (SaaS) a conductores y la micro-cuota de contacto a usuarios.</li>
                            <li>Facilitar el contacto inicial vía WhatsApp entre usuario y conductor para la coordinación del servicio de movilidad programada.</li>
                        </ul>
                        <p className="mt-4">
                            AvivaGo actúa únicamente como plataforma de conexión, por lo que no interviene, supervisa ni es responsable de los acuerdos, condiciones o servicios de transporte celebrados entre usuarios y conductores.
                        </p>
                        <p className="mt-2">
                            Los procesos de validación y capacitación implementados por AvivaGo y/o por la Fundación Aviva Action Group, AC tienen fines exclusivamente informativos, comunitarios y de mejora del servicio, y no constituyen en ningún caso acreditaciones oficiales, licencias, permisos gubernamentales ni sustituyen las obligaciones legales o regulatorias que correspondan a los conductores conforme a la legislación aplicable.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">B. Finalidades Secundarias:</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Envío de boletines informativos, promociones, capacitaciones y comunicaciones comerciales.</li>
                            <li>Encuestas de satisfacción y mejora del servicio.</li>
                        </ul>
                        <p className="mt-4">
                            El titular podrá oponerse al tratamiento de sus datos para estas finalidades secundarias enviando un correo electrónico a <a href="mailto:privacidad@avivago.mx" className="text-[#2563EB] hover:underline">privacidad@avivago.mx</a>, sin que ello afecte la prestación del servicio principal.
                        </p>
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* 4. CONSENTIMIENTO */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        4. CONSENTIMIENTO DEL TITULAR
                    </h2>
                    <p className="mb-2">
                        Al proporcionar sus datos personales y utilizar la plataforma AvivaGo, el titular manifiesta su consentimiento tácito para el tratamiento de sus datos conforme a las finalidades señaladas en el presente aviso.
                    </p>
                    <p>
                        En el caso de datos patrimoniales y financieros, el titular otorga su consentimiento expreso, mismo que será recabado a través de los mecanismos habilitados en la plataforma.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 5. TRANSFERENCIA */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        5. TRANSFERENCIA DE DATOS
                    </h2>
                    <p className="mb-4">AvivaGo podrá transferir sus datos personales en los siguientes casos:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>A la Fundación Aviva Action Group, AC, exclusivamente para fines de capacitación y desarrollo humano de los conductores.</li>
                        <li>Entre usuarios y conductores, compartiendo únicamente los datos de contacto necesarios, una vez realizado el pago de la micro-cuota de contacto, con el único propósito de permitir la comunicación directa.</li>
                    </ul>
                    <p className="mt-4 font-medium">
                        AvivaGo no vende, renta ni comercializa los datos personales de sus usuarios bajo ninguna circunstancia.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 6. COOKIES */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        6. USO DE COOKIES Y TECNOLOGÍAS SIMILARES
                    </h2>
                    <p className="mb-2">
                        Nuestro sitio web puede utilizar cookies, web beacons y tecnologías similares para mejorar la experiencia del usuario, analizar el uso de la plataforma y optimizar nuestros servicios.
                    </p>
                    <p className="mb-2">
                        El usuario puede deshabilitar el uso de cookies desde la configuración de su navegador; sin embargo, esto podría afectar algunas funcionalidades del sitio.
                    </p>
                    <p>
                        AvivaGo no es responsable por el tratamiento de datos personales realizado por plataformas de terceros utilizadas para pagos, mensajería o análisis, las cuales se rigen por sus propios avisos de privacidad.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 7. DERECHOS ARCO */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        7. DERECHOS ARCO (ACCESO, RECTIFICACIÓN, CANCELACIÓN Y OPOSICIÓN)
                    </h2>
                    <p className="mb-2">El titular tiene derecho a:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Acceder a sus datos personales</li>
                        <li>Rectificarlos cuando sean inexactos</li>
                        <li>Cancelarlos cuando considere que no se requieren para alguna de las finalidades señaladas</li>
                        <li>Oponerse al tratamiento de los mismos</li>
                    </ul>
                    <p className="mb-2">
                        Para ejercer estos derechos, deberá enviar una solicitud al correo <a href="mailto:privacidad@avivago.mx" className="text-[#2563EB] hover:underline">privacidad@avivago.mx</a>, incluyendo:
                    </p>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Nombre del titular</li>
                        <li>Documento que acredite su identidad</li>
                        <li>Descripción clara del derecho que desea ejercer</li>
                    </ol>
                </section>

                <hr className="border-gray-200" />

                {/* 8. CONSERVACIÓN */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        8. CONSERVACIÓN DE LOS DATOS
                    </h2>
                    <p>
                        Los datos personales serán conservados durante el tiempo que exista la relación con el titular y posteriormente por los plazos necesarios para cumplir con obligaciones legales y contractuales aplicables.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 9. SEGURIDAD */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        9. SEGURIDAD DE LOS DATOS
                    </h2>
                    <p>
                        AvivaGo implementa medidas de seguridad administrativas, técnicas y físicas, incluyendo el uso de protocolos de encriptación SSL/TLS, para proteger los datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 10. MENORES */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        10. DATOS DE MENORES DE EDAD
                    </h2>
                    <p>
                        AvivaGo no recaba intencionalmente datos personales de menores de edad. En caso de detectar información proporcionada por un menor sin el consentimiento de su tutor legal, dichos datos serán eliminados de forma inmediata.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 11. CAMBIOS */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        11. CAMBIOS AL AVISO DE PRIVACIDAD
                    </h2>
                    <p>
                        Cualquier modificación al presente aviso de privacidad será comunicada a través de nuestra plataforma web y/o al correo electrónico proporcionado por el titular.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 12. AUTORIDAD */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        12. AUTORIDAD COMPETENTE
                    </h2>
                    <p>
                        En caso de considerar que su derecho a la protección de datos personales ha sido vulnerado, el titular podrá acudir ante la autoridad competente en materia de protección de datos personales conforme a la legislación vigente.
                    </p>
                </section>

                <div className="pt-8 text-center text-sm text-gray-500">
                    Última actualización: enero de 2026.
                </div>
            </div>
        </>
    );
}
