import "./globals.css";


export const metadata = {
  title: "helloS — Unlock Your Potential with Expert-Led Courses",
  description:
    "Master in-demand skills from top industry professionals on helloS by hellobject.com. Join real-time virtual classrooms, earn recognized certificates, and accelerate your career.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@100..900&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Doppio+One&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Satisfy&family=Slabo+13px&family=Smooch+Sans:wght@100..900&family=Syne:wght@400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-sans bg-[#faf7f2] text-[#0f2820]">
        {children}
      </body>
    </html>
  );
}

