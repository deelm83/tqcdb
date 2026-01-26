import type { Metadata } from "next";
import "./globals.css";
import { ConditionalHeader, ConditionalBackToTop } from "@/components/ConditionalHeader";
import ScrollToTop from "@/components/ScrollToTop";
import { UserProvider } from "@/contexts/UserContext";

// Google Fonts
import { Be_Vietnam_Pro } from 'next/font/google';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-body',
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
      <body className={`antialiased ${beVietnamPro.variable}`}>
        <UserProvider>
          <ScrollToTop />
          <ConditionalHeader />
          {children}
          <ConditionalBackToTop />
        </UserProvider>
      </body>
    </html>
  );
}
