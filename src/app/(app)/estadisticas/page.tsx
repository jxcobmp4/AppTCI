"use client";

import { useMemo } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { useSession } from "@/lib/session/SessionProvider";
import { useDbVersion } from "@/lib/repo/useLive";
import { statsFor } from "@/lib/repo/stats";

export default function EstadisticasPage() {
  const { session } = useSession();
  const v = useDbVersion();

  const stats = useMemo(
    () => (session ? statsFor(session) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, v]
  );

  if (!session || !stats) return null;

  const maxDia = Math.max(1, ...stats.porDia.map((d) => d.total));

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {session.esMonitor ? "Estadísticas" : "Mis estadísticas"}
      </h1>
      {session.esColportor && (
        <p className="mt-1 text-xs text-(--color-fg-muted)">Solo tú puedes ver tus números.</p>
      )}

      <section className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Hoy" value={stats.hoy} accent="brand" />
        <StatCard label="Esta semana" value={stats.semana} />
        <StatCard label="Este mes" value={stats.mes} accent="success" />
        <StatCard label="Total" value={stats.total} />
      </section>

      <section className="mt-8 card p-4">
        <h2 className="text-sm font-semibold">Contactos por día (últimos 7)</h2>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {stats.porDia.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-md bg-(--color-brand)"
                style={{ height: `${(d.total / maxDia) * 100}%`, minHeight: "3px", opacity: d.total ? 1 : 0.15 }}
                aria-label={`${d.dia}: ${d.total}`}
              />
              <span className="text-[10px] text-(--color-fg-subtle)">{d.dia}</span>
            </div>
          ))}
        </div>
      </section>

      {session.esMonitor && stats.ranking.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold">Ranking del equipo</h2>
          <ul className="mt-3 space-y-2">
            {stats.ranking.map((r, i) => (
              <li key={r.usuarioId} className="card flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-brand-soft) text-xs font-semibold text-(--color-brand)">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{r.nombre}</span>
                </div>
                <span className="text-sm text-(--color-fg-muted)">
                  {r.total} {r.total === 1 ? "contacto" : "contactos"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
