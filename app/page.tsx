import { Header } from "@/components/landing/Header"
import { Hero } from "@/components/landing/Hero"
import { Benefits } from "@/components/landing/Benefits"
import { ProductShowcase } from "@/components/landing/ProductShowcase"
import { Pricing } from "@/components/landing/Pricing"
// import { Testimonials } from "@/components/landing/Testimonials"
import { CTA } from "@/components/landing/CTA"
import { Footer } from "@/components/landing/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <Header />
      <Hero />
      <Benefits />
      <ProductShowcase />
      {/* <Pricing /> */}
      {/* <Testimonials /> */}
      <CTA />
      <Footer />
    </main>
  );
}
