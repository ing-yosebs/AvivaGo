
import { createClient } from '@/lib/supabase/server'
import { removeAdminRole } from '../actions'
import { Shield, Trash2 } from 'lucide-react'
import AdminInviteForm from '@/app/components/admin/AdminInviteForm'

export default async function AdminsPage() {
    const supabase = await createClient()

    // Fetch all users who have 'admin' in their roles
    const { data: admins } = await supabase
        .from('users')
        .select('*')
        .contains('roles', ['admin'])

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Gestión de Administradores</h1>
                <p className="text-zinc-400">Controla quién tiene acceso al panel de modo Dios.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List of Admins */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-emerald-400" />
                        Administradores Actuales
                    </h3>

                    <div className="space-y-4">
                        {admins?.map(admin => (
                            <div key={admin.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <p className="text-white font-medium">{admin.full_name}</p>
                                    <p className="text-zinc-500 text-sm">{admin.email}</p>
                                </div>
                                <form action={async () => {
                                    'use server'
                                    await removeAdminRole(admin.id)
                                }}>
                                    <button
                                        type="submit"
                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Revocar permisos"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        ))}

                        {(!admins || admins.length === 0) && (
                            <p className="text-zinc-500 text-center py-4">No hay administradores (¡Imposible si estás viendo esto!)</p>
                        )}
                    </div>
                </div>

                {/* Invite Form Component */}
                <AdminInviteForm />
            </div>
        </div>
    )
}
