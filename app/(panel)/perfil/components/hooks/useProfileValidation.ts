export const useProfileValidation = () => {
    const validateProfile = (profile: any, vehicles: any[], services: any) => {
        if (!profile) return ['No hay datos de perfil']

        const errors = []
        // Personal Data
        if (!profile.full_name) errors.push('Nombre completo')
        if (!profile.phone_number) errors.push('Teléfono')
        if (!profile.nationality) errors.push('Nacionalidad')
        if (!profile.curp) errors.push('CURP')
        if (!profile.address_street) errors.push('Calle')
        if (!profile.address_number_ext) errors.push('Número exterior')
        if (!profile.address_suburb) errors.push('Colonia/Municipio')
        if (!profile.address_postal_code) errors.push('Código postal')
        if (!profile.address_state) errors.push('Estado')
        if (!profile.address_country) errors.push('País')
        if (!profile.id_document_url) errors.push('Identificación oficial o pasaporte (foto)')
        if (!profile.address_proof_url) errors.push('Comprobante de domicilio (foto)')

        // Vehicles Validation
        if (!vehicles || vehicles.length === 0) {
            errors.push('Registrar al menos un vehículo')
        }

        // Services Validation
        if (!services) {
            errors.push('Configuración de servicios')
        } else {
            if (!services.preferred_zones || services.preferred_zones.length === 0) {
                errors.push('Seleccionar tus zonas de cobertura (Mis Servicios)')
            }
            // Optional: Check questionnaire completion if deemed critical
            // if (!services.professional_questionnaire || Object.keys(services.professional_questionnaire).length === 0) {
            //     errors.push('Completar el Cuestionario Profesional (Mis Servicios)')
            // }
        }

        return errors
    }

    return { validateProfile }
}
