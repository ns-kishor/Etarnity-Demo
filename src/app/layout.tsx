import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Fraunces, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
  weight: ["400", "500"],
});

const SITE_URL = "https://machinafusiongroup.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MachinaFusion — Intelligence that feels",
    template: "%s — MachinaFusion",
  },
  description:
    "MachinaFusion bridges the gap between humanity and robotics — algorithms, AI and autonomous systems engineered as one continuum.",
  keywords: [
    "MachinaFusion",
    "robotics",
    "artificial intelligence",
    "autonomous systems",
    "edge AI",
    "humanoid robotics",
  ],
  authors: [{ name: "MachinaFusion" }],
  creator: "MachinaFusion",
  publisher: "MachinaFusion",
  organizationName: "MachinaFusion",
  applicationName: "MachinaFusion",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/mf-mark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/mf-mark-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [{ url: "/mf-mark.svg" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "MachinaFusion",
    title: "MachinaFusion — Intelligence that feels",
    description:
      "Bridging the gap between humanity and robotics for a smarter, more connected future.",
    images: [
      {
        url: "/og.jpg",
        width: 1344,
        height: 768,
        alt: "MachinaFusion — a human hand and a robotic hand reaching toward each other",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MachinaFusion — Intelligence that feels",
    description:
      "Bridging the gap between humanity and robotics for a smarter, more connected future.",
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
  themeColor: "#f4f4f6",
  width: "device-width",
  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MachinaFusion",
  url: SITE_URL,
  logo: `${SITE_URL}/mf-mark.svg`,
  description:
    "MachinaFusion bridges the gap between humanity and robotics — algorithms, AI and autonomous systems engineered as one continuum.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dhaka",
    addressCountry: "BD",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@machinafusiongroup.com",
  },
  knowsAbout: [
    "Robotics",
    "Artificial Intelligence",
    "Autonomous Systems",
    "Edge AI",
    "Sensor Fusion",
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
        className={`${inter.variable} ${spaceGrotesk.variable} ${editorial.variable} ${monoCorp.variable} font-sans antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Light mood is the primary aesthetic; dark mood is a full inversion.
            Choice persists and never auto-follows the system scheme. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "dark"]}
        >
          <SmoothScrollProvider>
            {children}
            <Toaster />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
