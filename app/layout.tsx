import type { Metadata, Viewport } from "next";
import { Space_Mono, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

// Tipografía de máquina de escribir para títulos y la identidad de la app
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ejercicio y Movimiento",
  description: "Tu laboratorio personal de rutina, energía y progreso.",
};

export const viewport: Viewport = {
  themeColor: "#45342A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${mono.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
