import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Sensei — Coach personal de Manuel",
  description: "Panel de seguimiento Sensei: entreno, nutrición, métricas y conversación con tu coach.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Sensei",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full">{children}</main>
        <footer className="border-t border-[#1a1a1a] mt-10 py-6 text-center text-xs text-neutral-500">
          Sensei v0.6 · Coach personal de Manuel · margital.com
        </footer>
      </body>
    </html>
  );
}
