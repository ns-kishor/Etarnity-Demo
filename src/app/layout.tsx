import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://etarnity.com"),
  title: {
    default: "ETARNITY — Building What Comes Next",
    template: "%s — ETARNITY",
  },
  description:
    "ETARNITY builds technology-driven products, digital platforms, and businesses designed to solve meaningful problems. A technology company founded in Bangladesh, built for an international market.",
  keywords: [
    "ETARNITY",
    "technology company",
    "software engineering",
    "digital products",
    "applied AI",
    "Bangladesh technology",
  ],
  authors: [{ name: "ETARNITY" }],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "ETARNITY — Building What Comes Next",
    description:
      "A technology company building products, digital platforms, and businesses designed to solve meaningful problems.",
    url: "https://etarnity.com",
    siteName: "ETARNITY",
    type: "website",
    images: [{ url: "/images/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ETARNITY — Building What Comes Next",
    description:
      "A technology company building products, digital platforms, and businesses designed to solve meaningful problems.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#15171B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
