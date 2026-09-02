"use client";

import { useMemo, useState } from "react";
import { Search, Users, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useSession } from "@/lib/session/SessionProvider";
import { useDbVersion } from "@/lib/repo/useLive";
import { listContactos, eliminarContacto, puedeEliminar } from "@/lib/repo/contactos";
import { getDB } from "@/lib/repo/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Contacto } from "@/types/domain";

export default function PersonasPage() {
  const { session } = useSession();
  const v = useDbVersion();
  const [q, setQ] = useState("");
  const [confirming, setConfirming] = useState<Contacto | null>(null);

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

  function onDelete(c: Contacto) {
    if (!session) return;
    const ok = eliminarContacto(session, c.id);
    if (ok) toast.success(`${c.nombre} eliminada`);
    else toast.error("No tienes permiso para eliminar esta persona");
    setConfirming(null);
  }

  return (
    <div className="px-5 pt-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Personas</h1>
        <span className="text-xs text-(--color-fg-subtle)">
          {contactos.length} {contactos.length === 1 ? "contacto" : "contactos"}
        </span>
      </header>

      {session.esColportor && (
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
          {filtrados.map((c) => {
            const canDelete = puedeEliminar(session, c);
            return (
              <li key={c.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.nombre}</p>
                    <p className="mt-0.5 text-xs text-(--color-fg-muted)">
                      {format(new Date(c.creado_en), "d 'de' MMM, HH:mm", { locale: es })}
                      {session.esMonitor && (
                        <> · Registró {usuariosPorId.get(c.colportor_id) ?? "—"}</>
                      )}
                    </p>
                    {c.telefono && (
                      <a
                        href={`tel:${c.telefono.replace(/\s+/g, "")}`}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-(--color-brand)"
                      >
                        <Phone size={12} />
                        {c.telefono}
                      </a>
                    )}
                    {c.nota && <p className="mt-2 line-clamp-2 text-xs text-(--color-fg-muted)">{c.nota}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={c.estado} />
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setConfirming(c)}
                        className="rounded-lg p-1.5 text-(--color-fg-subtle) transition hover:bg-red-50 hover:text-(--color-error)"
                        aria-label={`Eliminar ${c.nombre}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Confirmación de borrado */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Cancelar"
            onClick={() => setConfirming(null)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-(--color-surface) p-5 shadow-lg">
            <h3 className="text-base font-semibold">¿Eliminar a {confirming.nombre}?</h3>
            <p className="mt-1 text-sm text-(--color-fg-muted)">
              Se borrará el registro y su historial. Esta acción no se puede deshacer.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="flex-1 rounded-xl border border-(--color-border) px-4 py-2.5 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => onDelete(confirming)}
                className="flex-1 rounded-xl bg-(--color-error) px-4 py-2.5 text-sm font-semibold text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
