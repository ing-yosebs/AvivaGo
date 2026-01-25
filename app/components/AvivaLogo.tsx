import React from 'react';

export default function AvivaLogo({ className = "h-10 w-auto", showText = false }: { className?: string, showText?: boolean }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <img
                src="/images/logo.png"
                alt="AvivaGo Logo"
                className="h-full w-auto object-contain"
            />
            {showText && (
                <span className="text-xl font-display font-extrabold text-[#0F2137] tracking-tight">
                    AvivaGo
                </span>
            )}
        </div>
    );
}
