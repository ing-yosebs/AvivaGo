import TrustFooter from '@/app/components/marketing/v1/TrustFooter';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                {children}
            </main>
            <TrustFooter />
        </div>
    );
}
