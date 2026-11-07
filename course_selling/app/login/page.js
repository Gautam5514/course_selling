import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in — Gopo Workspace",
  description: "Sign in or create a free Gopo Workspace account to read PDF notes and handbooks.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-14 sm:py-20">
        {/* useSearchParams() needs a Suspense boundary */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
