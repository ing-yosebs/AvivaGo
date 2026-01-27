import LandingHeader from '@/app/components/marketing/v1/Navbar';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
            <LandingHeader />
            {children}
        </div>
    );
}
