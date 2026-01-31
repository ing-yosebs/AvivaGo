'use client';

import { useEffect, useState } from 'react';
import { getValidatedUserCount } from '@/app/actions/user-stats';
import { Users } from 'lucide-react';

export default function ValidatedUserCounter() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        getValidatedUserCount().then(val => setCount(val ?? 0));
    }, []);

    if (count === null) return null;

    return (
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-blue-100 text-sm font-medium text-gray-600 animate-in fade-in zoom-in duration-500 mt-6">
            <div className="p-1.5 bg-blue-100 rounded-full">
                <Users className="h-3.5 w-3.5 text-aviva-primary" />
            </div>
            <span>
                <span className="font-bold text-gray-900">{count.toLocaleString()}</span> usuarios verificados
            </span>
        </div>
    );
}
