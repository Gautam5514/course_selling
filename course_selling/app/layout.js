import "./globals.css";
import { preconnect } from "react-dom";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";


const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--font-jakarta" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", variable: "--font-bricolage" });

export const metadata = {
  title: "Gopo Workspace — Unlock Your Potential with Expert-Led Courses",
  description:
    "Master in-demand skills from top industry professionals on Gopo Workspace by hellobject.com. Join real-time virtual classrooms, earn recognized certificates, and accelerate your career.",
  icons: {
    icon: [
      { url: "/icon.svg?v=gopo", type: "image/svg+xml" },
      { url: "/favicon.svg?v=gopo", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=gopo",
    apple: "/apple-touch-icon.png?v=gopo",
  },
};

export default function RootLayout({ children }) {
  // Open the TCP/TLS connection to the API while the page is still loading.
  if (process.env.NEXT_PUBLIC_API_URL) preconnect(process.env.NEXT_PUBLIC_API_URL, { crossOrigin: "use-credentials" });
  return (
    <html lang="en" className={`scroll-smooth antialiased ${jakarta.variable} ${bricolage.variable}`}>
      <body className="min-h-full font-sans bg-[#faf7f2] text-[#0f2820]">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

