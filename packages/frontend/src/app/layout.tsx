import type { Metadata } from "next";
import "./globals.css";
import { ConditionalHeader, ConditionalBackToTop } from "@/components/ConditionalHeader";
import ScrollToTop from "@/components/ScrollToTop";

// Google Fonts - Noto Serif for elegant names
import { Noto_Serif } from 'next/font/google';

const serif = Noto_Serif({
  weight: ['400', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "tamquoc.gg",
    template: "%s | tamquoc.gg",
  },
  description: "Tam Quốc Chí Chiến Lược Database",
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
      <body className={`antialiased ${serif.variable}`}>
        <ScrollToTop />
        <ConditionalHeader />
        {children}
        <ConditionalBackToTop />
      </body>
    </html>
  );
}
