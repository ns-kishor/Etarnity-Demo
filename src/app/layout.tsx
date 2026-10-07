import type { Metadata, Viewport } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { site, founders } from "@/content/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const monoCorp = JetBrains_Mono({
  variable: "--font-mono-corp",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const SITE_URL = site.url;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ETARNITY — Building what comes next.",
    template: "%s — ETARNITY",
  },
  description: site.description,
  keywords: [
    "ETARNITY",
    "parent company",
    "technology",
    "businesses",
    "ventures",
    "artificial intelligence",
    "software engineering",
    "digital products",
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
    icon: [{ url: "/logo-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo-mark.svg" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ETARNITY",
    title: "ETARNITY — Building what comes next.",
    description: site.description,
    images: [
      {
        url: "/og.jpg",
        width: 1344,
        height: 768,
        alt: "ETARNITY — a technology-driven parent company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ETARNITY — Building what comes next.",
    description: site.description,
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
  themeColor: "#f8f8f4",
  width: "device-width",
  initialScale: 1,
};

/* Corporate SEO — Organization + WebSite + Person (founders) schemas. */
const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-mark.svg`,
    description: site.description,
    foundingDate: site.founded,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.hq.city,
      addressCountry: "BD",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "corporate inquiries",
      email: site.email,
    },
    knowsAbout: [
      "Software Engineering",
      "Applied AI",
      "Digital Products",
      "Cloud Infrastructure",
      "Security",
      "Digital Media",
    ],
    founder: founders.map((f) => ({
      "@type": "Person",
      name: f.name,
      jobTitle: f.role,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ETARNITY",
    url: SITE_URL,
  },
  ...founders.map((f) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: f.name,
    jobTitle: f.role,
    description: f.bio,
    affiliation: { "@type": "Organization", name: "ETARNITY" },
  })),
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${monoCorp.variable} font-sans antialiased bg-background text-foreground`}
      >
        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        {/* Light-only bright editorial aesthetic — the canvas is the brand. */}
        <SmoothScrollProvider>
          {children}
          <Toaster />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
