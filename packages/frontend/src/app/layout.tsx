import type { Metadata } from "next";
import "./globals.css";
import { ConditionalHeader, ConditionalBackToTop } from "@/components/ConditionalHeader";
import ScrollToTop from "@/components/ScrollToTop";

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
      <body className="antialiased">
        <ScrollToTop />
        <ConditionalHeader />
        {children}
        <ConditionalBackToTop />
      </body>
    </html>
  );
}
