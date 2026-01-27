import Link from 'next/link';
import { Rocket } from 'lucide-react';

export default function StickyCTA() {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden z-40 transition-all duration-300">
            <Link
                href="/register"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
            >
                <span>Empezar Ahora</span>
                <Rocket className="w-5 h-5" />
            </Link>
        </div>
    );
}
