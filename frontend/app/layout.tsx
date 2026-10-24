import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CMID MODEL HOUSE | Professional Model Network & Talent Discovery Platform",
  description:
    "The single source of truth for professional models, luxury fashion houses, agencies, and casting directors. Discover, evaluate, and book talent with verified digital identity.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-black text-white antialiased">
      <body className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#d4af37] selection:text-black">
        <Navbar />
        <main className="flex-1 w-full pt-[68px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
