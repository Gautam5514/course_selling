import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TodayCodePage from "@/components/daily/TodayCodePage";
import { formatDay, isValidDateKey } from "@/lib/dailyCode";

export async function generateMetadata({ params }) {
  const { date } = await params;
  return {
    title: `Code of ${isValidDateKey(date) ? formatDay(date) : "the day"} — Today Code | Gopo Workspace`,
    description: "A solved problem-of-the-day with approach, complexity and copy-ready code.",
  };
}

export default async function TodayCodeByDate({ params }) {
  const { date } = await params;
  if (!isValidDateKey(date)) notFound();
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <TodayCodePage date={date} />
      </main>
      <Footer />
    </div>
  );
}
