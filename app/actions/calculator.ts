'use server'

import { createClient } from '@/lib/supabase/server'

export type CalculatorQuotaStatus = {
    allowed: boolean;
    remaining: number;
    limit: number | 'unlimited';
    message?: string;
    totalReferrals: number;
    hasMembership: boolean;
    countryCode: string;
    currency: string;
};

export async function checkCalculatorQuota(): Promise<CalculatorQuotaStatus> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { allowed: false, remaining: 0, limit: 0, message: "No autenticado", totalReferrals: 0, hasMembership: false, countryCode: 'MX', currency: 'MXN' }
    }

    try {
        // 1. Get user profile and driver data to check referrals and membership
        const { data: driverData } = await supabase
            .from('driver_profiles')
            .select(`
                id, 
                referral_count, 
                b2c_referral_count,
                country_code,
                countries:country_code (
                    currency
                )
            `)
            .eq('user_id', user.id)
            .maybeSingle();

        // If not a driver, block
        if (!driverData) {
            return { allowed: false, remaining: 0, limit: 0, message: "Solo disponible para conductores", totalReferrals: 0, hasMembership: false, countryCode: 'MX', currency: 'MXN' }
        }

        const countryCode = driverData.country_code || 'MX';
        // @ts-ignore - nested join type
        const currency = driverData.countries?.currency?.trim() || 'MXN';

        // 2. Check Active Membership
        const { data: membershipData } = await supabase
            .from('driver_memberships')
            .select('status, expires_at')
            .eq('driver_profile_id', driverData.id)
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        const hasMembership = !!membershipData;

        // 3. Calculate Total Referrals (Drivers + Passengers)
        const totalReferrals = (driverData.referral_count || 0) + (driverData.b2c_referral_count || 0);

        // 4. Determine Limit Based on Rules
        let limit: number | 'unlimited' = 4; // Default base for non-members

        if (hasMembership) {
            limit = 30; // Base Premium

            if (totalReferrals >= 51) {
                limit = 'unlimited';
            } else if (totalReferrals >= 11) {
                limit = 100;
            } else if (totalReferrals >= 1) {
                limit = 50;
            }
        }

        // 5. Check Usage for Current Month
        const currentMonthYear = new Date().toISOString().substring(0, 7); // Format: YYYY-MM

        let currentUsage = 0;

        if (limit !== 'unlimited') {
            const { data: usageData } = await supabase
                .from('calculator_usage')
                .select('usage_count')
                .eq('user_id', user.id)
                .eq('month_year', currentMonthYear)
                .maybeSingle();

            if (usageData) {
                currentUsage = usageData.usage_count;
            }

            if (currentUsage >= limit) {
                return {
                    allowed: false,
                    remaining: 0,
                    limit,
                    message: hasMembership ? "Límite mensual alcanzado" : "Has agotado tus 4 usos gratuitos este mes",
                    totalReferrals,
                    hasMembership,
                    countryCode,
                    currency
                }
            }

            return {
                allowed: true,
                remaining: limit - currentUsage,
                limit,
                totalReferrals,
                hasMembership,
                countryCode,
                currency
            };
        }

        // Return for unlimited
        return {
            allowed: true,
            remaining: 9999,
            limit: 'unlimited',
            totalReferrals,
            hasMembership: true,
            countryCode,
            currency
        };

    } catch (error) {
        console.error("Error checking calculator quota:", error);
        return { allowed: false, remaining: 0, limit: 0, message: "Error interno", totalReferrals: 0, hasMembership: false, countryCode: 'MX', currency: 'MXN' };
    }
}

export async function incrementCalculatorUsage(): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false;

    try {
        const currentMonthYear = new Date().toISOString().substring(0, 7);

        // Upsert usage: Insert 1 if not exists, else increment
        const { error } = await supabase.rpc('increment_calculator_usage', {
            p_user_id: user.id,
            p_month_year: currentMonthYear
        });

        // If RPC doesn't exist yet, fallback to a standard upsert
        if (error) {
            const { data: existing } = await supabase
                .from('calculator_usage')
                .select('usage_count')
                .eq('user_id', user.id)
                .eq('month_year', currentMonthYear)
                .maybeSingle();

            if (existing) {
                await supabase
                    .from('calculator_usage')
                    .update({ usage_count: existing.usage_count + 1 })
                    .eq('user_id', user.id)
                    .eq('month_year', currentMonthYear);
            } else {
                await supabase
                    .from('calculator_usage')
                    .insert({
                        user_id: user.id,
                        month_year: currentMonthYear,
                        usage_count: 1
                    });
            }
        }

        return true;
    } catch (error) {
        console.error("Error incrementing calculator usage:", error);
        return false;
    }
}
