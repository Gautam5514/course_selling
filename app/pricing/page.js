import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingPageContent from "@/components/pricing/PricingPageContent";

export const metadata = {
  title: "Pricing Plans — helloS | Transparent, Flexible Investment",
  description:
    "Explore helloS membership tiers. Access 500+ masterclasses, live virtual classrooms, 1-on-1 mentorship, and job placement support with no hidden fees.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <PricingPageContent />
      </main>
      <Footer />
    </div>
  );
}
