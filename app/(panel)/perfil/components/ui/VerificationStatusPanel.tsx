import { Shield, Clock, Info, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

interface VerificationStatusPanelProps {
    driverStatus?: string
    profile: any
    handleRequestReview: () => void
    submittingAppeal: boolean // renamed from purchasing for clarity in context, though logic used purchasing
}

export default function VerificationStatusPanel({ driverStatus, profile, handleRequestReview, submittingAppeal }: VerificationStatusPanelProps) {
    return (
        <div className="mt-8 pt-8 border-t border-indigo-100">
            <h4 className="font-bold text-[#0F2137] mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Estado de Verificación
            </h4>

            {driverStatus === 'active' ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold text-emerald-700">Cuenta Validada</p>
                        <p className="text-xs text-emerald-600/80">Ya puedes recibir solicitudes de pasajeros.</p>
                    </div>
                </div>
            ) : driverStatus === 'pending_approval' ? (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold text-orange-700">En Revisión</p>
                        <p className="text-xs text-orange-600/80">Estamos validando tu información. Te notificaremos pronto.</p>
                    </div>
                </div>
            ) : driverStatus === 'rejected' ? (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                            <Info className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-orange-700">Solicitud Rechazada</p>
                            <p className="text-xs text-orange-600/80 mt-1 mb-3">
                                Tu perfil no cumple con algunos requisitos. Por favor revisa la razón a continuación y corrige tu información.
                            </p>

                            {profile?.driver_profile?.rejection_reason && (
                                <div className="bg-white p-3 rounded-lg border border-orange-200 mb-2">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-1 tracking-wider">Motivo del staff:</p>
                                    <p className="text-sm text-gray-700 italic">"{profile.driver_profile.rejection_reason}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleRequestReview}
                        disabled={submittingAppeal}
                        className="w-full bg-[#0F2137] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#0F2137]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#0F2137]/20"
                    >
                        {submittingAppeal ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Shield className="h-4 w-4" />
                        )}
                        Solicitar Nueva Revisión
                    </button>
                </div>
            ) : driverStatus === 'suspended' ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-red-700">Cuenta Suspendida</p>
                            <p className="text-xs text-red-600/80 mt-1 mb-3">
                                Tu cuenta ha sido suspendida. Por favor revisa el motivo a continuación y contacta a soporte o solicita una revisión.
                            </p>

                            {profile?.driver_profile?.rejection_reason && (
                                <div className="bg-white p-3 rounded-lg border border-red-200 mb-2">
                                    <p className="text-[10px] font-bold text-red-600 uppercase mb-1 tracking-wider">Motivo de suspensión:</p>
                                    <p className="text-sm text-gray-700 italic">"{profile.driver_profile.rejection_reason}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleRequestReview}
                        disabled={submittingAppeal}
                        className="w-full bg-[#0F2137] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#0F2137]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#0F2137]/20"
                    >
                        {submittingAppeal ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Shield className="h-4 w-4" />
                        )}
                        Solicitar Revisión para Reactivación
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-gray-500 text-sm mb-4">
                        Para comenzar a operar, debes solicitar una revisión de tu perfil. Asegúrate de haber completado todos tus datos.
                    </p>
                    <button
                        onClick={handleRequestReview}
                        disabled={submittingAppeal}
                        className="w-full bg-[#0F2137] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#0F2137]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#0F2137]/20"
                    >
                        {submittingAppeal ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Shield className="h-4 w-4" />
                        )}
                        Solicitar Revisión
                    </button>
                </div>
            )}
        </div>
    )
}
