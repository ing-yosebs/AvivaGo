'use server';

import { createClient } from '@/lib/supabase/server';

export async function getPassengerQuotes(passengerId: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('quote_requests')
            .select(`
                *,
                driver:driver_id (
                    user:user_id (
                        full_name,
                        avatar_url
                    )
                )
            `)
            .eq('passenger_id', passengerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error details:', error);
            return { success: false, error: 'Error al cargar solicitudes' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: 'Error inesperado' };
    }
}
