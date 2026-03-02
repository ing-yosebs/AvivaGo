import { ServiceUsageMonitor } from '@/components/Admin/System/ServiceUsageMonitor'
import { SystemChangelog } from '@/components/Admin/System/SystemChangelog'
import { BillingQuickLinks } from '@/components/Admin/System/BillingQuickLinks'

export default function SystemPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Estado del Sistema</h1>
                <p className="text-zinc-400">Monitoreo técnico de integraciones y control de versiones.</p>
            </div>

            <ServiceUsageMonitor />
            <BillingQuickLinks />
            <SystemChangelog />
        </div>
    )
}
