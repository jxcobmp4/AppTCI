import { BottomNav } from "@/components/nav/BottomNav";
import { FabRegistrar } from "@/components/ui/FabRegistrar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-lg pb-28 safe-top">{children}</main>
      <FabRegistrar />
      <BottomNav />
    </div>
  );
}
