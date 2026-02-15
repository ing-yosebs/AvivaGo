import React from 'react'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { type MarketingRequest, type AdminMarketingRequest } from '@/app/actions/user-requests'

interface MarketingRequestsTableProps {
    requests: AdminMarketingRequest[]
    loading: boolean
    onEdit: (req: AdminMarketingRequest) => void
}

export default function MarketingRequestsTable({ requests, loading, onEdit }: MarketingRequestsTableProps) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending_quote': return 'bg-yellow-100 text-yellow-800'
            case 'quote_sent': return 'bg-blue-100 text-blue-800'
            case 'paid': return 'bg-emerald-100 text-emerald-800'
            case 'processing': return 'bg-purple-100 text-purple-800'
            case 'shipped': return 'bg-indigo-100 text-indigo-800'
            case 'delivered': return 'bg-gray-100 text-gray-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Conductor</th>
                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Costo Envío</th>
                            <th className="text-right py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500">Cargando solicitudes...</td>
                            </tr>
                        ) : requests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500">No se encontraron solicitudes.</td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#0F2137]">{req.driver_profiles.users.full_name}</span>
                                            <span className="text-xs text-gray-500">{req.driver_profiles.users.email}</span>
                                            <Link href={`/driver/${req.driver_profile_id}`} target="_blank" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                Ver Perfil <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(req.status)}`}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600">
                                        {new Date(req.created_at).toLocaleDateString()}
                                        <span className="block text-[10px] text-gray-400">{new Date(req.created_at).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-[#0F2137]">
                                        ${req.shipping_cost} {req.currency}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => onEdit(req)}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                        >
                                            Gestionar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
