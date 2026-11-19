import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oro Blanco Transporte y Logística | Fletes Nacionales desde Rosario",
  description:
    "Empresa de transporte de carga nacional e interprovincial. Especialistas en fletes, logística y conexión con el Puerto de Rosario para importación y exportación. Atención personalizada y presupuesto rápido.",
  keywords: [
    "transporte de carga",
    "fletes Rosario",
    "logística nacional",
    "carga interprovincial",
    "puerto Rosario",
    "importación exportación",
    "carga refrigerada",
    "carga a granel",
  ],
  openGraph: {
    title: "Oro Blanco Transporte y Logística",
    description: "Fletes nacionales e interprovinciales desde Rosario. Presupuesto rápido.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
