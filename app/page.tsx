import Navbar from '@/app/components/marketing/v1/Navbar';
import WelcomeVideo from '@/app/components/marketing/v1/WelcomeVideo';
import Hero from '@/app/components/marketing/v1/Hero';
import HowItWorks from '@/app/components/marketing/v1/HowItWorks';
import PaymentMethods from '@/app/components/marketing/v1/PaymentMethods';
import ReferralEarnings from '@/app/components/marketing/v1/ReferralEarnings';
import Comparison from '@/app/components/marketing/v1/Comparison';
import BookingDemo from '@/app/components/marketing/v1/BookingDemo';
import CaseStudy from '@/app/components/marketing/v1/CaseStudy';
import Pricing from '@/app/components/marketing/v1/Pricing';
import TrustFooter from '@/app/components/marketing/v1/TrustFooter';

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-white font-sans selection:bg-aviva-primary/20 selection:text-aviva-primary">
            <Navbar />
            <WelcomeVideo />
            <Hero />
            <HowItWorks />
            <PaymentMethods />
            <ReferralEarnings />
            <Comparison />
            <BookingDemo />
            <CaseStudy />
            <Pricing />
            <TrustFooter />
        </main>
    );
}
