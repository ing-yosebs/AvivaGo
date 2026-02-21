'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, ScanLine, FileText } from 'lucide-react';
import Image from 'next/image';

interface VerificationResult {
    name: string;
    address: string;
    curp: string;
    birthDate: string;
}

export default function IdVerification() {
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rawText, setRawText] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVerify = async () => {
        if (!image) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/verify-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error verifying ID');
            }

            setResult(data.data);
            setRawText(data.rawText);  // Optional: for debugging/showing user
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-zinc-900/50 border border-white/10 rounded-3xl backdrop-blur-xl">
            <div className="text-center mb-8">
                <div className="inline-flex bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20 mb-4">
                    <ScanLine className="h-8 w-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verificación de Identidad</h2>
                <p className="text-zinc-400">Sube una foto clara de tu INE/IFE para verificar tus datos automáticamente.</p>
            </div>

            <div className="space-y-6">
                {/* Upload Section */}
                <div className="relative group">
                    <div className={`
                        border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                        ${image ? 'border-purple-500/50 bg-purple-500/5' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/50 hover:bg-zinc-800'}
                    `}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {image ? (
                            <div className="relative h-64 w-full">
                                <Image
                                    src={image}
                                    alt="ID Preview"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <Upload className="h-5 w-5" />
                                        Cambiar Imagen
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <div className="p-4 bg-zinc-800 rounded-full group-hover:scale-110 transition-transform">
                                    <Upload className="h-8 w-8 text-zinc-400 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-zinc-300">Sube tu INE/IFE</p>
                                    <p className="text-sm text-zinc-500 mt-1">PNG, JPG hasta 5MB</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={!image || isLoading}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-5 w-5" />
                            Verificar Documento
                        </>
                    )}
                </button>

                {/* Results Section */}
                {result && (
                    <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-green-400" />
                            Datos Extraídos
                        </h3>

                        <div className="grid gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Nombre</label>
                                <p className="text-white font-medium">{result.name || 'No detectado'}</p>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Dirección</label>
                                <p className="text-zinc-300 text-sm">{result.address || 'No detectada'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">CURP</label>
                                    <p className="text-white font-mono text-sm">{result.curp || 'No detectada'}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Fecha Nacimiento</label>
                                    <p className="text-white text-sm">{result.birthDate || 'No detectada'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl transition-colors">
                                Confirmar Datos
                            </button>
                            <button
                                onClick={() => setResult(null)}
                                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
