import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne, DM_Sans, DM_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: 'swap',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://intelligence.zeyro.in'),
  title: "Zeyro",
  description: "Financial superintelligence",
  openGraph: {
    title: "Zeyro",
    description: "Financial superintelligence",
    images: [{ url: '/roman-hero-bg-og-black-v5.jpg', width: 1200, height: 630 }],
    type: "website",
    url: "https://intelligence.zeyro.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeyro",
    description: "Financial superintelligence",
    images: ['/roman-hero-bg-og-black-v5.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zeyro"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${dmSans.variable} ${dmMono.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <body className="bg-white text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
