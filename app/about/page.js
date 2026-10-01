import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutMission from "@/components/about/AboutMission";
import AboutTeam from "@/components/about/AboutTeam";
import AboutJourney from "@/components/about/AboutJourney";

export const metadata = {
  title: "About Us — helloS | Empowering the Next Generation of Builders",
  description:
    "Learn about helloS's mission, pedagogical philosophy, experienced educators, and our journey from startup to global learning accelerator.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <AboutHero />
        <AboutMission />
        <AboutTeam />
        <AboutJourney />
      </main>
      <Footer />
    </div>
  );
}
