"use client";

import { useState } from "react";
import PricingHero from "./PricingHero";
import PricingPlans from "./PricingPlans";
import PricingComparison from "./PricingComparison";
import PricingFaq from "./PricingFaq";

export default function PricingPageContent() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <>
      <PricingHero isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
      <PricingPlans isAnnual={isAnnual} />
      <PricingComparison />
      <PricingFaq />
    </>
  );
}
