import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustSignals } from "@/components/sections/TrustSignals";
import { HowItWorksPreview } from "@/components/sections/HowItWorksPreview";
import { ServiceCategories } from "@/components/sections/ServiceCategories";
import { EcosystemCrossSell } from "@/components/sections/EcosystemCrossSell";
import { FleetCTA } from "@/components/sections/FleetCTA";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";

export const metadata: Metadata = {
  title: "Drive Service Network — Built by Operators. Designed for Operators.",
  description:
    "Nationwide fleet maintenance platform connecting vehicle operators with trusted repair providers. Commercial discounts, simplified scheduling, and fleet management powered by Openbay.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustSignals />
      <HowItWorksPreview />
      <ServiceCategories />
      <TestimonialsSection />
      <EcosystemCrossSell />
      <FleetCTA />
    </>
  );
}
