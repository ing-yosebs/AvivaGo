import TrustFooter from '@/app/components/marketing/v1/TrustFooter';
import Navbar from '@/app/components/marketing/v1/Navbar';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <TrustFooter />
        </div>
    );
}
