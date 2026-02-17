import Navbar from '@/app/components/marketing/v2/Navbar';
import HeroAssistant from '@/app/components/marketing/v2/HeroAssistant';
import PainPoints from '@/app/components/marketing/v2/PainPoints';
import CustomNeeds from '@/app/components/marketing/v2/CustomNeeds';
import ServicePillars from '@/app/components/marketing/v2/ServicePillars';
import DriverInvitation from '@/app/components/marketing/v2/DriverInvitation';
import Testimonials from '@/app/components/marketing/v2/Testimonials';
import TrustFooter from '@/app/components/marketing/v1/TrustFooter';

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-white font-sans selection:bg-aviva-primary/20 selection:text-aviva-primary">
            <Navbar />
            <HeroAssistant />
            <PainPoints />
            <CustomNeeds />
            <ServicePillars />
            <DriverInvitation />
            <Testimonials />
            <TrustFooter />
        </main>
    );
}
