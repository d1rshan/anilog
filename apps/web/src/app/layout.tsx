import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "anilog",
  description: "Track anime, manga",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${manrope.variable} font-sans antialiased bg-[#050505] text-[#ededed] selection:bg-[#ededed] selection:text-[#050505]`}
      >
        <Providers>
          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
