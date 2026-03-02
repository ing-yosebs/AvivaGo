import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const revalidate = 300 // Cache results for 5 minutes to save Vercel CPU minutes

export async function GET() {
    try {
        const supabase = createAdminClient()

        // 1. Get Database Size
        const { data: dbSizeData, error: dbSizeError } = await supabase.rpc('get_db_size')
        const total_db_size = dbSizeError ? 0 : Number(dbSizeData)

        // 2. Get Storage Size
        const { data: storageSizeData, error: storage_error } = await supabase.rpc('get_storage_size')
        const total_storage_size = storage_error ? 0 : Number(storageSizeData)

        // 3. Get Accurate Auth Users Count (From backend RPC to avoid row limits/pagination issues)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data: authMetricsData, error: authMetricsError } = await supabase.rpc('get_system_auth_metrics', {
            month_start: firstDayOfMonth
        })

        // authMetricsData is array of 1 object: [{total_users, monthly_users, ...}]
        const defaultMetrics = {
            total_users: 0, monthly_users: 0,
            emails_confirmed: 0, monthly_emails_confirmed: 0,
            phones_confirmed: 0, monthly_phones_confirmed: 0,
            email_changes: 0, monthly_email_changes: 0,
            phone_changes: 0, monthly_phone_changes: 0,
            email_codes: 0, monthly_email_codes: 0,
            phone_codes: 0, monthly_phone_codes: 0
        }
        const authMetrics = authMetricsData && authMetricsData.length > 0 ? authMetricsData[0] : defaultMetrics

        // 4. Get Google Maps Usage (Addresses + Calculator)
        // A) Addresses
        const { count: addressesCountTotal } = await supabase.from('users').select('*', { count: 'exact', head: true }).not('address_text', 'is', null)
        const { count: addressesCountMonthly } = await supabase.from('users').select('*', { count: 'exact', head: true }).not('address_text', 'is', null).gte('created_at', firstDayOfMonth)

        // B) Calculator Usage
        const currentMonthYear = new Date().toISOString().substring(0, 7)
        const { data: calcUsageDataMonth } = await supabase.from('calculator_usage')
            .select('usage_count')
            .eq('month_year', currentMonthYear)

        const { data: calcUsageDataTotal } = await supabase.from('calculator_usage')
            .select('usage_count')

        const calculatorMapsCountMonth = calcUsageDataMonth?.reduce((acc, row) => acc + (row.usage_count || 0), 0) || 0
        const calculatorMapsCountTotal = calcUsageDataTotal?.reduce((acc, row) => acc + (row.usage_count || 0), 0) || 0

        // 5. GitHub Deployments
        const { data: gitLogsDataMonth } = await supabase.from('github_deployment_logs')
            .select('estimated_minutes')
            .gte('created_at', firstDayOfMonth)

        const { data: gitLogsDataTotal } = await supabase.from('github_deployment_logs')
            .select('estimated_minutes')

        const githubMinutesCountMonth = gitLogsDataMonth?.reduce((acc, row) => acc + (row.estimated_minutes || 3), 0) || 0
        const githubMinutesCountTotal = gitLogsDataTotal?.reduce((acc, row) => acc + (row.estimated_minutes || 3), 0) || 0

        // 6. Get Historical Metrics Dump
        const { data: historicalData } = await supabase.from('system_monthly_metrics').select('*').order('month_year', { ascending: false })

        // 7. Inject a mock historical record for '2026-02' as requested (since it just ended) if not present
        const historicals = historicalData || []

        // Let's create a functional mock entry mimicking the numbers we just investigated for February
        if (!historicals.find(h => h.month_year === '2026-02')) {
            historicals.push({
                month_year: '2026-02',
                db_size_bytes: total_db_size,
                storage_size_bytes: total_storage_size,
                auth_mau: Number(authMetrics.total_users) || 0,
                resend_emails_est: Number(authMetrics.emails_confirmed) + Number(authMetrics.email_changes) + Number(authMetrics.email_codes),
                meta_whatsapp_est: Number(authMetrics.phones_confirmed) + Number(authMetrics.phone_changes) + Number(authMetrics.phone_codes),
                google_maps_requests_est: ((addressesCountTotal || 0) * 12) + (calculatorMapsCountTotal * 3),
                github_actions_minutes: githubMinutesCountTotal
            })
        }

        // Formulate Response
        return NextResponse.json({
            success: true,
            data: {
                supabase: {
                    db_size_bytes: total_db_size,
                    storage_size_bytes: total_storage_size,
                    auth_mau: Number(authMetrics.monthly_users) || 0,
                    auth_total: Number(authMetrics.total_users) || 0,
                },
                resend: {
                    emails_sent_monthly_est: Number(authMetrics.monthly_emails_confirmed) + Number(authMetrics.monthly_email_changes) + Number(authMetrics.monthly_email_codes),
                    emails_sent_total_est: Number(authMetrics.emails_confirmed) + Number(authMetrics.email_changes) + Number(authMetrics.email_codes),
                },
                meta: {
                    whatsapp_tokens_monthly_est: Number(authMetrics.monthly_phones_confirmed) + Number(authMetrics.monthly_phone_changes) + Number(authMetrics.monthly_phone_codes),
                    whatsapp_tokens_total_est: Number(authMetrics.phones_confirmed) + Number(authMetrics.phone_changes) + Number(authMetrics.phone_codes),
                },
                google_maps: {
                    requests_monthly_est: ((addressesCountMonthly || 0) * 12) + (calculatorMapsCountMonth * 3),
                    requests_total_est: ((addressesCountTotal || 0) * 12) + (calculatorMapsCountTotal * 3),
                },
                github: {
                    action_minutes_monthly: githubMinutesCountMonth,
                    action_minutes_total: githubMinutesCountTotal,
                },
                historical: historicals
            }
        })
    } catch (error: any) {
        console.error("Error fetching system usage:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
