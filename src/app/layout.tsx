import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { BRAND } from "@/modules/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${BRAND.name} — ${BRAND.subtitle}`, template: `%s · ${BRAND.name}` },
  description:
    "Plataforma educativa para aprender US30 / Dow Jones e futuros (YM/MYM) do zero ao avançado: market structure, Fibonacci, confluence, gestão de risco, simulação e journal. Exclusivamente educativa — sem sinais.",
  applicationName: BRAND.name,
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070b14",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="min-h-dvh font-sans">
        <ThemeProvider>
          {children}
          <Toaster richColors closeButton position="top-right" theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
