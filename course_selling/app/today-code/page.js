import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TodayCodePage from "@/components/daily/TodayCodePage";

export const metadata = {
  title: "Today Code — Problem of the day | Gopo Workspace",
  description: "Today's solved problem-of-the-day with approach, complexity and copy-ready code. Free for signed-in members.",
};

export default function TodayCode() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <TodayCodePage />
      </main>
      <Footer />
    </div>
  );
}
