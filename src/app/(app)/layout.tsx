"use client";

import { Toaster } from "sonner";
import { BottomNav } from "@/components/nav/BottomNav";
import { FabRegistrar } from "@/components/ui/FabRegistrar";
import { useRequireSession } from "@/lib/session/SessionProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = useRequireSession();
  // Mantenemos siempre el shell (nav + fab) montado para evitar el flash
  // entre "sesión null" y "sesión lista". El contenido solo se pinta cuando
  // hay sesión; si no hay, useRequireSession ya redirige a /login.
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-lg pb-28 safe-top">
        {session ? children : null}
      </main>
      {session && <FabRegistrar />}
      <BottomNav />
      <Toaster position="top-center" richColors />
    </div>
  );
}
