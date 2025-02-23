import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vaporwaver - Create Vaporwave Style Images online",
  description: "Free online tool to transform your images into vaporwave aesthetic. Create retro-styled, glitch art, and aesthetic edits with various effects and filters.",
  keywords: ["vaporwave", "aesthetic generator", "image editor", "retro effects", "glitch art", "photo effects", "synthwave", "80s style", "aesthetic editor", "vaporwave creator", "photo manipulation", "nostalgic effects", "retro art", "digital art", "online image editor"],
  authors: [{ name: "dilaouid" }],
  metadataBase: new URL('https://vaporwaver.dilaouid.fr'),
  openGraph: {
    title: 'vaporwaver - Create Vaporwave Style Images',
    description: 'Transform your images into vaporwave aesthetic with our free online tool. Create stunning retro-styled artwork instantly.',
    type: 'website',
    images: ['/og-image.jpg'],
    siteName: 'Vaporwaver',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'vaporwaver - Vaporwave Image Creator',
    description: 'Create stunning vaporwave-style images with our free online tool. Transform your photos into aesthetic masterpieces.',
    images: ['/og-image.jpg'],
    creator: '@dilaouid',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Image Editor',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <QueryProvider>
        {children}</QueryProvider>
      </body>
    </html>
  );
}
