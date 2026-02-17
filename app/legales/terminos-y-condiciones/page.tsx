import React from 'react';

export default function TerminosCondicionesPage() {
    return (
        <>
            <h1 className="text-xl md:text-3xl font-bold text-center text-[#0F2137] mb-6 md:mb-8 border-b pb-4">
                TÉRMINOS Y CONDICIONES DE USO – AVIVAGO
            </h1>

            <div className="space-y-6 md:space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">

                {/* AVISO IMPORTANTE */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 md:p-6 rounded-r-lg">
                    <h2 className="text-lg font-bold text-amber-800 mb-2 uppercase">
                        AVISO IMPORTANTE: DEFINICIÓN DEL SERVICIO
                    </h2>
                    <p className="text-amber-900 font-medium">
                        AVIVAGO <strong>NO ES UNA EMPRESA DE TRANSPORTE</strong>, NI DE TAXIS, NI DE REDES DE TRANSPORTE (ERT). AVIVAGO ES UNA PLATAFORMA DIGITAL QUE FUNCIONA EXCLUSIVAMENTE COMO UN <strong>CATÁLOGO Y DIRECTORIO DE CONDUCTORES PRIVADOS</strong>.
                    </p>
                    <p className="text-amber-900 mt-2">
                        NOSOTROS NO PRESTAMOS SERVICIOS DE MOVILIDAD, LOGÍSTICA O TRANSPORTE. EL SERVICIO DE TRANSPORTE ES PRESTADO DIRECTA Y EXCLUSIVAMENTE POR EL CONDUCTOR, QUIEN ES UN TERCERO INDEPENDIENTE Y AJENO A AVIVAGO.
                    </p>
                </div>

                {/* 1. INTRODUCCIÓN */}
                <section>
                    <h2 className="text-lg md:text-xl font-semibold text-[#0F2137] mb-3 md:mb-4">
                        1. ACEPTACIÓN DE LOS TÉRMINOS
                    </h2>
                    <p>
                        Al registrarse, acceder o utilizar la plataforma AvivaGo (en adelante "La Plataforma"), usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, le rogamos no utilizar nuestros servicios.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 2. NATURALEZA DEL SERVICIO */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        2. NATURALEZA DE NUESTROS SERVICIOS
                    </h2>
                    <p className="mb-4">
                        AvivaGo opera bajo un modelo de Software as a Service (SaaS). Nuestra función se limita estrictamente a:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li>Proveer una plataforma digital donde los conductores pueden publicar sus perfiles y servicios.</li>
                        <li>Proporcionar a los usuarios una herramienta de búsqueda y conexión para encontrar conductores que se ajusten a sus necesidades específicas.</li>
                        <li>Facilitar el primer contacto entre el Usuario y el Conductor a través de herramientas de mensajería (WhatsApp).</li>
                    </ul>
                    <p className="font-semibold text-red-600">
                        AVIVAGO NO ES PARTE DE NINGÚN CONTRATO DE TRANSPORTE.
                    </p>
                    <p className="mt-2">
                        Todo acuerdo, contrato, viaje o servicio de transporte se celebra <strong>directa y exclusivamente entre el Usuario y el Conductor</strong>. AvivaGo no interviene en la fijación de tarifas de viaje, rutas, condiciones del vehículo ni en la ejecución misma del traslado.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 3. RESPONSABILIDAD */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        3. LIMITACIÓN DE RESPONSABILIDAD
                    </h2>
                    <p className="mb-4">
                        Dado que AvivaGo solo actúa como un intermediario tecnológico de conexión:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>No garantizamos</strong> la disponibilidad, puntualidad, calidad, seguridad o idoneidad de los servicios de transporte prestados por los Conductores.</li>
                        <li><strong>No somos responsables</strong> por daños, lesiones, pérdidas, accidentes, retrasos o cualquier inconveniente derivado de la prestación del servicio de transporte.</li>
                        <li><strong>No asumimos responsabilidad</strong> por la veracidad o exactitud de la información proporcionada por los Conductores en sus perfiles, aunque realizamos esfuerzos razonables para validar su identidad conforme a nuestros procesos internos.</li>
                    </ul>
                    <p className="mt-4">
                        El Usuario reconoce y acepta que todo riesgo derivado del uso de los servicios de transporte de los Conductores contactados a través de AvivaGo corre exclusivamente por su cuenta.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 4. RELACIÓN CON LOS CONDUCTORES */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        4. RELACIÓN CON LOS CONDUCTORES
                    </h2>
                    <p>
                        Los Conductores visibles en AvivaGo son <strong>suscriptores independientes</strong> de nuestra plataforma. No existe relación laboral, de subordinación, agencia o asociación entre AvivaGo y los Conductores.
                    </p>
                    <p className="mt-2">
                        Los Conductores son los únicos responsables de contar con las licencias, permisos, seguros y autorizaciones necesarias para prestar servicios de transporte conforme a la legislación local vigente.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 5. MODELO DE NEGOCIO */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        5. MODELO DE NEGOCIO Y GRATUIDAD PARA PASAJEROS
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-900">a) Para Pasajeros</h3>
                            <p>
                                El uso de la plataforma AvivaGo para buscar, filtrar y contactar conductores es <strong>totalmente gratuito</strong>. AvivaGo no cobra a los pasajeros por el acceso a la información de contacto ni comisiones por los viajes realizados.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">b) Para Conductores</h3>
                            <p>
                                AvivaGo opera bajo un modelo de suscripción para los conductores:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Membresía Premium:</strong> Los conductores pagan una tarifa periódica para obtener el distintivo de "Verificado", mayor visibilidad y herramientas avanzadas.</li>
                                <li><strong>Cuenta Gratuita:</strong> Los conductores pueden publicar un perfil básico sin costo, sujeto a limitaciones de visibilidad y características.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">c) Pagos de Viajes</h3>
                            <p>
                                El pago por los servicios de transporte se acuerda, procesa y realiza <strong>estricta y exclusivamente entre el Pasajero y el Conductor</strong>. AvivaGo no procesa pagos de viajes, no retiene fondos de pasajeros, ni emite facturas por servicios de transporte.
                            </p>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* 6. PRIVACIDAD Y CONSENTIMIENTO */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        6. PRIVACIDAD Y CONSENTIMIENTO EXPRESO DE CONTACTO
                    </h2>
                    <p>
                        Al utilizar la función &quot;Solicitar Cotización&quot;, &quot;Contactar por WhatsApp&quot; o cualquier herramienta similar dentro de la plataforma, el Usuario <strong>otorga su consentimiento expreso e inequívoco</strong> para que AvivaGo comparta sus datos de contacto (incluyendo, pero no limitado a: nombre, número telefónico y detalles del viaje solicitado) con el Conductor seleccionado.
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-2">Finalidad del Intercambio</h3>
                        <p className="text-blue-800 text-sm">
                            Este intercambio de información tiene como única y exclusiva finalidad permitir que el Conductor y el Usuario establezcan comunicación directa para negociar, coordinar y ejecutar el servicio de transporte.
                        </p>
                    </div>
                    <p className="mt-4">
                        El Usuario reconoce que, una vez compartidos sus datos con el Conductor, dichos datos quedan sujetos al manejo que el Conductor haga de ellos, deslindando a AvivaGo de cualquier responsabilidad por el uso indebido que un Conductor pudiera hacer fuera de la plataforma.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 6. CONDUCTA */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        6. CONDUCTA DEL USUARIO Y SANCIONES
                    </h2>
                    <p>
                        Los usuarios se comprometen a utilizar la plataforma de manera ética y respetuosa. AvivaGo se reserva el derecho de suspender o cancelar cuentas de usuarios o conductores que:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Hagan mal uso de la plataforma.</li>
                        <li>Proporcionen información falsa.</li>
                        <li>Violen la seguridad de la comunidad o actúen de manera ofensiva.</li>
                    </ul>
                </section>

                <hr className="border-gray-200" />

                {/* 7. MODIFICACIONES */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        7. MODIFICACIONES A LOS TÉRMINOS
                    </h2>
                    <p>
                        AvivaGo se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 8. LEY APLICABLE */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        8. LEGISLACIÓN APLICABLE Y JURISDICCIÓN
                    </h2>
                    <p>
                        Para la interpretación y cumplimiento de los presentes términos, las partes se someten a las leyes aplicables y a los tribunales competentes de la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
                    </p>
                </section>

                <div className="pt-8 text-center text-sm text-gray-500">
                    Última actualización: febrero de 2026.
                </div>
            </div>
        </>
    );
}
