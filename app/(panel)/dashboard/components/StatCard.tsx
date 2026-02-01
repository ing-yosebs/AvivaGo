import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
    icon: ReactNode
    label: string
    value: string | number
    change?: string
}

export function StatCard({ icon, label, value, change }: StatCardProps) {
    return (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 transition-all cursor-default">
            <div className="flex items-start justify-between mb-4">
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    {icon}
                </div>
                {change && (
                    <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                        {change}
                    </span>
                )}
            </div>
            <div>
                <p className="text-gray-500 text-sm mb-1">{label}</p>
                <h4 className="text-2xl font-bold text-[#0F2137]">{value}</h4>
            </div>
        </div>
    )
}
