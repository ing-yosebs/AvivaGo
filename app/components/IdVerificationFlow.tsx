'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, ScanLine, FileText, Camera, User, Globe, Shield, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import * as faceapi from 'face-api.js';
import imageCompression from 'browser-image-compression';

interface VehicleInfo {
    make: string;
    model: string;
    year: string;
    color: string;
    plate: string;
}

interface VerificationResult {
    name: string;
    address: string;
    curp: string;
    claveElector?: string;
    passportNumber?: string;
    mrz?: string;
    birthDate: string;
    expirationDate?: string;
    nationality?: string;
    rawText: string;
}

const DOCUMENT_TYPES = [
    { id: 'ine', label: 'INE / IFE (México)', icon: '🇲🇽' },
    { id: 'passport', label: 'Pasaporte', icon: '🌍' },
    { id: 'national_id', label: 'Cédula de Identidad', icon: '🪪' }
];

export default function IdVerificationFlow() {
    // State for Wizard Steps
    const [step, setStep] = useState(1); // 1: Select Doc, 2: Selfie, 3: Upload ID, 4: Matching, 5: Result

    // Data State
    const [docType, setDocType] = useState('ine');
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [isUsingCameraForId, setIsUsingCameraForId] = useState(false);
    const [activeCapture, setActiveCapture] = useState<'selfie' | 'front' | 'back' | null>(null);

    // Processing State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matchScore, setMatchScore] = useState<number | null>(null);
    const [ocrResult, setOcrResult] = useState<VerificationResult | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Refs for FaceAPI
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load FaceAPI Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
                console.log('FaceAPI Models Loaded');
            } catch (err) {
                console.error('Error loading FaceAPI models', err);
                setError('Error cargando sistema biométrico. Recarga la página.');
            }
        };
        loadModels();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-start verification when entering step 4
    useEffect(() => {
        if (step === 4 && !isLoading && !error) {
            performVerification();
        }
    }, [step, isLoading, error]);

    // --- STEP Logic ---

    const handleSelfieCapture = async () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            const imageSrc = canvas.toDataURL('image/jpeg');

            if (activeCapture === 'selfie') {
                setSelfieImage(imageSrc);
                setStep(3);
                stopCamera();
            } else if (activeCapture === 'front') {
                setFrontImage(imageSrc);
                setIsUsingCameraForId(false);
                stopCamera();
            } else if (activeCapture === 'back') {
                setBackImage(imageSrc);
                setIsUsingCameraForId(false);
                stopCamera();
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setActiveCapture(null);
    };

    const startCamera = async (type: 'selfie' | 'front' | 'back') => {
        try {
            setActiveCapture(type);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: type === 'selfie' ? 'user' : 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error(err);
            setError('No pudimos acceder a la cámara.');
        }
    };

    // Auto-start camera when entering step 2
    useEffect(() => {
        if (step === 2 && modelsLoaded) {
            startCamera('selfie');
        }
    }, [step, modelsLoaded]);


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (file) {
            // Comprimir antes de procesar para evitar lag en el navegador y subida lenta
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1600,
                useWebWorker: true
            };

            try {
                const compressedFile = await imageCompression(file, options);
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (type === 'front') setFrontImage(reader.result as string);
                    else setBackImage(reader.result as string);
                };
                reader.readAsDataURL(compressedFile);
            } catch (err) {
                console.error("Error al comprimir identificación:", err);
                // Fallback a original si falla
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (type === 'front') setFrontImage(reader.result as string);
                    else setBackImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const performVerification = async () => {
        if (!selfieImage || !frontImage) return;

        setIsLoading(true);
        setError(null);
        setMatchScore(null);
        console.log('Starting verification process...');

        try {
            // 1. Face Matching (Client Side)
            console.log('Fetching images for face-api...');
            // Convert Base64 to HTMLImageElement
            const imgSelfie = await faceapi.fetchImage(selfieImage);
            const imgID = await faceapi.fetchImage(frontImage);
            console.log('Images fetched. Detecting faces...');

            // Detect Faces
            const selfieDetection = await faceapi.detectSingleFace(imgSelfie).withFaceLandmarks().withFaceDescriptor();
            const idDetection = await faceapi.detectSingleFace(imgID).withFaceLandmarks().withFaceDescriptor();
            console.log('Face detection complete.', { selfieDetection, idDetection });

            if (!selfieDetection || !idDetection) {
                throw new Error('No se detectó un rostro claro en alguna de las fotos. Intenta de nuevo.');
            }

            // Calculate Distance (Lower is better match)
            console.log('Calculating distance...');
            const distance = faceapi.euclideanDistance(selfieDetection.descriptor, idDetection.descriptor);
            console.log('Distance:', distance);
            const threshold = 0.6;
            const isMatch = distance < threshold;

            // Convert distance to a similarity score (approximate)
            const score = Math.max(0, 100 - (distance * 100)); // Simple conversion for display
            setMatchScore(score);

            if (!isMatch) {
                throw new Error(`Los rostros no coinciden (Similitud: ${score.toFixed(1)}%). Verificación fallida.`);
            }

            console.log('Face match successful. Sending to backend...');

            // 2. If Match, sending to Backend for OCR
            const response = await fetch('/api/verify-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: frontImage, // Sending front image for OCR
                    backImage: backImage, // Optional, depending on logic
                    documentType: docType
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error en OCR');

            setOcrResult(data.data);
            setStep(5); // Success Result Step

        } catch (err: any) {
            console.error('Verification error:', err);
            setError(err.message || 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!ocrResult) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/verify-id/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: ocrResult,
                    documentType: docType,
                    matchScore: matchScore,
                    frontImage: frontImage,
                    backImage: backImage,
                    selfieImage: selfieImage
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.error || 'Error al guardar datos';
                throw new Error(errorMessage);
            }

            setShowSuccessModal(true);

        } catch (err: any) {
            console.error('Save error:', err);
            setError(err.message || 'Error al persistir la información');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOcrChange = (field: keyof VerificationResult, value: string) => {
        if (ocrResult) {
            setOcrResult({ ...ocrResult, [field]: value });
        }
    };


    // --- RENDER STEPS ---

    // Step 1: Document Selection
    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h3 className="text-xl font-bold text-white">1. Elige tu identificación</h3>
            <div className="grid gap-4">
                {[
                    { id: 'ine', label: 'INE / IFE (México)', icon: FileText },
                    { id: 'passport', label: 'Pasaporte', icon: Shield },
                    { id: 'national_id', label: 'Cédula Ciudadana', icon: User }
                ].map((doc) => (
                    <button
                        key={doc.id}
                        onClick={() => { setDocType(doc.id); setStep(2); }}
                        className="group flex items-center justify-between p-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/50 rounded-2xl transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-purple-500/10 transition-colors">
                                <doc.icon className="h-6 w-6 text-purple-400" />
                            </div>
                            <span className="font-bold text-white">{doc.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-purple-400" />
                    </button>
                ))}
            </div>
            <p className="text-zinc-400 text-sm text-center">
                Asegúrate de tener tu documento físico a la mano.
            </p>
        </div>
    );

    // Step 2: Selfie
    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 text-center">
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">2. Validación Biométrica</h3>
                <p className="text-zinc-300 text-sm">Ubica tu rostro dentro del círculo con buena iluminación.</p>
            </div>

            <div className="relative mx-auto w-64 h-64 border-4 border-purple-500/30 rounded-full overflow-hidden bg-zinc-900 group">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                <div className="absolute inset-0 border-[16px] border-zinc-950/20 pointer-events-none rounded-full" />
            </div>

            <button
                onClick={handleSelfieCapture}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
                <Camera className="h-5 w-5" /> Capturar Selfie
            </button>
            <p className="text-[10px] text-zinc-400 italic">No te preocupes, no compartiremos esta foto. Solo es para validar.</p>
        </div>
    );

    // Step 3: Upload ID
    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h3 className="text-xl font-bold text-white">3. Sube tu Documento</h3>

            {isUsingCameraForId ? (
                <div className="space-y-4 text-center">
                    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border-2 border-purple-500">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSelfieCapture}
                            className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold"
                        >
                            Capturar {activeCapture === 'front' ? 'Frente' : 'Vuelta'}
                        </button>
                        <button
                            onClick={() => { stopCamera(); setIsUsingCameraForId(false); }}
                            className="px-6 py-3 bg-zinc-800 text-white rounded-xl"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Front */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-zinc-300">Frente del Documento</label>
                            <button
                                onClick={() => { setIsUsingCameraForId(true); startCamera('front'); }}
                                className="text-xs text-purple-400 font-bold flex items-center gap-1"
                            >
                                <Camera className="h-3 w-3" /> Usar Cámara
                            </button>
                        </div>
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative overflow-hidden h-40 flex items-center justify-center
                            ${frontImage ? 'border-green-500/50 bg-green-500/10' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/30'}
                        `}>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            {frontImage ? (
                                <Image src={frontImage} alt="Front ID" fill className="object-contain p-2" />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="h-6 w-6 text-zinc-400 mb-2" />
                                    <span className="text-zinc-500 text-sm">Toca para subir frente</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Back (Only for INE/ID) */}
                    {(docType === 'ine' || docType === 'national_id') && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-zinc-300">Reverso del Documento</label>
                                <button
                                    onClick={() => { setIsUsingCameraForId(true); startCamera('back'); }}
                                    className="text-xs text-purple-400 font-bold flex items-center gap-1"
                                >
                                    <Camera className="h-3 w-3" /> Usar Cámara
                                </button>
                            </div>
                            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative overflow-hidden h-40 flex items-center justify-center
                                ${backImage ? 'border-green-500/50 bg-green-500/10' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/30'}
                            `}>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {backImage ? (
                                    <Image src={backImage} alt="Back ID" fill className="object-contain p-2" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <ScanLine className="h-6 w-6 text-zinc-400 mb-2" />
                                        <span className="text-zinc-500 text-sm">Toca para subir reverso</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setStep(4)}
                        disabled={!frontImage}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        Continuar a Validación
                    </button>
                </>
            )}
        </div>
    );

    // Step 4: Verification (Processing)
    const renderStep4 = () => {


        return (
            <div className="flex flex-col items-center justify-center text-center py-12 animate-in fade-in">
                {isLoading ? (
                    <>
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
                            <Loader2 className="h-16 w-16 text-purple-500 animate-spin relative z-10" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Verificando Identidad...</h3>
                        <p className="text-zinc-400 text-sm">Estamos comparando tu selfie con tu identificación y leyendo tus datos.</p>
                    </>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-sm">
                        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-red-200 mb-2">Verificación Fallida</h3>
                        <p className="text-red-300 text-sm mb-6">{error}</p>
                        <button
                            onClick={() => { setError(null); setStep(2); setSelfieImage(null); }}
                            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl transition-colors font-bold"
                        >
                            Intentar de Nuevo
                        </button>
                    </div>
                ) : null}
            </div>
        );
    };

    // Step 5: Results
    const renderStep5 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl flex items-center gap-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div>
                    <h3 className="font-bold text-green-400 text-lg">Identidad Verificada</h3>
                    <p className="text-green-500/70 text-sm">Biometría Exitosa ({matchScore?.toFixed(0)}% Match)</p>
                </div>
            </div>

            <div className="border-t border-white/10 pt-6 text-center">
                <div className="bg-purple-500/5 p-6 rounded-2xl border border-purple-500/10 mb-6">
                    <FileText className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                    <h4 className="text-white font-bold mb-1">Información Procesada</h4>
                    <p className="text-zinc-400 text-sm mb-4">
                        Hemos extraído los siguientes datos de tu {docType === 'passport' ? 'Pasaporte' : 'identificación'}
                        para validar que no haya duplicidad.
                    </p>

                    {ocrResult && (
                        <div className="text-left space-y-2 bg-black/20 p-4 rounded-xl text-xs font-mono text-zinc-300">
                            <p className="truncate"><span className="text-zinc-500 font-bold block mb-1">NOMBRE:</span> {ocrResult.name}</p>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
                Confirmar y Guardar
            </button>
        </div>
    );


    return (
        <div className="w-full max-w-xl mx-auto p-1">
            {/* Progress Bar */}
            <div className="flex justify-between mb-8 px-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-1 flex-1 mx-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-purple-500' : 'bg-zinc-800'}`} />
                ))}
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <CheckCircle className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">¡Verificación Guardada!</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed">
                            Tu identidad ha sido validada y guardada correctamente. Tu perfil ahora cuenta con el sello de verificación.
                        </p>
                        <button
                            onClick={() => window.location.href = '/perfil'}
                            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all shadow-lg"
                        >
                            Volver al Perfil
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
