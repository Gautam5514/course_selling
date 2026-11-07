"use client";

import PricingHero from "./PricingHero";
import PricingPlans from "./PricingPlans";
import PricingComparison from "./PricingComparison";
import PricingFaq from "./PricingFaq";

export default function PricingPageContent() {
  return (
    <>
      <PricingHero />
      <PricingPlans />
      <PricingComparison />
      <PricingFaq />
    </>
  );
}
