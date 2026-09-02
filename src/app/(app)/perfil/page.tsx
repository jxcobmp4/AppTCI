"use client";

import { useMemo } from "react";
import { LogOut, RefreshCcw, Users } from "lucide-react";
import { useSession } from "@/lib/session/SessionProvider";
import { useDbVersion } from "@/lib/repo/useLive";
import { statsFor } from "@/lib/repo/stats";
import { getDB, resetDB } from "@/lib/repo/db";
import { toast } from "sonner";

export default function PerfilPage() {
  const { session, logout } = useSession();
  const v = useDbVersion();

  const stats = useMemo(
    () => (session ? statsFor(session) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, v]
  );

  if (!session || !stats) return null;

  const iniciales = session.user.nombre
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  const evangelizadores = getDB().usuarios.filter((u) => u.rol === "evangelizador");

  return (
    <div className="px-5 pt-6">
      <header className="card flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--color-brand-soft) text-lg font-semibold text-(--color-brand)">
          {iniciales}
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold">{session.user.nombre}</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={
                session.esMonitor
                  ? "rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700"
                  : "rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700"
              }
            >
              {session.esMonitor ? "Monitor" : "Evangelizador"}
            </span>
            <span className="text-xs text-(--color-fg-muted)">{session.user.email}</span>
          </div>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <MiniStat label="Hoy" value={stats.hoy} />
        <MiniStat label="Semana" value={stats.semana} />
        <MiniStat label="Total" value={stats.total} />
      </section>

      {session.esMonitor && evangelizadores.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Users size={16} /> Equipo
          </h2>
          <ul className="space-y-2">
            {evangelizadores.map((e) => (
              <li key={e.id} className="card flex items-center gap-3 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-brand-soft) text-xs font-semibold text-(--color-brand)">
                  {e.nombre.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.nombre}</p>
                  <p className="text-xs text-(--color-fg-muted)">{e.email}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 space-y-2">
        <button
          type="button"
          onClick={logout}
          className="card flex w-full items-center gap-3 p-4 text-left transition hover:bg-(--color-surface-2)"
        >
          <RefreshCcw size={18} className="text-(--color-fg-muted)" />
          <span className="text-sm font-medium">Cambiar cuenta demo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm("Restaurar todos los datos de la demo. ¿Continuar?")) {
              resetDB();
              toast.success("Datos demo restaurados");
            }
          }}
          className="card flex w-full items-center gap-3 p-4 text-left transition hover:bg-(--color-surface-2)"
        >
          <LogOut size={18} className="text-(--color-error)" />
          <span className="text-sm font-medium text-(--color-error)">Reiniciar datos demo</span>
        </button>
      </section>

      <p className="mt-6 text-center text-xs text-(--color-fg-subtle)">
        Modo demo · datos guardados solo en este dispositivo
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wide text-(--color-fg-subtle)">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
