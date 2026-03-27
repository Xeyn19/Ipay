import { Footer } from "@/app/components/home/footer";
import { Hero } from "@/app/components/home/hero";
import { HowItWorks } from "@/app/components/home/how-it-works";
import { Navbar } from "@/app/components/home/navbar";
import { Partners } from "@/app/components/home/partners";
import { Services } from "@/app/components/home/services";
import { TrustBar } from "@/app/components/home/trust-bar";
import { WhoWeServe } from "@/app/components/home/who-we-serve";
import { WhyChooseUs } from "@/app/components/home/why-choose-us";

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar />
      <Hero />
      <TrustBar />
      <WhoWeServe />
      <Services />
      <HowItWorks />
      <WhyChooseUs />
      <Partners />
      <Footer />
    </main>
  );
}
