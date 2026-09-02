"use client";

import type { Evento, Session } from "@/types/domain";
import { getDB } from "./db";

export type ActividadItem = {
  evento: Evento;
  actorNombre: string;
  contactoNombre: string;
};

/** Actividad reciente filtrada por rol. */
export function listActividad(session: Session, limit = 10): ActividadItem[] {
  const db = getDB();
  const eventos = session.esMonitor
    ? db.eventos
    : db.eventos.filter((e) => e.actor_id === session.user.id);

  return [...eventos]
    .sort((a, b) => b.creado_en.localeCompare(a.creado_en))
    .slice(0, limit)
    .map((evento) => {
      const actor = db.usuarios.find((u) => u.id === evento.actor_id);
      const contacto = db.contactos.find((c) => c.id === evento.contacto_id);
      return {
        evento,
        actorNombre: actor?.nombre ?? "—",
        contactoNombre: contacto?.nombre ?? "(contacto eliminado)",
      };
    });
}
