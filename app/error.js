"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorState from "@/components/ui/ErrorState";

/**
 * Route-level error boundary. Users see a calm, plain-language screen; the
 * technical error goes to the console (and your monitoring, if added) only.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorState
          eyebrow="Something went wrong"
          title="We hit a snag"
          message="This wasn't you. Give it another try, and if it keeps happening, come back in a few minutes."
          icon={AlertTriangle}
          onRetry={reset}
        />
      </main>
      <Footer />
    </div>
  );
}
