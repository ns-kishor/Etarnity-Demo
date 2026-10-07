import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const editorial = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const monoCorp = JetBrains_Mono({
  variable: "--font-mono-corp",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

const SITE_URL = "https://etarnity.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ETARNITY — Building what comes next.",
    template: "%s — ETARNITY",
  },
  description:
    "ETARNITY is a technology-driven parent company building businesses, products, digital systems and ventures designed to solve meaningful problems.",
  keywords: [
    "ETARNITY",
    "parent company",
    "technology company",
    "ventures",
    "digital products",
    "software engineering",
    "Bangladesh",
    "innovation",
  ],
  authors: [{ name: "ETARNITY" }],
  creator: "ETARNITY",
  publisher: "ETARNITY",
  organizationName: "ETARNITY",
  applicationName: "ETARNITY",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logo-mark-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/logo-mark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [{ url: "/logo-mark.svg" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ETARNITY",
    title: "ETARNITY — Building what comes next.",
    description:
      "A technology-driven parent company building businesses, products, digital systems and ventures designed to solve meaningful problems.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "ETARNITY — Building what comes next.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ETARNITY — Building what comes next.",
    description:
      "A technology-driven parent company building businesses, products, digital systems and ventures designed to solve meaningful problems.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ETARNITY",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-mark.svg`,
  description:
    "ETARNITY is a technology-driven parent company building businesses, products, digital systems and ventures designed to solve meaningful problems.",
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dhaka",
    addressCountry: "BD",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@etarnity.com",
  },
  knowsAbout: [
    "Software Engineering",
    "Artificial Intelligence",
    "Digital Products",
    "Media",
    "Security",
    "Infrastructure",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${editorial.variable} ${monoCorp.variable} font-sans antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Two corporate moods: dark (default, the brand identity) and white.
            Choice persists; system scheme is deliberately not auto-followed. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={["dark", "light"]}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
