import { createClient } from './client'

export async function uploadFile(bucket: string, path: string, file: File) {
    const supabase = createClient()

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            upsert: true,
            contentType: file.type
        })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

    return publicUrl
}
