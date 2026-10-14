import type { Metadata, Viewport } from "next";
import { Archivo, Caveat } from "next/font/google";
import { site } from "@/lib/config";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin", "latin-ext"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const caveat = Caveat({ subsets: ["latin", "latin-ext"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "OAT BOMB — Proteinske ovsene kaše", template: "%s | OAT BOMB" },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: site.name,
    images: [{ url: "/images/lifestyle/lineup-five.jpg", width: 1400, height: 1400, alt: "OAT BOMB proteinske kaše u pet ukusa" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export const viewport: Viewport = { themeColor: "#f2efe7", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr-Latn" className={`${archivo.variable} ${caveat.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
