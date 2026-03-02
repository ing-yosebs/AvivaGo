import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
    try {
        const payload = await req.json()
        const supabase = createAdminClient()

        // 1. Extract GitHub Push Payload details
        const commit_hash = payload.after || payload.head_commit?.id || null;
        const triggered_by = payload.pusher?.name || payload.sender?.login || 'Admin / Scripts';
        const commit_message = payload.head_commit?.message || 'Actualización de Sistema (Despliegue General)';

        // 2. Determine Type via basic keyword matching in message
        const lowerMsg = commit_message.toLowerCase();
        let type = 'feature';
        if (lowerMsg.includes('fix') || lowerMsg.includes('bug')) type = 'bugfix';
        if (lowerMsg.includes('hotfix') || lowerMsg.includes('urgente')) type = 'hotfix';

        // 3. Create a version tag from the short hash (e.g. v-a1b2c3d)
        const version_tag = commit_hash ? `v-${commit_hash.substring(0, 7)}` : `v-auto-${Date.now().toString().slice(-6)}`;

        // 4. Log the usage consumption (GitHub Action minutes)
        const { error: logError } = await supabase.from('github_deployment_logs').insert({
            estimated_minutes: 3,
            triggered_by,
            commit_hash
        })

        if (logError) {
            console.error('Error logging github deployment limit:', logError)
            return NextResponse.json({ success: false, error: logError.message }, { status: 500 })
        }

        // 5. Automatically create the System Version in the DB for the Changelog
        const { error: versionError } = await supabase.from('system_versions').insert({
            version_tag,
            changes_description: commit_message,
            type
        });

        if (versionError) {
            console.error('Error logging system version from webhook:', versionError)
            // Not throwing a hard 500 here to let GitHub know we got the hook ok
        }

        return NextResponse.json({ success: true, message: 'Deployment and Version logged successfully' })
    } catch (error: any) {
        console.error("Error in github webhook:", error)
        // If it's a generic ping or empty body, log manually
        try {
            const supabase = createAdminClient()
            await supabase.from('github_deployment_logs').insert({
                estimated_minutes: 3,
                triggered_by: 'Manual/Ping',
            })
            // Insert a generic system version log
            await supabase.from('system_versions').insert({
                version_tag: `v-ping-${Date.now().toString().slice(-4)}`,
                changes_description: 'Validación manual del Webhook / Ping de Github.',
                type: 'bugfix'
            })
            return NextResponse.json({ success: true, message: 'Manual Deployment logged without payload' })
        } catch (fallbackError) {
            return NextResponse.json({ success: false, error: 'Invalid payload or server error' }, { status: 400 })
        }
    }
}
