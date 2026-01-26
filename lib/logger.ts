import { promises as fs } from 'fs';
import path from 'path';

// Log file path (relative to project root). In server environments this will be written to the filesystem.
const LOG_FILE = path.join(process.cwd(), 'driver_audit.log');

/**
 * Simple async logger that appends a line to a log file.
 * The logger is deliberately lightweight and runs only on the server side,
 * so it does not increase the client bundle size or affect page load performance.
 *
 * @param actor - The user performing the action (id and optional email).
 * @param action - A short identifier for the action (e.g., 'admin_status_change').
 * @param details - Arbitrary details about the event.
 */
export async function logDriverAction(
    actor: { id: string; email?: string },
    action: string,
    details: Record<string, unknown>
) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${actor.email || actor.id} ${action} ${JSON.stringify(details)}\n`;
    try {
        await fs.appendFile(LOG_FILE, entry, 'utf8');
        // Also output to console for immediate debugging (optional)
        console.log('[AUDIT]', entry.trim());
    } catch (err) {
        console.error('Failed to write audit log:', err);
    }
}
