import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { SessionProvider } from "@/lib/session/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TCI Operacional",
  description: "Gestión de colportores para tu iglesia.",
  applicationName: "TCI Operacional",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TCI Operacional",
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
      <body>
        <SessionProvider>{children}</SessionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
