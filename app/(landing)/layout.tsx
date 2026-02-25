import TrustFooter from '@/app/components/marketing/v1/TrustFooter';
import Navbar from '@/app/components/marketing/v1/Navbar';
import { createClient } from '@/lib/supabase/server';

export default async function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    let initialProfile = null;
    if (session?.user) {
        const { data } = await supabase
            .from('users')
            .select('full_name, avatar_url, roles')
            .eq('id', session.user.id)
            .single();
        initialProfile = data;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar initialSession={session} initialProfile={initialProfile} />
            <main className="flex-grow">
                {children}
            </main>
            <TrustFooter />
        </div>
    );
}
