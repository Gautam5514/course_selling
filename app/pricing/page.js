import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingPageContent from "@/components/pricing/PricingPageContent";

export const metadata = {
  title: "100% Free & Open Access Pledge — helloS",
  description:
    "helloS is 100% free with zero paywalls and zero subscriptions. Download comprehensive technical PDF notes and open-source production projects freely.",
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
