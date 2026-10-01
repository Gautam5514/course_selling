import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CareerHero from "@/components/career/CareerHero";
import CareerPerks from "@/components/career/CareerPerks";
import CareerOpenings from "@/components/career/CareerOpenings";
import CareerCulture from "@/components/career/CareerCulture";

export const metadata = {
  title: "Careers at helloS — Build the Future of Learning",
  description:
    "Join our remote-first team across 18 countries. Explore open roles in engineering, product design, curriculum, and marketing with competitive salary and equity.",
};

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <CareerHero />
        <CareerPerks />
        <CareerOpenings />
        <CareerCulture />
      </main>
      <Footer />
    </div>
  );
}
