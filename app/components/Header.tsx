import Link from 'next/link';
import { ChangeEvent } from 'react';

// Icons
const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
);

const FilterIcon = () => (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
    </svg>
);

interface HeaderProps {
    searchTerm: string;
    onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ searchTerm, onSearchChange }: HeaderProps) {
    return (
        <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-aviva-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xl font-bold tracking-tight text-aviva-primary">AvivaGo</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl px-2 lg:px-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={onSearchChange}
                                className="block w-full pl-10 pr-10 py-2.5 border border-aviva-border rounded-xl leading-5 bg-gray-50 text-aviva-text placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-aviva-primary focus:border-aviva-primary sm:text-sm transition-colors"
                                placeholder="Buscar conductor, ruta o ciudad..."
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button className="p-1 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                                    <FilterIcon />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Nav actions */}
                    <nav className="hidden md:flex items-center gap-4 flex-shrink-0">
                        <Link href="/driver/onboarding" className="text-sm font-medium text-gray-500 hover:text-aviva-primary transition-colors">
                            Soy Conductor
                        </Link>
                        <Link href="/auth/login" className="bg-aviva-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-aviva-primaryHover transition-colors shadow-sm">
                            Entrar
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
