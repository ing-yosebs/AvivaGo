import { User, Camera, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'

interface AvatarUploaderProps {
    avatarUrl: string;
    onUpload: (file: File) => Promise<void>;
    uploading: boolean;
    readOnly?: boolean;
}

export function AvatarUploader({ avatarUrl, onUpload, uploading, readOnly }: AvatarUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return
        const file = e.target.files?.[0]
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                alert('Por favor, sube solo imágenes en formato JPG o PNG para asegurar una carga rápida y un perfil ligero.');
                return;
            }
            onUpload(file)
        }
    }

    return (
        <div className="relative group">
            <div className={`w-24 h-24 rounded-2xl bg-gray-100 border-2 border-gray-200 overflow-hidden ${readOnly ? 'opacity-90' : ''}`}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="h-10 w-10" />
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                )}
            </div>
            {!readOnly && (
                <>
                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        accept=".jpg, .jpeg, .png"
                        onChange={handleChange}
                    />
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-lg text-white shadow-lg hover:bg-blue-700 transition-colors"
                        disabled={uploading}
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                </>
            )}
        </div>
    )
}
