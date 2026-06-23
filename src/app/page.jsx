import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Resources } from "@/components/landing/resources";
import { Pricing } from "@/components/landing/pricing";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { ParticlesBackground } from "@/components/landing/particles-background";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <Navbar />
      <main className="flex-grow pt-20">
        <Hero />
        <Features />
        <HowItWorks />
        <Resources />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
