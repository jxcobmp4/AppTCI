import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Encuentro",
  description: "Registra y organiza el trabajo de evangelización de tu equipo.",
  applicationName: "Encuentro",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Encuentro",
  },
};

export const viewport: Viewport = {
  themeColor: "#F8FAFC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
