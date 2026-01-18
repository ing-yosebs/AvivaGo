import Link from 'next/link';
import { Driver } from '../lib/mockData';

// Icons
const StarIcon = () => (
    <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const VerifiedIcon = () => (
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
);

const LocationIcon = () => (
    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

interface DriverCardProps {
    driver: Driver;
}

export default function DriverCard({ driver }: DriverCardProps) {
    return (
        <Link
            href={`/driver/${driver.id}`}
            className="block bg-white rounded-xl border border-aviva-border shadow-soft overflow-hidden flex flex-col md:flex-row h-auto cursor-pointer hover:border-aviva-primary/30 transition-all duration-300 group"
        >
            {/* Visual Section */}
            <div className="relative h-60 md:h-auto md:w-[35%] shrink-0 overflow-hidden bg-gray-100">
                {/* Image placeholder since we can't use optimized next/image easily with external arbitrary urls without config */}
                <img
                    src={driver.photo}
                    alt={driver.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Verified Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-gray-100">
                    <div className="w-4 h-4 rounded-full bg-aviva-primary flex items-center justify-center">
                        <VerifiedIcon />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-aviva-primary">Verificado</span>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-aviva-text leading-tight group-hover:text-aviva-primary transition-colors">
                            {driver.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                            <StarIcon />
                            <span className="text-sm font-bold text-gray-800">{driver.rating}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 font-medium mb-3">
                        {driver.vehicle} • {driver.year}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                        <LocationIcon />
                        <span>
                            {driver.city} <span className="text-gray-300 mx-1">|</span> {driver.area}
                        </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {driver.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2.5 py-1 bg-aviva-tag text-gray-600 text-xs font-semibold rounded-md border border-gray-100/50 uppercase tracking-wide"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Section */}
                <div className="mt-auto">
                    <button className="w-full bg-white text-aviva-primary border border-aviva-border font-bold py-3.5 rounded-lg group-hover:bg-aviva-primary group-hover:text-white group-hover:border-aviva-primary transition-all text-sm tracking-wide shadow-sm">
                        Ver Perfil
                    </button>
                </div>
            </div>
        </Link>
    );
}
