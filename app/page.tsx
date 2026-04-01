import { cookies } from "next/headers";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Hero } from "@/app/components/home/hero";
import { HowItWorks } from "@/app/components/home/how-it-works";
import { Navbar } from "@/app/components/home/navbar";
import { Partners } from "@/app/components/home/partners";
import { Services } from "@/app/components/home/services";
import { WhoWeServe } from "@/app/components/home/who-we-serve";
import { WhyChooseUs } from "@/app/components/home/why-choose-us";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";

export default async function Home() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />
      <Hero />
      <WhoWeServe />
      <Services />
      <HowItWorks />
      <WhyChooseUs />
      <Partners />
      <Footer />
      <BackToTop />
    </main>
  );
}
