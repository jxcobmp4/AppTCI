"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Users, BarChart3, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/mapa", label: "Mapa", icon: Map },
  { href: "/personas", label: "Personas", icon: Users },
  { href: "/estadisticas", label: "Stats", icon: BarChart3 },
  { href: "/perfil", label: "Perfil", icon: UserCircle2 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-(--color-border) bg-(--color-surface)/85 backdrop-blur-lg safe-bottom"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5 pb-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-(--color-brand)"
                    : "text-(--color-fg-subtle) hover:text-(--color-fg-muted)"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
