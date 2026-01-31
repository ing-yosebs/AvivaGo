'use server';

import { createClient } from '@/lib/supabase/server';

export async function getValidatedUserCount() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc('get_validated_user_count');

        if (error) {
            console.error('Error fetching validated user count:', error);
            return 0; // Fallback to 0 or handle error appropriately
        }

        // Base count for offline/legacy users or marketing purposes
        const BASE_USER_COUNT = 500;

        return (data as number) + BASE_USER_COUNT;
    } catch (err) {
        console.error('Unexpected error fetching user count:', err);
        return 0;
    }
}
