'use client';

import { useState } from 'react';
import Header from './Header';
import DriverCard from './DriverCard';
import { MOCK_DRIVERS } from '../lib/mockData';

export default function DriverBrowser() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDrivers = MOCK_DRIVERS.filter(driver => {
        const term = searchTerm.toLowerCase();
        return (
            driver.name.toLowerCase().includes(term) ||
            driver.city.toLowerCase().includes(term) ||
            driver.area.toLowerCase().includes(term) ||
            driver.tags.some(tag => tag.toLowerCase().includes(term))
        );
    });


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
            />

            <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">

                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-aviva-text tracking-tight mb-2">
                            Conductores Profesionales
                        </h1>
                        <p className="text-lg text-gray-500">
                            Encuentra conductores verificados y contacta directamente.
                        </p>
                    </div>

                    {filteredDrivers.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            {filteredDrivers.map(driver => (
                                <DriverCard key={driver.id} driver={driver} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">No encontramos conductores que coincidan con tu búsqueda.</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-aviva-primary font-medium hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
