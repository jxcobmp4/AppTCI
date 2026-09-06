"use client";

import { BottomNav } from "@/components/nav/BottomNav";
import { FabRegistrar } from "@/components/ui/FabRegistrar";
import { useRequireSession } from "@/lib/session/SessionProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = useRequireSession();
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-lg pb-28 safe-top">
        {session ? children : null}
      </main>
      {session && <FabRegistrar />}
      <BottomNav />
    </div>
  );
}
