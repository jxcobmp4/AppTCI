"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, type ContactStatus } from "@/components/ui/StatusBadge";
import { useSession } from "@/lib/session/SessionProvider";
import { useDbVersion } from "@/lib/repo/useLive";
import { statsFor } from "@/lib/repo/stats";
import { listActividad } from "@/lib/repo/actividad";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const textoEvento = (tipo: string) => {
  switch (tipo) {
    case "created": return "fue registrada";
    case "status_changed": return "cambió de estado";
    case "note_added": return "recibió una nota";
    case "follow_up_added": return "programó un seguimiento";
    default: return "fue actualizada";
  }
};

export default function InicioPage() {
  const { session } = useSession();
  const v = useDbVersion();

  const { stats, actividad } = useMemo(() => {
    if (!session) return { stats: null, actividad: [] as ReturnType<typeof listActividad> };
    return { stats: statsFor(session), actividad: listActividad(session, 8) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, v]);

  if (!session || !stats) return null;

  return (
    <div className="px-5 pt-6">
      <header>
        <p className="text-sm text-(--color-fg-muted)">Hola, {session.user.nombre.split(" ")[0]} 👋</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {session.esMonitor
            ? "Aquí está lo que pasa en tu iglesia"
            : "¿Listo para salir a compartir?"}
        </h1>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Hoy" value={stats.hoy} hint="personas contactadas" accent="brand" />
        <StatCard label="Esta semana" value={stats.semana} hint="personas contactadas" />
        <StatCard label="Seguimientos" value={stats.seguimientos} hint="pendientes" accent="warning" />
        <StatCard label={session.esMonitor ? "Total iglesia" : "Mi total"} value={stats.total} hint="desde el inicio" />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold">
            {session.esMonitor ? "Actividad del equipo" : "Tu actividad reciente"}
          </h2>
          <Link href="/personas" className="text-xs font-medium text-(--color-brand)">
            Ver todo
          </Link>
        </div>

        {actividad.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-8 text-center">
            <div className="h-10 w-10 rounded-full bg-(--color-brand-soft)" />
            <p className="text-sm font-medium">Aún no hay actividad</p>
            <p className="text-xs text-(--color-fg-muted)">
              Pulsa el botón <span className="text-(--color-brand)">+</span> para registrar tu primer contacto.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {actividad.map((a) => (
              <li key={a.evento.id} className="card flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    <span className="font-medium">{a.contactoNombre}</span>{" "}
                    <span className="text-(--color-fg-muted)">{textoEvento(a.evento.tipo)}</span>
                    {session.esMonitor && (
                      <span className="text-(--color-fg-subtle)"> · {a.actorNombre}</span>
                    )}
                  </p>
                  <p className="text-xs text-(--color-fg-subtle)">
                    hace {formatDistanceToNow(new Date(a.evento.creado_en), { locale: es })}
                  </p>
                </div>
                {a.evento.tipo === "created" && (
                  <StatusBadge status={"contacted" as ContactStatus} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
