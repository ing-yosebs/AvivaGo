"use client";

import React, { useState } from "react";
import {
    User,
    Car,
    CheckCircle,
    AlertCircle,
    Clock,
    Shield,
    Eye,
    EyeOff,
    UserCheck,
    UserX,
    FileText,
    MousePointerClick,
    Layers
} from "lucide-react";

type RoleType = "passenger" | "driver";

export default function UserStatusFlowPage() {
    const [activeRole, setActiveRole] = useState<RoleType>("passenger");

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        AvivaGo
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-medium text-zinc-300">
                        Arquitectura de Doble Validadción (Dual Baskets)
                    </h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-lg pt-4">
                        El sistema evalúa a los usuarios en dos "canastas" independientes para evitar cruces
                        entre los permisos básicos (Pasajeros) y los permisos operativos (Conductores).
                    </p>
                </div>

                {/* Global UI Example */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row items-center justify-center gap-6 group hover:border-white/20 transition-colors">
                    <Layers className="w-10 h-10 text-zinc-500 group-hover:text-white transition-colors" />
                    <div className="text-center md:text-left">
                        <h3 className="font-bold text-lg mb-1">Visualización en Tabla Admin</h3>
                        <p className="text-sm text-zinc-400 max-w-md">En el panel central de usuarios, un afiliado mostrará dos etiquetas apiladas para auditar su estricto estatus en ambas canastas simultáneamente.</p>
                    </div>
                    <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 items-center min-w-[150px]">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Validado</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pasajero</span>
                        <div className="w-full h-px bg-white/10 my-1" />
                        <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Rechazado</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Conductor</span>
                    </div>
                </div>

                {/* Role Selector */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setActiveRole("passenger")}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${activeRole === "passenger"
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105"
                            : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        <User className="w-6 h-6" />
                        <span className="text-lg">Flujo de Pasajero</span>
                    </button>
                    <button
                        onClick={() => setActiveRole("driver")}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${activeRole === "driver"
                            ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 scale-105"
                            : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        <Car className="w-6 h-6" />
                        <span className="text-lg">Flujo de Conductor</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    {activeRole === "passenger" ? <PassengerFlow /> : <DriverFlow />}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Passenger Information Component
// ----------------------------------------------------------------------------
function PassengerFlow() {
    return (
        <div className="space-y-12">
            {/* Overview */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group hover:border-blue-500/30 transition-colors">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-blue-400">
                    <User className="w-6 h-6" />
                    Generalidades (Cuenta Base)
                </h3>
                <p className="text-zinc-400 leading-relaxed text-lg">
                    Todo usuario que se da de alta en la plataforma forma parte primero de la canasta de Pasajeros.
                    Su validación ocurre de manera{" "}
                    <span className="text-white font-semibold">Automática y Dinámica</span>
                    , calculada al instante verificando la información en la base de datos.
                </p>
            </div>

            {/* State Cards */}
            <h3 className="text-2xl font-bold mb-6 text-center text-white/90">
                Niveles de Validación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StateCard
                    icon={<AlertCircle className="w-8 h-8 text-orange-400" />}
                    title="Email Pendiente"
                    color="orange"
                    internalState="unconfirmed"
                    description="Cuenta recién creada. Aún no verifica el enlace enviado a su correo electrónico."
                    restriction="Bloqueo Total del Sistema."
                />
                <StateCard
                    icon={<Clock className="w-8 h-8 text-blue-400" />}
                    title="Incompleto"
                    color="blue"
                    internalState="incomplete"
                    description="Le falta especificar su Nombre, Teléfono o Correo formalmente en los registros."
                    restriction="Bloqueo Parcial (No puede pedir viajes)."
                />
                <StateCard
                    icon={<CheckCircle className="w-8 h-8 text-emerald-400" />}
                    title="Validado"
                    color="emerald"
                    internalState="validated"
                    description="El usuario tiene toda su identidad de contacto base capturada firmemente."
                    restriction="Luz verde para usar la app como Pasajero."
                />
            </div>

            {/* Visual Diagram */}
            <div className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-8 text-center text-blue-200">
                    Diagrama de Flujo (Pasajeros)
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                    <DiagramNode text="Registro" />
                    <DiagramArrow text="Confirma Email" />
                    <DiagramNode text="Incompleto" />
                    <DiagramArrow text="Sube Datos Restantes" />
                    <DiagramNode text="Validado" isSuccess />
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Driver Information Component
// ----------------------------------------------------------------------------
function DriverFlow() {
    return (
        <div className="space-y-12">
            {/* Overview */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group hover:border-emerald-500/30 transition-colors">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-emerald-400">
                    <Shield className="w-6 h-6" />
                    Proceso Administrativo de Conductores
                </h3>
                <p className="text-zinc-400 leading-relaxed text-lg mb-4">
                    La Canasta de Conductor (`driver_profiles`) opera estrictamente por separado. Ningún pasajero
                    obtiene privilegios de conductor de forma automática. Al iniciar su solicitud o enviar datos,
                    su perfil entra en modo <code className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded text-sm">Draft</code> obligatorio.
                </p>
            </div>

            {/* State Cards Grid */}
            <h3 className="text-2xl font-bold mb-6 text-center text-white/90">
                Ciclo de Vida de Conductor (Socio)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StateCard
                    icon={<FileText className="w-8 h-8 text-zinc-400" />}
                    title="Borrador"
                    color="zinc"
                    internalState="draft"
                    description="Apenas está recabando sus documentos o acaba de oprimir Ser Conductor."
                    restriction="No visible en el sistema operativo."
                />
                <StateCard
                    icon={<Clock className="w-8 h-8 text-orange-400" />}
                    title="En Revisión"
                    color="orange"
                    internalState="pending_approval"
                    description="A la espera de que el administrador audite y verifique papeles."
                    restriction="Bajo revisión estricta del equipo."
                />
                <StateCard
                    icon={<CheckCircle className="w-8 h-8 text-emerald-400" />}
                    title="Validado"
                    color="emerald"
                    internalState="active"
                    description="Documentos aprobados. Perfil activo operativamente en la plataforma."
                    restriction="Apto para trabajar libremente."
                />
                <StateCard
                    icon={<UserX className="w-8 h-8 text-red-400" />}
                    title="Rechazado"
                    color="red"
                    internalState="rejected"
                    description="Un documento es inválido o ilegible. El usuario fue notificado del motivo."
                    restriction="Requiere corrección y reenvío."
                />
                <StateCard
                    icon={<AlertCircle className="w-8 h-8 text-rose-600" />}
                    title="Suspendido"
                    color="rose"
                    internalState="suspended"
                    description="Cuenta inhabilitada por reglas, política o seguro expirado."
                    restriction="Permisos de conductor revocados."
                />
            </div>

            {/* Tools Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Admin Actions */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                        <MousePointerClick className="w-5 h-5 text-emerald-400" />
                        Herramientas del Administrador
                    </h4>
                    <div className="space-y-4">
                        <div className="border border-emerald-100 bg-emerald-50 rounded-2xl p-4 flex gap-4">
                            <div className="h-10 w-10 shrink-0 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-emerald-800">Validado (Auto-Gestión)</h4>
                                <p className="text-sm text-emerald-700/80">Estado de inicio automático. El conductor nace "Activo" y visible para que pueda compartir de inmediato su propio código QR y link directo a pasajeros conocidos (Modelo Free). El buscador global lo seguirá bloqueando hasta que adquiera membresía VIP.</p>
                            </div>
                        </div>

                        <div className="border border-gray-100 bg-gray-50 rounded-2xl p-4 flex gap-4">
                            <div className="h-10 w-10 shrink-0 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                <div className="h-2 w-2 rounded-full bg-gray-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-700">Borrador</h4>
                                <p className="text-sm text-gray-500">Estado de pausa cuando un conductor no ha terminado de llenar o subir documentos requeridos para ascensos de cuenta.</p>
                            </div>
                        </div>

                        <div className="border border-orange-100 bg-orange-50 rounded-2xl p-4 flex gap-4">
                            <div className="h-10 w-10 shrink-0 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-800">En Revisión</h4>
                                <p className="text-sm text-orange-700/80">Para conductores que han solicitado de forma proactiva una revisión humana (ej. por bloqueos o suscripciones preferentes).</p>
                            </div>
                        </div>

                        <div className="border border-red-100 bg-red-50 rounded-2xl p-4 flex gap-4">
                            <div className="h-10 w-10 shrink-0 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                <UserX className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-800">Rechazado / Suspendido</h4>
                                <p className="text-sm text-red-700/80">Aplicado por el Administrador. <strong>Atención:</strong> Suspender a un conductor automáticamente apagará su perfil público, inactivando también su propio código QR y Link directo de inmediato por protección.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Diagram Driver */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/20 rounded-3xl p-8 overflow-x-auto">
                <h3 className="text-xl font-bold mb-8 text-center text-emerald-200">
                    Diagrama de Flujo (Conductores)
                </h3>
                <div className="flex flex-col items-center justify-center min-w-max pb-8">
                    <div className="flex items-center gap-4">
                        <DiagramNode text="Validado / Visible" isSuccess />
                        <DiagramArrow text="Modelo Free" color="emerald" />
                        <DiagramNode text="Draft" />
                        <DiagramArrow text="Sustenta Docs" />
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-0 pointer-events-none" />
                            <DiagramNode text="Pending Approval" isActionLayer />
                        </div>

                        <DiagramArrow text="Firma el Admin" color="emerald" />
                        <DiagramNode text="Active" isSuccess />
                    </div>

                    <div className="flex gap-24 mt-2 -ml-32">
                        <div className="flex flex-col items-center">
                            <div className="h-10 w-0.5 bg-red-500/50 mb-2" />
                            <DiagramNode text="Rejected" color="red" isSmall />
                            <span className="text-xs text-zinc-500 mt-2 text-center w-24">Admin encuentra Errores</span>
                        </div>

                        <div className="flex flex-col items-center ml-48">
                            <div className="h-10 w-0.5 bg-rose-500/50 mb-2" />
                            <DiagramNode text="Suspended" color="rose" isSmall />
                            <span className="text-xs text-zinc-500 mt-2 text-center w-24">Suspensión Administrativa</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

// ----------------------------------------------------------------------------
// Shared Diagram Components
// ----------------------------------------------------------------------------
function StateCard({
    title,
    description,
    restriction,
    icon,
    color,
    internalState,
    isSmall = false
}: {
    title: string;
    description: string;
    restriction: string;
    icon: React.ReactNode;
    color: "blue" | "emerald" | "orange" | "zinc" | "red" | "rose";
    internalState: string;
    isSmall?: boolean;
}) {
    const colorMap = {
        blue: "bg-blue-500/10 border-blue-500/20",
        emerald: "bg-emerald-500/10 border-emerald-500/20",
        orange: "bg-orange-500/10 border-orange-500/20",
        zinc: "bg-zinc-500/10 border-zinc-500/20",
        red: "bg-red-500/10 border-red-500/20",
        rose: "bg-rose-500/10 border-rose-500/20"
    };

    const textMap = {
        blue: "text-blue-200",
        emerald: "text-emerald-200",
        orange: "text-orange-200",
        zinc: "text-zinc-200",
        red: "text-red-200",
        rose: "text-rose-200"
    };

    return (
        <div
            className={`relative overflow-hidden border rounded-3xl p-6 hover:-translate-y-1 transition-transform duration-300 ${colorMap[color]
                } ${isSmall ? "p-4 h-full" : ""}`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">{icon}</div>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-black/20 rounded-xl">{icon}</div>
                    <div>
                        <h4 className={`font-bold ${isSmall ? "text-lg" : "text-xl"} ${textMap[color]}`}>
                            {title}
                        </h4>
                        <code className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                            {internalState}
                        </code>
                    </div>
                </div>
                <p className={`text-zinc-300 ${isSmall ? "text-xs" : "text-sm"} mb-4 flex-grow`}>
                    {description}
                </p>
                <div className="mt-auto pt-4 border-t border-black/10">
                    <p className="text-xs text-zinc-400 flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{restriction}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

function DiagramNode({
    text,
    isSuccess = false,
    isActionLayer = false,
    color = "blue",
    isSmall = false
}: {
    text: string;
    isSuccess?: boolean;
    isActionLayer?: boolean;
    color?: string;
    isSmall?: boolean;
}) {
    return (
        <div
            className={`relative z-10 flex items-center justify-center font-bold text-center border-2 shadow-xl whitespace-nowrap
        ${isSmall ? 'rounded-xl px-4 py-2 text-sm' : 'rounded-2xl px-6 py-4'}
        ${isSuccess
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-emerald-500/20"
                    : isActionLayer
                        ? "bg-orange-500/20 border-orange-500 border-dashed text-orange-400 shadow-orange-500/20 animate-pulse-subtle"
                        : color === 'red' ? "bg-red-500/20 border-red-500/50 text-red-400"
                            : color === 'rose' ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                                : "bg-black border-zinc-700 text-zinc-300"
                }
    `}
        >
            {text}
        </div>
    );
}

function DiagramArrow({
    text,
    color = "zinc"
}: {
    text: string;
    color?: "emerald" | "zinc";
}) {
    return (
        <div className="flex flex-col items-center px-4 w-32 md:w-40 relative">
            <div className={`h-[2px] w-full ${color === "emerald" ? "bg-emerald-500/50" : "bg-zinc-700"}`} />
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-l-[8px] border-transparent ${color === "emerald" ? "border-l-emerald-500/50" : "border-l-zinc-700"} `} />
            {text && (
                <span className="absolute -top-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-black/50 px-2 rounded-full whitespace-nowrap">
                    {text}
                </span>
            )}
        </div>
    );
}
