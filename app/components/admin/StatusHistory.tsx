import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, XCircle, AlertCircle, Clock, User, ArrowRight, Activity } from 'lucide-react'

interface StatusLog {
    id: string
    created_at: string
    previous_status: string | null
    new_status: string
    reason: string | null
    action_type: string
    actor: {
        full_name: string | null
        email: string | null
    }
}

export default function StatusHistory({ logs }: { logs: StatusLog[] }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500 italic border border-white/5 rounded-2xl bg-white/5">
                No hay historial de actividad registrado.
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-400'
            case 'rejected': return 'text-red-400'
            case 'suspended': return 'text-red-500'
            case 'pending_approval': return 'text-orange-400'
            default: return 'text-zinc-400'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Activo'
            case 'rejected': return 'Rechazado'
            case 'suspended': return 'Suspendido'
            case 'pending_approval': return 'En Revisión'
            case 'draft': return 'Borrador'
            case 'hidden': return 'Oculto'
            default: return status
        }
    }

    return (
        <div className="space-y-6">
            <div className="relative border-l border-white/10 ml-3 space-y-8 pl-8 py-2">
                {logs.map((log, index) => (
                    <div key={log.id} className="relative animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                        {/* Dot indicator */}
                        <div className={`absolute -left-[39px] top-1.5 h-5 w-5 rounded-full border-4 border-[#121212] ${log.action_type === 'driver_review_request' ? 'bg-blue-500' :
                                log.new_status === 'active' ? 'bg-emerald-500' :
                                    log.new_status === 'rejected' ? 'bg-red-500' :
                                        log.new_status === 'suspended' ? 'bg-red-600' : 'bg-zinc-500'
                            }`} />

                        <div className="flex flex-col gap-2">
                            {/* Header: Date & Actor */}
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <Clock className="h-3 w-3" />
                                <span>
                                    {format(new Date(log.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                                </span>
                                <span className="mx-1">•</span>
                                <User className="h-3 w-3" />
                                <span className="text-zinc-400 font-medium">
                                    {log.actor?.full_name || log.actor?.email || 'Usuario Desconocido'}
                                </span>
                            </div>

                            {/* Action Title */}
                            <div className="text-sm font-medium text-white flex items-center gap-2">
                                {log.action_type === 'driver_review_request' ? (
                                    <span className="text-blue-400 font-bold">Solicitó Revisión</span>
                                ) : (
                                    <>
                                        <span className={getStatusColor(log.previous_status || '')}>{getStatusLabel(log.previous_status || 'Start')}</span>
                                        <ArrowRight className="h-3 w-3 text-zinc-600" />
                                        <span className={`font-bold ${getStatusColor(log.new_status)}`}>{getStatusLabel(log.new_status)}</span>
                                    </>
                                )}
                            </div>

                            {/* Reason Content */}
                            {log.reason && (
                                <div className={`mt-1 p-3 rounded-xl border text-sm ${log.action_type === 'driver_review_request'
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-100'
                                        : 'bg-white/5 border-white/10 text-zinc-300'
                                    }`}>
                                    <p className="italic">"{log.reason}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
