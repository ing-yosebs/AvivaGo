import React from 'react';
import LandingHeader from '@/app/components/marketing/v1/Navbar';
import TrustFooter from '@/app/components/marketing/v1/TrustFooter';

export default function LegalesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <LandingHeader />

            <main className="flex-grow pt-20 md:pt-24 pb-8 md:pb-12 px-2 md:px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Content */}
                    <div className="bg-white shadow-lg rounded-xl md:rounded-2xl p-4 md:p-12">
                        {children}
                    </div>
                </div>
            </main>

            <TrustFooter />
        </div>
    );
}
