import IdVerificationFlow from '@/app/components/IdVerificationFlow';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function VerifyIdPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Check Roles and Membership Security
    const { data: userData } = await supabase
        .from('users')
        .select('roles')
        .eq('id', user.id)
        .single();

    const isDriver = userData?.roles?.includes('driver');

    if (isDriver) {
        // Driver must have active membership
        const { data: drvProfile } = await supabase
            .from('driver_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (drvProfile) {
            const { data: membershipData } = await supabase
                .from('driver_memberships')
                .select('status')
                .eq('driver_profile_id', drvProfile.id)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .maybeSingle();

            if (!membershipData) {
                // If driver and no membership, block access. Redirect back to profile.
                redirect('/perfil');
            }
        } else {
            redirect('/perfil');
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Verificación de Identidad
                </h1>
                <p className="text-zinc-400">
                    Sigue los pasos para validar tu cuenta de forma segura.
                </p>
            </div>

            <IdVerificationFlow />
        </div>
    );
}
