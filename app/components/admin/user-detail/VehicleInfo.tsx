
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Car, FileText } from 'lucide-react';

interface VehicleInfoProps {
    vehicle: any;
    vehicleDocs: any;
}

export default function VehicleInfo({ vehicle, vehicleDocs }: VehicleInfoProps) {
    if (!vehicle) return null;

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                <Car className="h-5 w-5 text-emerald-400" />
                Información del Vehículo
            </h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Marca y Modelo</label>
                        <p className="text-white font-bold text-lg">{vehicle.brand} {vehicle.model}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Año y Color</label>
                        <p className="text-white font-medium">{vehicle.year} — {vehicle.color}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Placas</label>
                        <p className="text-white font-mono font-bold text-lg bg-black/40 px-3 py-1 rounded-lg border border-white/10 inline-block">
                            {vehicle.plate_number || 'N/A'}
                        </p>
                    </div>
                </div>

                {vehicle.vin_number && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Número de Serie (VIN)</label>
                        <p className="text-white font-mono text-sm tracking-wider">
                            {vehicle.vin_number}
                        </p>
                    </div>
                )}

                {/* Vehicle Documents for Admin Verification */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center sm:text-left">Expediente del Vehículo</h4>
                    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                        {[
                            { label: 'Placa', url: vehicleDocs?.plate },
                            { label: 'Circulación', url: vehicleDocs?.circulation },
                            { label: 'Verificación', url: vehicleDocs?.verification },
                            { label: 'NIV (VIN)', url: vehicleDocs?.vin },
                            { label: 'Factura', url: vehicleDocs?.invoice },
                            { label: 'Seguro', url: vehicleDocs?.insurance },
                        ].map((doc, i) => doc.url ? (
                            <Link key={i} href={doc.url} target="_blank" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 sm:p-3 transition-all flex flex-col items-center justify-center gap-1 sm:gap-2 group hover:scale-105 active:scale-95 shadow-lg">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                                <span className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase tracking-tight text-center truncate w-full">{doc.label}</span>
                            </Link>
                        ) : null)}
                    </div>

                    {/* Vehicle Photos */}
                    {vehicleDocs?.photos && vehicleDocs.photos.length > 0 && (
                        <div className="pt-4">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 text-center sm:text-left">Galería de Fotos</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                                {vehicleDocs.photos.map((url: string, i: number) => (
                                    <Link key={i} href={url} target="_blank" className="relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all hover:scale-105 active:scale-95 group shadow-xl">
                                        <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 hidden sm:block">
                                            <span className="text-[8px] text-white font-bold uppercase">Foto {i + 1}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
