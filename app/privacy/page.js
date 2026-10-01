import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrivacyContent from "@/components/legal/PrivacyContent";

export const metadata = {
  title: "Privacy Policy — hellobject.com",
  description:
    "Learn how hellobject.com securely handles student data, encryption, account privacy, and compliance with GDPR and CCPA.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  );
}
