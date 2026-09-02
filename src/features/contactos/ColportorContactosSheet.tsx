"use client";

import { useMemo, useState } from "react";
import { X, Phone, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ContactoDetalleSheet } from "./ContactoDetalleSheet";
import { getDB } from "@/lib/repo/db";
import type { Contacto } from "@/types/domain";

type Props = {
  colportorId: string | null;
  onClose: () => void;
};

export function ColportorContactosSheet({ colportorId, onClose }: Props) {
  const [detalle, setDetalle] = useState<Contacto | null>(null);

  const data = useMemo(() => {
    if (!colportorId) return null;
    const db = getDB();
    const colportor = db.usuarios.find((u) => u.id === colportorId);
    if (!colportor) return null;
    const contactos = db.contactos
      .filter((c) => c.colportor_id === colportorId)
      .sort((a, b) => b.creado_en.localeCompare(a.creado_en));
    return { colportor, contactos };
  }, [colportorId]);

  if (!data) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={`Contactos de ${data.colportor.nombre}`}>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />

        <div
          className="absolute inset-x-0 bottom-0 mx-auto max-h-[85vh] max-w-lg overflow-y-auto rounded-t-3xl bg-(--color-surface) p-5 shadow-[0_-8px_40px_-10px_rgba(15,23,42,0.25)] safe-bottom"
          style={{ animation: "slideUp 220ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-(--color-border)" aria-hidden />

          <header className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-brand-soft) text-sm font-semibold text-(--color-brand)">
                {data.colportor.nombre.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </span>
              <div>
                <h2 className="text-lg font-semibold">{data.colportor.nombre}</h2>
                <p className="text-xs text-(--color-fg-muted)">
                  {data.contactos.length}{" "}
                  {data.contactos.length === 1 ? "contacto registrado" : "contactos registrados"}
                  {data.colportor.ciudad && ` · ${data.colportor.ciudad}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-(--color-fg-muted) hover:bg-(--color-surface-2)"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </header>

          {data.contactos.length === 0 ? (
            <div className="rounded-xl border border-(--color-border) bg-(--color-surface-2)/40 p-8 text-center">
              <p className="text-sm text-(--color-fg-muted)">Aún no ha registrado personas.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.contactos.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setDetalle(c)}
                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3 text-left transition hover:bg-(--color-surface-2)"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.nombre}</p>
                      <p className="mt-0.5 text-xs text-(--color-fg-muted)">
                        {format(new Date(c.creado_en), "d 'de' MMM, HH:mm", { locale: es })}
                      </p>
                      {c.telefono && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-(--color-brand)">
                          <Phone size={12} />
                          {c.telefono}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={c.estado} />
                      <ChevronRight size={14} className="text-(--color-fg-subtle)" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ContactoDetalleSheet
        contacto={detalle}
        onClose={() => setDetalle(null)}
      />
    </>
  );
}
