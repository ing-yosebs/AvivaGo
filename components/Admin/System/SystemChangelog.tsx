'use client'

import { useState, useEffect } from 'react'
import { getSystemVersions, SystemVersion } from '@/app/actions/admin-system'
import { Info, Bug, Zap, Calendar, GitCommit } from 'lucide-react'

export function SystemChangelog() {
    const [versions, setVersions] = useState<SystemVersion[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchVersions = async () => {
        setIsLoading(true)
        const data = await getSystemVersions()
        setVersions(data)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchVersions()

        // Polling every 1 minute to check for new automated deployments
        const intervalId = setInterval(() => {
            getSystemVersions().then(setVersions)
        }, 60000)

        return () => clearInterval(intervalId)
    }, [])

    const getIcon = (type: string) => {
        switch (type) {
            case 'feature': return <Zap className="h-5 w-5 text-emerald-400" />
            case 'bugfix': return <Bug className="h-5 w-5 text-amber-400" />
            case 'hotfix': return <Info className="h-5 w-5 text-red-400" />
            default: return <GitCommit className="h-5 w-5 text-blue-400" />
        }
    }

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">Registro de Versiones</h3>
                    <p className="text-xs text-zinc-400">Automatizado con GitHub Deployments</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10 before:absolute border-t border-white/5 pt-6 before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
                {isLoading ? (
                    <div className="text-center text-zinc-500 py-8 animate-pulse">Consultando bitácora de versiones...</div>
                ) : versions.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8">Aún no hay versiones registradas. Las actualizaciones de GitHub aparecerán aquí.</div>
                ) : (
                    versions.map((ver, idx) => (
                        <div key={ver.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-black/80 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-emerald-400 z-10">
                                {getIcon(ver.type)}
                            </div>

                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg hover:bg-white/10 transition duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-white text-lg">{ver.version_tag}</span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{ver.type.toUpperCase()}</span>
                                </div>
                                <p className="text-sm text-zinc-300 whitespace-pre-line mb-3">{ver.changes_description}</p>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(ver.release_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                        </div>
                    ))
                )}
            </div>

            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        </div>
    )
}
