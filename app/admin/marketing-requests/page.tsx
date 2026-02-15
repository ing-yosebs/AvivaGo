'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Clock, Filter } from 'lucide-react'
import { updateMarketingRequestStatus, type MarketingRequest, type AdminMarketingRequest } from '@/app/actions/user-requests'
import { useRouter } from 'next/navigation'
import MarketingRequestsTable from './components/MarketingRequestsTable'
import MarketingRequestEditModal from './components/MarketingRequestEditModal'

export default function AdminMarketingRequestsPage() {
    const [requests, setRequests] = useState<AdminMarketingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Modal State
    const [selectedRequest, setSelectedRequest] = useState<AdminMarketingRequest | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [shippingCost, setShippingCost] = useState('')
    const [adminNotes, setAdminNotes] = useState('')
    const [newStatus, setNewStatus] = useState<string>('')
    const [updating, setUpdating] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('marketing_kit_requests')
            .select(`
                *,
                driver_profiles (
                    id,
                    users (
                        full_name,
                        email,
                        phone_number
                    )
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching requests:', error)
        } else {
            setRequests(data as any)
        }
        setLoading(false)
    }

    const openEditModal = (req: AdminMarketingRequest) => {
        setSelectedRequest(req)
        setShippingCost(req.shipping_cost.toString())
        setAdminNotes(req.admin_notes || '')
        setNewStatus(req.status)
        setIsEditModalOpen(true)
    }

    const handleUpdate = async () => {
        if (!selectedRequest) return
        setUpdating(true)
        try {
            const cost = parseFloat(shippingCost)
            const result = await updateMarketingRequestStatus(
                selectedRequest.id,
                newStatus as any,
                isNaN(cost) ? 0 : cost,
                adminNotes
            )

            if (result.success) {
                setIsEditModalOpen(false)
                fetchRequests() // Refresh list
            } else {
                alert('Error al actualizar: ' + result.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error inesperado')
        } finally {
            setUpdating(false)
        }
    }

    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus
        const matchesSearch =
            req.driver_profiles.users.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.driver_profiles.users.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.id.includes(searchQuery)

        return matchesStatus && matchesSearch
    })

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#0F2137] tracking-tight">Solicitudes de Marketing</h1>
                    <p className="text-gray-500 mt-1">Gestiona los pedidos de kits impresos, cotizaciones y envíos.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={fetchRequests} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Clock className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F2137] outline-none text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                    {['all', 'pending_quote', 'quote_sent', 'paid', 'processing', 'shipped'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterStatus === status
                                ? 'bg-[#0F2137] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'Todos' : status.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <MarketingRequestsTable
                requests={filteredRequests}
                loading={loading}
                onEdit={openEditModal}
            />

            {/* Edit Modal */}
            {isEditModalOpen && (
                <MarketingRequestEditModal
                    request={selectedRequest}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={handleUpdate}
                    newStatus={newStatus}
                    setNewStatus={setNewStatus}
                    shippingCost={shippingCost}
                    setShippingCost={setShippingCost}
                    adminNotes={adminNotes}
                    setAdminNotes={setAdminNotes}
                    updating={updating}
                />
            )}
        </div>
    )
}
