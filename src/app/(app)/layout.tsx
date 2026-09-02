"use client";

import { Toaster } from "sonner";
import { BottomNav } from "@/components/nav/BottomNav";
import { FabRegistrar } from "@/components/ui/FabRegistrar";
import { useRequireSession } from "@/lib/session/SessionProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = useRequireSession();
  if (!session) return <div className="min-h-screen" />;
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-lg pb-28 safe-top">{children}</main>
      <FabRegistrar />
      <BottomNav />
      <Toaster position="top-center" richColors />
    </div>
  );
}
