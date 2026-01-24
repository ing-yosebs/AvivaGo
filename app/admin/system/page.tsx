
import { Activity, Server, Database, CheckCircle, Clock } from 'lucide-react'

// Mock System Logs
const systemLogs = [
    { id: 1, event: 'System Backup Completed', status: 'success', time: '2 hours ago' },
    { id: 2, event: 'Database Optimization', status: 'success', time: '5 hours ago' },
    { id: 3, event: 'New Deployment (v1.2.0)', status: 'success', time: '1 day ago' },
]

export default function SystemPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Estado del Sistema</h1>
                <p className="text-zinc-400">Monitoreo técnico y registros de actividad.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Health Cards */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Server className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Servidor API</p>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-bold">Online</span>
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Database className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Base de Datos</p>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-bold">Healthy</span>
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Activity className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Tiempo de Actividad</p>
                            <p className="text-xl font-bold text-white">99.9%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Logs */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-6">Bitácora del Sistema</h3>
                <div className="space-y-4">
                    {systemLogs.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <span className="text-white font-medium">{log.event}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                <Clock className="h-4 w-4" />
                                {log.time}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
