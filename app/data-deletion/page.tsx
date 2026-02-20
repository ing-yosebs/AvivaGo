import Link from 'next/link';

export const metadata = {
    title: 'Solicitud de Eliminación de Datos | AvivaGo',
    description: 'Instrucciones para solicitar la eliminación de tus datos personales de AvivaGo.',
};

export default function DataDeletionPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                        {/* Simple arrow icon using SVG to avoid dependencies */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Eliminación de Datos
                    </h1>
                </div>

                {/* Content */}
                <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-8 space-y-6">
                    <p className="text-gray-300 leading-relaxed">
                        En AvivaGo, respetamos tu privacidad y tus derechos sobre tus datos personales.
                        De acuerdo con las políticas de Meta y las leyes de protección de datos aplicables,
                        tienes derecho a solicitar la eliminación completa de tu información de nuestros servidores.
                    </p>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">¿Cómo solicitar la eliminación?</h2>
                        <p className="text-gray-300">
                            Para eliminar tu cuenta y todos los datos asociados, por favor sigue estos pasos:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                            <li>Envía un correo electrónico a <strong>contacto@avivago.mx</strong>.</li>
                            <li>Utiliza el asunto: <span className="text-white font-medium">"Solicitud de Baja de Datos - [Tu Número de Teléfono]"</span>.</li>
                            <li>En el cuerpo del mensaje, confirma que deseas eliminar tu cuenta permanentemente.</li>
                        </ol>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">¿Qué datos se eliminarán?</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                            <li>Tu perfil de usuario y número de teléfono.</li>
                            <li>Historial de cotizaciones y viajes (salvo aquellos requeridos por ley fiscal).</li>
                            <li>Documentos de identificación cargados.</li>
                            <li>Cualquier token de sesión activo.</li>
                        </ul>
                    </div>

                    <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-200 text-sm">
                            <strong>Nota importante:</strong> Una vez procesada la solicitud (en un plazo máximo de 72 horas),
                            la acción es irreversible y perderás acceso a tu historial y beneficios en AvivaGo.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-gray-500 text-sm mt-8">
                    &copy; {new Date().getFullYear()} AvivaGo. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
}
