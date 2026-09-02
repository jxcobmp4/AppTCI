"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useSession } from "@/lib/session/SessionProvider";
import { useDbVersion } from "@/lib/repo/useLive";
import { listContactos } from "@/lib/repo/contactos";
import { getDB } from "@/lib/repo/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PersonasPage() {
  const { session } = useSession();
  const v = useDbVersion();
  const [q, setQ] = useState("");

  const contactos = useMemo(
    () => (session ? listContactos(session) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, v]
  );

  const usuariosPorId = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of getDB().usuarios) map.set(u.id, u.nombre);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);

  const filtrados = contactos.filter((c) =>
    q.trim() ? c.nombre.toLowerCase().includes(q.toLowerCase()) : true
  );

  if (!session) return null;

  return (
    <div className="px-5 pt-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Personas</h1>
        <span className="text-xs text-(--color-fg-subtle)">
          {contactos.length} {contactos.length === 1 ? "contacto" : "contactos"}
        </span>
      </header>

      {session.esEvangelizador && (
        <p className="mt-1 text-xs text-(--color-fg-muted)">Ves solo las personas que tú registraste.</p>
      )}

      <div className="mt-4 flex gap-2">
        <div className="card flex flex-1 items-center gap-2 px-3 py-2.5">
          <Search size={18} className="text-(--color-fg-subtle)" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-(--color-fg-subtle)"
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-8 card flex flex-col items-center gap-2 p-10 text-center">
          <Users size={28} className="text-(--color-fg-subtle)" />
          <p className="text-sm font-medium">Sin resultados</p>
          <p className="text-xs text-(--color-fg-muted)">
            Registra tu primer contacto con el botón <span className="text-(--color-brand)">+</span>.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {filtrados.map((c) => (
            <li key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.nombre}</p>
                  <p className="mt-0.5 text-xs text-(--color-fg-muted)">
                    {format(new Date(c.creado_en), "d 'de' MMM, HH:mm", { locale: es })}
                    {session.esMonitor && (
                      <> · Registró {usuariosPorId.get(c.evangelizador_id) ?? "—"}</>
                    )}
                  </p>
                  {c.nota && <p className="mt-2 line-clamp-2 text-xs text-(--color-fg-muted)">{c.nota}</p>}
                </div>
                <StatusBadge status={c.estado} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
