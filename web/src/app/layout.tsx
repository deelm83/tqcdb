import type { Metadata } from "next";
import { Be_Vietnam_Pro, Great_Vibes } from "next/font/google";
import "./globals.css";
import { ConditionalHeader, ConditionalBackToTop } from "@/components/ConditionalHeader";
import ScrollToTop from "@/components/ScrollToTop";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Tam Quốc Chí Chiến Lược - Cơ Sở Dữ Liệu",
  description: "Cơ sở dữ liệu tướng và chiến pháp Tam Quốc Chí Chiến Lược",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${beVietnam.variable} ${greatVibes.variable} antialiased`}
      >
        <ScrollToTop />
        <ConditionalHeader />
        {children}
        <ConditionalBackToTop />
      </body>
    </html>
  );
}
