"use client";

import type { Contacto, EstadoContacto, LatLng, Session } from "@/types/domain";
import { getDB, updateDB } from "./db";

export type NuevoContacto = {
  nombre: string;
  estado: EstadoContacto;
  nota?: string;
  ubicacion?: LatLng | null;
};

// Desplaza la coordenada 30-120 m en dirección aleatoria (privacidad).
function fuzz(loc: LatLng): LatLng {
  const metros = 30 + Math.random() * 90;
  const angulo = Math.random() * Math.PI * 2;
  const dLat = (metros * Math.cos(angulo)) / 111_320;
  const dLng =
    (metros * Math.sin(angulo)) / (111_320 * Math.cos((loc.lat * Math.PI) / 180));
  return { lat: loc.lat + dLat, lng: loc.lng + dLng };
}

/** Aplica filtro por rol ANTES de devolver. Monitor: todo. Evangelizador: solo suyo. */
export function listContactos(session: Session): Contacto[] {
  const { contactos } = getDB();
  const list = session.esMonitor
    ? contactos
    : contactos.filter((c) => c.evangelizador_id === session.user.id);
  return [...list].sort((a, b) => b.creado_en.localeCompare(a.creado_en));
}

export function getContacto(session: Session, id: string): Contacto | null {
  const c = getDB().contactos.find((x) => x.id === id);
  if (!c) return null;
  if (!session.esMonitor && c.evangelizador_id !== session.user.id) return null;
  return c;
}

export function crearContacto(session: Session, input: NuevoContacto): Contacto {
  const ahora = new Date().toISOString();
  const nuevo: Contacto = {
    id: `c_${Math.random().toString(36).slice(2, 10)}`,
    nombre: input.nombre.trim(),
    estado: input.estado,
    nota: (input.nota ?? "").trim(),
    ubicacion: input.ubicacion ? fuzz(input.ubicacion) : null,
    // Regla dura: siempre el usuario en sesión. Ni monitor ni evangelizador pueden
    // asignarlo a otro desde el formulario de registro rápido.
    evangelizador_id: session.user.id,
    iglesia_id: getDB().iglesia.id,
    creado_en: ahora,
    actualizado_en: ahora,
  };
  updateDB((db) => ({
    ...db,
    contactos: [nuevo, ...db.contactos],
    eventos: [
      {
        id: `e_${Math.random().toString(36).slice(2, 10)}`,
        contacto_id: nuevo.id,
        actor_id: session.user.id,
        tipo: "created",
        payload: {},
        creado_en: ahora,
      },
      ...db.eventos,
    ],
  }));
  return nuevo;
}
