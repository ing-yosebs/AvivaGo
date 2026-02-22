
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, FileText, ExternalLink } from 'lucide-react';

interface PersonalDocsProps {
    idDocumentSignedUrl: string | null;
    idDocumentBackSignedUrl: string | null;
    verificationSelfieSignedUrl: string | null;
    addressProofSignedUrl: string | null;
}

export default function PersonalDocs({
    idDocumentSignedUrl,
    idDocumentBackSignedUrl,
    verificationSelfieSignedUrl,
    addressProofSignedUrl
}: PersonalDocsProps) {
    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-blue-400" />
                Documentos Personales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Official ID - Front */}
                <div className="space-y-3">
                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Identificación (Frente)</label>
                    {idDocumentSignedUrl ? (
                        <Link href={idDocumentSignedUrl} target="_blank" className="block group relative aspect-[1.6/1] bg-black/40 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all shadow-lg active:scale-[0.98]">
                            {idDocumentSignedUrl.toLowerCase().includes('.pdf') ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                                    <FileText className="h-10 w-10 mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Documento PDF</span>
                                </div>
                            ) : (
                                <Image
                                    src={idDocumentSignedUrl}
                                    alt="ID Frente"
                                    fill
                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform hidden sm:block">
                                <span className="text-[10px] text-white font-bold uppercase block text-center">Abrir documento</span>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 sm:hidden">
                                <ExternalLink className="h-4 w-4 text-white" />
                            </div>
                        </Link>
                    ) : (
                        <div className="aspect-[1.6/1] bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic">
                            No adjuntada
                        </div>
                    )}
                </div>

                {/* Official ID - Back */}
                <div className="space-y-3">
                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Identificación (Reverso)</label>
                    {idDocumentBackSignedUrl ? (
                        <Link href={idDocumentBackSignedUrl} target="_blank" className="block group relative aspect-[1.6/1] bg-black/40 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all shadow-lg active:scale-[0.98]">
                            {idDocumentBackSignedUrl.toLowerCase().includes('.pdf') ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                                    <FileText className="h-10 w-10 mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Documento PDF</span>
                                </div>
                            ) : (
                                <Image
                                    src={idDocumentBackSignedUrl}
                                    alt="ID Reverso"
                                    fill
                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform hidden sm:block">
                                <span className="text-[10px] text-white font-bold uppercase block text-center">Abrir documento</span>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 sm:hidden">
                                <ExternalLink className="h-4 w-4 text-white" />
                            </div>
                        </Link>
                    ) : (
                        <div className="aspect-[1.6/1] bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic">
                            No adjuntada
                        </div>
                    )}
                </div>

                {/* Selfie Verification */}
                <div className="space-y-3">
                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Selfie de Validación</label>
                    {verificationSelfieSignedUrl ? (
                        <Link href={verificationSelfieSignedUrl} target="_blank" className="block group relative aspect-[1.6/1] bg-black/40 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all shadow-lg active:scale-[0.98]">
                            <Image
                                src={verificationSelfieSignedUrl}
                                alt="Selfie"
                                fill
                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform hidden sm:block">
                                <span className="text-[10px] text-white font-bold uppercase block text-center">Abrir foto</span>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 sm:hidden">
                                <ExternalLink className="h-4 w-4 text-white" />
                            </div>
                        </Link>
                    ) : (
                        <div className="aspect-[1.6/1] bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic">
                            No realizada
                        </div>
                    )}
                </div>

                {/* Proof of Address */}
                <div className="space-y-3">
                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Comprobante Domicilio</label>
                    {addressProofSignedUrl ? (
                        <Link href={addressProofSignedUrl} target="_blank" className="block group relative aspect-[1.6/1] bg-black/40 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all shadow-lg active:scale-[0.98]">
                            {addressProofSignedUrl.toLowerCase().includes('.pdf') ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                                    <FileText className="h-10 w-10 mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Documento PDF</span>
                                </div>
                            ) : (
                                <Image
                                    src={addressProofSignedUrl}
                                    alt="Comprobante"
                                    fill
                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform hidden sm:block">
                                <span className="text-[10px] text-white font-bold uppercase block text-center">Abrir documento</span>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 sm:hidden">
                                <ExternalLink className="h-4 w-4 text-white" />
                            </div>
                        </Link>
                    ) : (
                        <div className="aspect-[1.6/1] bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic">
                            No adjuntado
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
