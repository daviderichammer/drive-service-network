import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "@/styles/globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://driveservicenetwork.com"
  ),
  title: {
    default: "Drive Service Network — Built by Operators. Designed for Operators.",
    template: "%s | Drive Service Network",
  },
  description:
    "Drive Service Network connects vehicle operators with trusted nationwide repair and maintenance providers. Commercial discounts, fleet management, and simplified scheduling — powered by Openbay.",
  keywords: [
    "fleet maintenance",
    "auto repair",
    "vehicle service",
    "fleet management",
    "Turo host",
    "rental fleet",
    "commercial fleet",
    "nationwide auto repair",
    "Drive Service Network",
    "DSN",
  ],
  authors: [{ name: "Global Drive Holdings Inc." }],
  creator: "Global Drive Holdings Inc.",
  publisher: "Drive Service Network Inc.",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://driveservicenetwork.com",
    siteName: "Drive Service Network",
    title: "Drive Service Network — Built by Operators. Designed for Operators.",
    description:
      "The trusted nationwide platform for vehicle operators seeking reliable repair, maintenance, commercial pricing, and fleet management resources.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Drive Service Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drive Service Network",
    description:
      "Built by Operators. Designed for Operators. Nationwide fleet services platform.",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#1B2B4D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${openSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white font-opensans antialiased">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
