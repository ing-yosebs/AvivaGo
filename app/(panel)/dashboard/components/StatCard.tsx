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
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-blue-100 transition-all cursor-default flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2.5 mb-3 w-full">
                <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100 shrink-0">
                    {icon}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium leading-tight">{label}</p>
            </div>
            <div className="flex items-baseline justify-center gap-2 w-full">
                <h4 className="text-xl sm:text-2xl font-bold text-[#0F2137]">{value}</h4>
                {change && (
                    <span className="text-[10px] sm:text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {change}
                    </span>
                )}
            </div>
        </div>
    )
}
