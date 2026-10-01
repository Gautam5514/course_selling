import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPageContent from "@/components/blog/BlogPageContent";

export const metadata = {
  title: "Blog & Insights — helloS | Engineering, Design & Career Guides",
  description:
    "Explore in-depth tutorials, system architecture deep dives, product design strategies, and career blueprints from industry leads.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <BlogPageContent />
      </main>
      <Footer />
    </div>
  );
}
