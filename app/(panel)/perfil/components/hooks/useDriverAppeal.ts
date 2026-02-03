import { useState } from 'react'
import { requestReview } from '@/app/driver/actions'

export const useDriverAppeal = (driverProfileId: string | undefined) => {
    const [appealModalOpen, setAppealModalOpen] = useState(false)
    const [appealReason, setAppealReason] = useState('')
    const [submittingAppeal, setSubmittingAppeal] = useState(false)

    const handleRequestReview = (validationErrors: string[]) => {
        if (!driverProfileId) return

        if (validationErrors.length > 0) {
            alert('No podemos proceder con tu solicitud porque faltan los siguientes datos obligatorios:\n\n- ' + validationErrors.join('\n- '))
            return
        }

        setAppealReason('')
        setAppealModalOpen(true)
    }

    const confirmRequestReview = async () => {
        if (!driverProfileId) return

        setSubmittingAppeal(true)

        try {
            const result = await requestReview(driverProfileId, appealReason)
            if (result.error) throw new Error(result.error)
            alert('Solicitud enviada con éxito. Tu perfil está ahora en revisión.')
            window.location.reload() // Reload to refresh status
            setAppealModalOpen(false)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setSubmittingAppeal(false)
        }
    }

    return {
        appealModalOpen,
        setAppealModalOpen,
        appealReason,
        setAppealReason,
        submittingAppeal,
        handleRequestReview,
        confirmRequestReview
    }
}
