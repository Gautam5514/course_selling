import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RefundContent from "@/components/legal/RefundContent";

export const metadata = {
  title: "30-Day Money-Back Guarantee & Refund Policy — hellobject.com",
  description:
    "Details on our 100% risk-free 30-day money-back guarantee, refund request process, and cancellation guidelines at hellobject.com.",
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
