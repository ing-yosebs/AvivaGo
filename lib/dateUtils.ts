
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

/**
 * Formats a date string or Date object to 'es-MX' locale with 'America/Mexico_City' timezone, including time.
 * Returns the datetime in 'dd/mm/aaaa, hh:mm a' format (e.g., '12/02/2026, 04:30 p.m.').
 */
export const formatDateTimeMX = (date: string | Date | null | undefined): string => {
    if (!date) return 'Fecha no válida';

    const d = new Date(date);

    if (isNaN(d.getTime())) return 'Fecha no válida';

    return d.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Mexico_City'
    });
};

/**
 * Formats a date string or Date object to 'es-MX' locale with 'America/Mexico_City' timezone, only time.
 * Returns the time in 'hh:mm a' format (e.g., '04:30 p.m.').
 */
export const formatTimeMX = (date: string | Date | null | undefined): string => {
    if (!date) return 'Hora no válida';

    const d = new Date(date);

    if (isNaN(d.getTime())) return 'Hora no válida';

    return d.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Mexico_City'
    });
};
