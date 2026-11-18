import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutMission from "@/components/about/AboutMission";
import AboutTeam from "@/components/about/AboutTeam";
import AboutJourney from "@/components/about/AboutJourney";

export const metadata = {
  title: "About Us — Gopo Workspace | Empowering the Next Generation of Builders",
  description:
    "Learn about Gopo Workspace's mission, teaching philosophy, and Gautam Pandit, the software engineer who builds every course, project and set of notes on the platform.",
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
