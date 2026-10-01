import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePageContent from "@/components/home/HomePageContent";

export const metadata = {
  title: "helloS — Unlock Your Potential with Expert-Led Courses",
  description:
    "Master in-demand skills from top industry professionals. Join real-time virtual classrooms, earn recognized certificates, and take your career journey to new heights with confidence.",
};

export default function HomeRoutePage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HomePageContent />
      </main>
      <Footer />
    </div>
  );
}
