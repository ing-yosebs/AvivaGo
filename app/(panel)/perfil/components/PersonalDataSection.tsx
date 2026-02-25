'use client'

import { useState, useEffect } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'
import { uploadFile } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'

import { AvatarUploader } from './personal-data/AvatarUploader'
import { IdentityPanel } from './personal-data/IdentityPanel'
import { ComplementaryPanel } from './personal-data/ComplementaryPanel'
import { ChangePhoneModal } from './personal-data/ChangePhoneModal'
import { ChangeEmailModal } from './personal-data/ChangeEmailModal'

export default function PersonalDataSection({ profile, onSave, saving, hasMembership, isDriver }: any) {
    const supabase = createClient()
    const [uploading, setUploading] = useState<string | null>(null)
    const [signedUrls, setSignedUrls] = useState<{ id: string | null, idBack: string | null, address: string | null }>({
        id: null, idBack: null, address: null
    })

    // Estados para manejar los prefijos de país por separado
    const [phoneCode, setPhoneCode] = useState('52')
    const [emergencyPhoneCode, setEmergencyPhoneCode] = useState('52')

    // Internationalization State
    const [countries, setCountries] = useState<any[]>([])
    const [selectedCountry, setSelectedCountry] = useState<any>(null)

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || '',
        email: profile?.email || '',
        birthday: profile?.birthday || '',
        nationality: profile?.nationality || '',
        curp: profile?.curp || '',
        education_level: profile?.education_level || '',
        emergency_contact_name: profile?.emergency_contact_name || '',
        emergency_contact_relationship: profile?.emergency_contact_relationship || '',
        emergency_contact_phone: profile?.emergency_contact_phone || '',
        address_text: profile?.address_text || '',
        address_street: profile?.address_street || '',
        address_number_ext: profile?.address_number_ext || '',
        address_number_int: profile?.address_number_int || '',
        address_suburb: profile?.address_suburb || '',
        address_state: profile?.address_state || '',
        address_country: profile?.address_country || '',
        address_postal_code: profile?.address_postal_code || '',
        address_references: profile?.address_references || '',
        address_map_lat: profile?.address_map_lat || 19.4326,
        address_map_lng: profile?.address_map_lng || -99.1332,
        avatar_url: profile?.avatar_url || '',
        id_document_url: profile?.id_document_url || '',
        id_document_back_url: profile?.id_document_back_url || '',
        address_proof_url: profile?.address_proof_url || '',
        country_code: profile?.driver_profile?.country_code || '', // No default country
    })

    // Modals state
    const [showChangePhone, setShowChangePhone] = useState(false)
    const [showChangeEmail, setShowChangeEmail] = useState(false)

    // Fetch Countries
    useEffect(() => {
        const fetchCountries = async () => {
            const { data } = await supabase
                .from('countries')
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (data) {
                setCountries(data)
            }
        }
        fetchCountries()
    }, [supabase])

    // Update selected country when formData changes
    useEffect(() => {
        if (countries.length > 0) {
            const current = countries.find(c => c.code === formData.country_code)
            if (current) setSelectedCountry(current)
        }
    }, [formData.country_code, countries])

    useEffect(() => {
        if (profile) {
            const rawPhone = profile.phone_number || '';
            const rawEmergency = profile.emergency_contact_phone || '';

            const splitPhone = (full: string) => {
                if (!full) return { code: '52', num: '' };
                const clean = full.replace(/[^\d+]/g, '');

                const commonCodes = ['52', '1', '57', '54', '34', '56', '51', '7', '593', '506', '598', '507', '502', '58', '591', '595', '503', '504', '505', '53', '55'];

                if (clean.startsWith('+')) {
                    const withoutPlus = clean.substring(1);
                    let code = '52';
                    let num = clean;
                    let found = false;
                    for (const c of commonCodes) {
                        if (withoutPlus.startsWith(c)) {
                            code = c;
                            num = withoutPlus.substring(c.length);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        code = withoutPlus.substring(0, 2) || '52';
                        num = withoutPlus.substring(2);
                    }
                    return { code, num };
                }

                // If no +, try to see if it starts with a known code
                let dirtyNum = clean.replace(/\D/g, '');
                for (const c of commonCodes) {
                    if (dirtyNum.startsWith(c) && dirtyNum.length > c.length + 8) {
                        return { code: c, num: dirtyNum.substring(c.length) };
                    }
                }

                // Fallback for Mexico (10 digits)
                if (dirtyNum.length === 10) {
                    return { code: '52', num: dirtyNum };
                }

                return { code: '52', num: dirtyNum };
            };

            const pData = splitPhone(rawPhone);
            const eData = splitPhone(rawEmergency);

            setPhoneCode(pData.code);
            setEmergencyPhoneCode(eData.code);

            // 1. Determine Country by Phone Code
            let detectedCountryCode = profile.driver_profile?.country_code || '';
            if (countries.length > 0) {
                const countryByPhone = countries.find(c => c.phone_code === pData.code);
                if (countryByPhone) {
                    detectedCountryCode = countryByPhone.code;
                }
            }


            setFormData(prev => ({
                ...prev,
                full_name: profile.full_name || '',
                phone_number: pData.num,
                email: profile.email || '',
                birthday: profile.birthday || '',
                nationality: profile.nationality || '',
                curp: profile.curp || '',
                education_level: profile.education_level || '',
                emergency_contact_name: profile.emergency_contact_name || '',
                emergency_contact_relationship: profile.emergency_contact_relationship || '',
                emergency_contact_phone: eData.num,
                address_text: profile.address_text || '',
                address_street: profile.address_street || '',
                address_number_ext: profile.address_number_ext || '',
                address_number_int: profile.address_number_int || '',
                address_suburb: profile.address_suburb || '',
                address_state: profile.address_state || '',
                address_country: profile.address_country || '',
                address_postal_code: profile.address_postal_code || '',
                address_references: profile.address_references || '',
                address_map_lat: profile.address_map_lat || 19.4326,
                address_map_lng: profile.address_map_lng || -99.1332,
                avatar_url: profile.avatar_url || '',
                id_document_url: profile.id_document_url || '',
                id_document_back_url: profile.id_document_back_url || '',
                address_proof_url: profile.address_proof_url || '',
                country_code: detectedCountryCode,
            }))
        }
    }, [profile, countries])

    useEffect(() => {
        const signUrl = async (url: string) => {
            if (!url) return null
            try {
                if (url.includes('/storage/v1/object/public/documents/')) {
                    const path = url.split('/documents/')[1];
                    if (path) {
                        const { data } = await supabase.storage.from('documents').createSignedUrl(path, 3600);
                        if (data?.signedUrl) return data.signedUrl
                    }
                }
                return url
            } catch { return url }
        }

        const signAll = async () => {
            const id = await signUrl(formData.id_document_url)
            const idBack = await signUrl(formData.id_document_back_url)
            const address = await signUrl(formData.address_proof_url)
            setSignedUrls({ id, idBack, address })
        }

        signAll()
    }, [formData.id_document_url, formData.id_document_back_url, formData.address_proof_url, supabase.storage])


    const handleChange = (e: any) => {
        let value = e.target.value
        if (e.target.name === 'curp') {
            value = value.toUpperCase()
        }
        if (e.target.name.includes('phone') && !/^\d*$/.test(value)) {
            return
        }
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string, bucket: string) => {
        const originalFile = e.target.files?.[0]
        if (!originalFile) return

        // Validar tipos de archivo para imágenes
        if (originalFile.type.startsWith('image/') && !['image/jpeg', 'image/png', 'image/jpg'].includes(originalFile.type)) {
            alert('Por favor, selecciona solo imágenes PNG o JPG para asegurar un mejor rendimiento.');
            return
        }

        setUploading(field)
        let fileToUpload = originalFile

        try {
            // Compresión de Imágenes (Solo si es imagen)
            if (originalFile.type.startsWith('image/')) {
                const options = {
                    maxSizeMB: 0.8,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true
                }
                try {
                    fileToUpload = await imageCompression(originalFile, options)
                } catch (error) {
                    console.error('Error al comprimir imagen:', error)
                }
            }

            const path = `${profile.id}/${Date.now()}_${fileToUpload.name}`
            const url = await uploadFile(bucket, path, fileToUpload)
            setFormData(prev => ({ ...prev, [field]: url }))
        } catch (error: any) {
            alert('Error al subir archivo: ' + error.message)
        } finally {
            setUploading(null)
        }
    }

    const handleUpdate = (updates: any) => {
        setFormData(prev => ({ ...prev, ...updates }))
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 gap-6">
                <IdentityPanel
                    formData={formData}
                    profile={profile}
                    phoneCode={phoneCode}
                    onAvatarUpload={(file) => {
                        const fakeEvent = { target: { files: [file] } } as any
                        handleFileChange(fakeEvent, 'avatar_url', 'avatars')
                        return Promise.resolve()
                    }}
                    onFileUpload={handleFileChange}
                    onChange={handleChange}
                    onOpenPhoneModal={() => setShowChangePhone(true)}
                    onOpenEmailModal={() => setShowChangeEmail(true)}
                    uploading={uploading}
                    signedUrls={signedUrls}
                    selectedCountry={selectedCountry}
                    hasMembership={hasMembership}
                    isDriver={isDriver}
                />

                <ComplementaryPanel
                    formData={formData}
                    onChange={handleChange}
                    countries={countries}
                    setSelectedCountry={setSelectedCountry}
                    setPhoneCode={setPhoneCode}
                    setEmergencyPhoneCode={setEmergencyPhoneCode}
                    profile={profile}
                    emergencyPhoneCode={emergencyPhoneCode}
                    onAddressUpdate={handleUpdate}
                    uploading={uploading}
                    signedUrls={signedUrls}
                    onFileUpload={handleFileChange}
                />
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => {
                        onSave({
                            ...formData,
                            phone_number: `+${phoneCode}${formData.phone_number}`,
                            emergency_contact_phone: `+${emergencyPhoneCode}${formData.emergency_contact_phone}`
                        })
                    }}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-600/20"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Guardar Información Personal'}
                </button>
            </div>

            <ChangePhoneModal
                isOpen={showChangePhone}
                onClose={() => setShowChangePhone(false)}
                onSuccess={(newCode: string, newNumber: string) => {
                    setPhoneCode(newCode)
                    setFormData(prev => ({ ...prev, phone_number: newNumber }))
                }}
            />

            <ChangeEmailModal
                isOpen={showChangeEmail}
                onClose={() => setShowChangeEmail(false)}
                onSuccess={(email: string) => {
                    setFormData(prev => ({ ...prev, email: email }))
                }}
            />
        </div>
    )
}
