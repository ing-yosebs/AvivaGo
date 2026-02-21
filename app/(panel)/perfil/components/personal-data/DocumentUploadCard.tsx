import { useRef } from 'react'
import { Plus, Loader2, FileText, Camera, CheckCircle2, Shield } from 'lucide-react'

interface DocumentUploadCardProps {
    label: string
    url?: string
    signedUrl?: string | null
    uploading: boolean
    verified?: boolean
    onUpload: (file: File) => void
    previewText?: string
    accept?: string
}

export function DocumentUploadCard({
    label,
    url,
    signedUrl,
    uploading,
    verified,
    onUpload,
    previewText = "Subir Documento",
    accept = "image/*,application/pdf"
}: DocumentUploadCardProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onUpload(file)
        }
    }

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-500">{label}</label>
            {!verified && (
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />
            )}
            <div
                onClick={() => !verified && inputRef.current?.click()}
                className={`${verified ? 'cursor-default' : 'cursor-pointer hover:border-blue-500 group'} relative aspect-video w-full rounded-xl overflow-hidden border border-dashed transition-all bg-gray-50 flex flex-col items-center justify-center ${url ? 'border-emerald-500/30' : 'border-gray-200'}`}
            >
                {uploading ? (
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                        <Loader2 className="h-6 w-6 animate-spin mb-2 text-blue-500" />
                        <span className="text-[10px]">Subiendo...</span>
                    </div>
                ) : signedUrl ? (
                    <>
                        {signedUrl.toLowerCase().includes('.pdf') ? (
                            <div className={`flex flex-col items-center justify-center ${verified ? 'text-blue-500/50' : 'text-zinc-400 group-hover:text-blue-400'} transition-colors`}>
                                <FileText className="h-10 w-10 mb-2" />
                                <span className="text-[10px] font-medium">Documento PDF</span>
                            </div>
                        ) : (
                            <img src={signedUrl} alt={`${label} Preview`} className={`w-full h-full object-cover ${verified ? 'opacity-80' : 'opacity-70 group-hover:opacity-100'} transition-opacity`} />
                        )}

                        {!verified && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold flex items-center gap-2">
                                    <Camera className="h-4 w-4" /> Cambiar
                                </span>
                            </div>
                        )}

                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm font-bold">
                            <CheckCircle2 className="h-3 w-3" /> {verified ? 'Verificado' : 'Listo'}
                        </div>

                        {verified && (
                            <div className="absolute bottom-2 left-2 bg-blue-600/90 text-white text-[8px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                                <Shield className="h-2 w-2" /> Protegido
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                        <Plus className="h-6 w-6 mb-2" />
                        <span className="text-[10px]">{previewText}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
