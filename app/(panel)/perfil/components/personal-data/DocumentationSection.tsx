import { FileText, Shield, CheckCircle2 } from 'lucide-react'
import { DocumentUploadCard } from './DocumentUploadCard'

interface DocumentationSectionProps {
    formData: any
    profile: any
    selectedCountry: any
    onChange: (e: any) => void
    uploading: string | null
    signedUrls: {
        id: string | null
        idBack: string | null
        address: string | null
    }
    onUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, bucket: string) => void
}

export function DocumentationSection({
    formData,
    profile,
    selectedCountry,
    onChange,
    uploading,
    signedUrls,
    onUpload
}: DocumentationSectionProps) {
    const isVerified = !!profile?.driver_profile?.verified_at
    const educationLevels = [
        { value: 'Ninguno', label: 'Ninguno' },
        { value: 'Primaria', label: 'Primaria' },
        { value: 'Secundaria', label: 'Secundaria' },
        { value: 'Medio superior', label: 'Medio superior' },
        { value: 'Superior', label: 'Superior (Licenciatura, Ingeniería)' },
        { value: 'Maestría', label: 'Maestría' },
        { value: 'Doctorado', label: 'Doctorado' }
    ]

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <FileText className="h-3 w-3" /> Documentación
            </h4>
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">
                    {selectedCountry?.id_label || 'ID Nacional / CURP'} *
                </label>
                <div className="relative">
                    <input
                        name="curp"
                        value={formData.curp}
                        onChange={onChange}
                        readOnly={isVerified}
                        placeholder={selectedCountry?.code === 'MX' ? 'AAAA000000HMM...' : 'Número de identificación'}
                        className={`w-full border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 font-mono ${isVerified ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'bg-white'}`}
                    />
                    {isVerified && (
                        <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 opacity-50" />
                    )}
                </div>
                {isVerified && (
                    <p className="text-[9px] text-blue-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-2 w-2" /> Datos verificados mediante identificación oficial
                    </p>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Último Grado de Estudios</label>
                <select name="education_level" value={formData.education_level} onChange={onChange} className="w-full bg-white border border-gray-200 text-[#0F2137] rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 appearance-none">
                    <option value="">Seleccionar...</option>
                    {educationLevels.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <DocumentUploadCard
                    label="Identificación (Frente) *"
                    url={formData.id_document_url}
                    signedUrl={signedUrls.id}
                    uploading={uploading === 'id_document_url'}
                    verified={isVerified}
                    onUpload={(file) => {
                        // Manually construct 'e' like object or change handler signature
                        // To keep simple, let's just make a fake event
                        const fakeEvent = { target: { files: [file] } } as any
                        onUpload(fakeEvent, 'id_document_url', 'documents')
                    }}
                    previewText="Subir Imagen o PDF"
                />

                <DocumentUploadCard
                    label="Identificación (Reverso)"
                    url={formData.id_document_back_url}
                    signedUrl={signedUrls.idBack}
                    uploading={uploading === 'id_document_back_url'}
                    verified={isVerified}
                    onUpload={(file) => {
                        const fakeEvent = { target: { files: [file] } } as any
                        onUpload(fakeEvent, 'id_document_back_url', 'documents')
                    }}
                    previewText="Subir Reverso"
                />
            </div>
            <div className="space-y-2">
                <DocumentUploadCard
                    label="Comprobante Domicilio *"
                    url={formData.address_proof_url}
                    signedUrl={signedUrls.address}
                    uploading={uploading === 'address_proof_url'}

                    onUpload={(file) => {
                        const fakeEvent = { target: { files: [file] } } as any
                        onUpload(fakeEvent, 'address_proof_url', 'documents')
                    }}
                    previewText="Subir Imagen o PDF"
                />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 italic text-opacity-70 text-center">
                * Solamente se aceptan archivos de imagen (JPG, PNG) o PDF.
            </p>
        </div>
    )
}
