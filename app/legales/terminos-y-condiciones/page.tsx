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
                        5. SOSTENIBILIDAD, RESPALDO INSTITUCIONAL Y MODELO DE NEGOCIO
                    </h2>
                    <div className="bg-emerald-50 p-4 md:p-6 rounded-lg mb-6 border border-emerald-100">
                        <h3 className="text-lg font-bold text-emerald-800 mb-2">
                            Proyecto Impulsado por Aviva Action Group
                        </h3>
                        <p className="text-emerald-900 mb-3">
                            La existencia de una versión gratuita completamente funcional para los conductores es posible gracias al apoyo y respaldo de <strong>Aviva Action Group</strong>, una fundación legalmente constituida y sin fines de lucro que impulsa y sostiene esta iniciativa.
                        </p>
                        <p className="text-emerald-900 mb-3">
                            Para mantener la plataforma operando, cubrir costos de servidores, seguir mejorando el sistema y escalar el proyecto, hemos introducido las <strong>Membresías Premium</strong>. Quienes deciden avanzar y adquirir una membresía, no solo reciben soporte técnico prioritario (premium) y funciones adicionales exclusivas, sino que ayudan de forma directa al financiamiento y viabilidad de AvivaGo para toda la comunidad.
                        </p>
                        <p className="text-emerald-900">
                            Adicionalmente, si cualquier individuo, conductor u organización desea apoyar activamente este esfuerzo en beneficio del gremio, <strong>los donativos son siempre bienvenidos</strong>.
                        </p>
                    </div>
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

                {/* 6. CONDICIONES DEL USO GRATUITO Y DERECHOS DE LA PLATAFORMA */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        6. CONDICIONES DEL USO GRATUITO Y DERECHOS DE LA PLATAFORMA
                    </h2>
                    <p className="mb-4">
                        AvivaGo ofrece acceso gratuito a ciertas funcionalidades tanto para pasajeros como para conductores. Al utilizar estas funcionalidades bajo la modalidad gratuita, usted reconoce y acepta expresamente lo siguiente:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Servicio &quot;Tal como está&quot;:</strong> Las funciones gratuitas se proporcionan &quot;tal cual&quot; y &quot;según disponibilidad&quot;. AvivaGo no garantiza que el servicio gratuito sea ininterrumpido, seguro o libre de errores.</li>
                        <li><strong>Derecho de Modificación y Terminación:</strong> AvivaGo se reserva el derecho absoluto y unilateral de modificar, suspender, limitar o eliminar parcial o totalmente el acceso gratuito en cualquier momento, con o sin previo aviso. Esto incluye, pero no se limita a, la transición de la plataforma hacia un modelo de acceso exclusivamente de pago, la reducción de los límites de uso o la eliminación de características gratuitas sin incurrir en responsabilidad alguna hacia el usuario.</li>
                        <li><strong>Inexistencia de Derechos Adquiridos:</strong> El uso continuo de la versión gratuita no otorga al usuario ningún derecho adquirido o de propiedad sobre el mantenimiento de la gratuidad, su perfil, la visibilidad de este o los datos albergados en la plataforma.</li>
                        <li><strong>Restricción de Acceso y Mal Uso:</strong> AvivaGo podrá restringir, suspender o cancelar permanentemente cualquier cuenta (gratuita o de pago) de forma inmediata si determina, a su entera discreción, que el usuario está realizando un mal uso de la plataforma, violando estos Términos, proporcionando información falsa, intentando evadir políticas de seguridad o afectando negativamente la experiencia y seguridad de la comunidad.</li>
                    </ul>
                </section>

                {/* 7. CIERRE DE LA PLATAFORMA Y RETENCIÓN DE DATOS */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        7. CIERRE DE LA PLATAFORMA Y RETENCIÓN DE DATOS
                    </h2>
                    <p className="mb-4">
                        Ante la eventualidad de que AvivaGo decida suspender definitivamente sus operaciones o cerrar la plataforma, se establecen las siguientes condiciones respecto a la información y datos de los usuarios:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><strong>Notificación:</strong> AvivaGo realizará esfuerzos comerciales razonables para notificar a los usuarios activos con anticipación antes del cierre definitivo de la plataforma.</li>
                        <li><strong>Inexistencia de Obligación de Respaldo:</strong> AvivaGo <strong>no está obligada</strong> a proporcionar a los conductores o pasajeros copias de la información de sus perfiles, historial de viajes, bases de datos de clientes, ni ningún otro dato generado durante el uso de la plataforma. Es responsabilidad exclusiva de cada usuario mantener sus propios registros y respaldos de su información.</li>
                        <li><strong>Eliminación de Datos:</strong> Al cierre de operaciones, AvivaGo procederá a la eliminación segura o anonimización de los datos personales e información de los perfiles en los servidores, de acuerdo con las leyes de protección de datos aplicables, eximiendo a la plataforma de cualquier reclamo por pérdida de información.</li>
                        <li><strong>Membresías Activas:</strong> En el caso de suscripciones o membresías premium activas al momento del cierre, estas se darán por terminadas automáticamente. AvivaGo no emitirá reembolsos prorrateados por periodos no utilizados tras el cierre definitivo del servicio.</li>
                    </ul>
                </section>

                <hr className="border-gray-200" />

                {/* 8. PRIVACIDAD Y CONSENTIMIENTO */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        8. PRIVACIDAD Y CONSENTIMIENTO EXPRESO DE CONTACTO
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

                {/* 9. CONDUCTA */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        9. CONDUCTA DEL USUARIO Y SANCIONES
                    </h2>
                    <p>
                        Los usuarios se comprometen a utilizar la plataforma de manera ética y respetuosa. AvivaGo se reserva el derecho absoluto de suspender, restingir o cancelar cuentas de usuarios o conductores de forma unilateral e inapelable que:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Hagan mal uso de la plataforma o intenten eludir nuestras restricciones tecnológicas.</li>
                        <li>Proporcionen información falsa, engañosa o suplanten identidades.</li>
                        <li>Violen la seguridad de la comunidad, utilicen lenguaje ofensivo, o acosen a otros usuarios/conductores.</li>
                        <li>Dañen la reputación de la plataforma de cualquier forma.</li>
                    </ul>
                </section>

                <hr className="border-gray-200" />

                {/* 10. OBLIGACIONES FISCALES */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        10. OBLIGACIONES FISCALES Y RETENCIÓN DE IMPUESTOS
                    </h2>
                    <p className="mb-4">
                        AvivaGo opera bajo estricto apego a las leyes fiscales vigentes en los Estados Unidos Mexicanos.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Impuestos Generados:</strong> Todos los ingresos, bonos y comisiones generados a través de nuestro programa de afiliados u otras actividades dentro de la plataforma causarán el pago de los impuestos correspondientes.</li>
                        <li><strong>Retenciones Legales:</strong> AvivaGo realizará la retención de los impuestos aplicables conforme a la Ley del Impuesto Sobre la Renta (ISR), la Ley del Impuesto al Valor Agregado (IVA) y las disposiciones relativas de la Resolución Miscelánea Fiscal vigente en México.</li>
                        <li><strong>Responsabilidad del Usuario:</strong> El usuario o afiliado es el único responsable de cumplir con sus obligaciones fiscales personales derivadas de los ingresos obtenidos a través de la plataforma, así como de proporcionar la información fiscal (como RFC y Constancia de Situación Fiscal) cuando se le sea requerida para efectos de facturación y retención.</li>
                    </ul>
                </section>

                <hr className="border-gray-200" />

                {/* 11. LEY APLICABLE */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        11. LEGISLACIÓN APLICABLE Y JURISDICCIÓN
                    </h2>
                    <p>
                        Para la interpretación y cumplimiento de los presentes términos, las partes se someten a las leyes aplicables en los Estados Unidos Mexicanos y a los tribunales competentes de la Ciudad de México, renunciando a cualquier otro fuero legal que pudiera corresponderles por razón de sus domicilios presentes o futuros.
                    </p>
                </section>

                <hr className="border-gray-200" />

                {/* 12. MODIFICACIONES */}
                <section>
                    <h2 className="text-xl font-semibold text-[#0F2137] mb-4">
                        12. MODIFICACIONES A LOS TÉRMINOS
                    </h2>
                    <p>
                        AvivaGo se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
                    </p>
                </section>

                <div className="pt-8 text-center text-sm text-gray-500">
                    Última actualización: febrero de 2026.
                </div>
            </div>
        </>
    );
}
