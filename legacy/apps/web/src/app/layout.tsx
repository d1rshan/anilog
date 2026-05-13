import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";

import "../index.css";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { RouteTransitionShell } from "@/components/route-transition-shell";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${manrope.variable} font-sans antialiased bg-[#050505] text-[#ededed] selection:bg-[#ededed] selection:text-[#050505]`}
      >
        <Providers>
          <Navbar />

          <main className="min-h-screen">
            <RouteTransitionShell>{children}</RouteTransitionShell>
          </main>
        </Providers>
      </body>
    </html>
  );
}
