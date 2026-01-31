import Navbar from '@/app/components/marketing/v1/Navbar';
import WelcomeVideo from '@/app/components/marketing/v1/WelcomeVideo';
import Hero from '@/app/components/marketing/v1/Hero';
import Comparison from '@/app/components/marketing/v1/Comparison';
import BookingDemo from '@/app/components/marketing/v1/BookingDemo';
import CaseStudy from '@/app/components/marketing/v1/CaseStudy';
import Pricing from '@/app/components/marketing/v1/Pricing';
import TrustFooter from '@/app/components/marketing/v1/TrustFooter';
import PassengerCTA from '@/app/components/marketing/v1/PassengerCTA';

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-white font-sans selection:bg-aviva-primary/20 selection:text-aviva-primary">
            <WelcomeVideo />
            <Hero />
            <Comparison />
            <BookingDemo />
            <CaseStudy />
            <Pricing />
            <PassengerCTA />
        </main>
    );
}
