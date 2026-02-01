import { ReactNode } from 'react'

interface ActivityItemProps {
    icon: ReactNode
    text: string
    time: string
}

export function ActivityItem({ icon, text, time }: ActivityItemProps) {
    return (
        <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 text-blue-600">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium">{text}</p>
                <p className="text-xs text-gray-400">{time}</p>
            </div>
        </div>
    )
}
