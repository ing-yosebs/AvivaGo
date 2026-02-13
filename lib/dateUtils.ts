
/**
 * Formats a date string or Date object to 'es-MX' locale with 'America/Mexico_City' timezone.
 * Returns the date in 'dd/mm/aaaa' format (e.g., '12/02/2026').
 * 
 * @param date - The date to format (string or Date object)
 * @returns Formatted date string
 */
export const formatDateMX = (date: string | Date | null | undefined): string => {
    if (!date) return 'Fecha no válida';

    const d = new Date(date);

    // Check if date is valid
    if (isNaN(d.getTime())) return 'Fecha no válida';

    return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Mexico_City'
    });
};
