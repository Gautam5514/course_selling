import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RefundContent from "@/components/legal/RefundContent";

export const metadata = {
  title: "100% Free Open Policy — helloS | No Fees, No Charges",
  description:
    "helloS is an open-access platform offering 100% free technical PDF notes and open-source projects without subscriptions or fees.",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <RefundContent />
      </main>
      <Footer />
    </div>
  );
}
