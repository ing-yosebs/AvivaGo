'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteUser } from '@/app/admin/users/actions'

export default function DeleteUserButton({ userId }: { userId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE a este usuario? Esta acción no se puede deshacer y borrará todos sus datos asociados.')) {
            return
        }

        setIsDeleting(true)
        try {
            const result = await deleteUser(userId)
            if (result.success) {
                alert('Usuario eliminado correctamente.')
                router.push('/admin/users')
            } else {
                alert(result.error || 'Ocurrió un error al intentar eliminar al usuario.')
                setIsDeleting(false)
            }
        } catch (error) {
            console.error('Error in handleDelete:', error)
            alert('Error de conexión al intentar eliminar al usuario.')
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Trash2 className="h-5 w-5" />
            <span className="font-medium">
                {isDeleting ? 'Eliminando...' : 'Eliminar Usuario'}
            </span>
        </button>
    )
}
