import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TermsContent from "@/components/legal/TermsContent";

export const metadata = {
  title: "Terms & Conditions — hellobject.com",
  description:
    "Review our user agreement, cohort enrollment terms, code of conduct, and service guidelines at hellobject.com.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <TermsContent />
      </main>
      <Footer />
    </div>
  );
}
