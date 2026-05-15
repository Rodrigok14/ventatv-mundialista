import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mundial TV — Edición Argentina",
  description:
    "Smart TVs para vivir el Mundial con colores de la Selección. Stock limitado, envíos a todo el país y entrega en Tucumán en 24 hs.",
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Mundial TV — Edición Argentina",
    description:
      "Viví el Mundial como se merece: Smart TVs 4K, stock limitado, envíos a todo el país y entrega en Tucumán en 24 hs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mundial TV — Edición Argentina",
    description:
      "Smart TVs para vivir el Mundial. Stock limitado, envíos a todo el país y entrega en Tucumán en 24 hs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
