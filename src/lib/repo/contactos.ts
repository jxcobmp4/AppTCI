"use client";

import type { Contacto, EstadoContacto, Session } from "@/types/domain";
import { getDB, removeLocal, upsertLocal } from "./db";
import { getSupabase } from "@/lib/supabase/client";

export type NuevoContacto = {
  nombre: string;
  telefono?: string | null;
  estado: EstadoContacto;
  nota?: string;
};

/** Aplica filtro por rol ANTES de devolver. Monitor: todo. Colportor: solo suyo. */
export function listContactos(session: Session): Contacto[] {
  const { contactos } = getDB();
  const list = session.esMonitor
    ? contactos
    : contactos.filter((c) => c.colportor_id === session.user.id);
  return [...list].sort((a, b) => b.creado_en.localeCompare(a.creado_en));
}

export function getContacto(session: Session, id: string): Contacto | null {
  const c = getDB().contactos.find((x) => x.id === id);
  if (!c) return null;
  if (!session.esMonitor && c.colportor_id !== session.user.id) return null;
  return c;
}

/**
 * Crea un contacto en Supabase (RLS: colportor_id = auth.uid).
 * Actualiza la cache local de forma optimista para respuesta inmediata.
 */
export async function crearContacto(session: Session, input: NuevoContacto): Promise<Contacto> {
  const sb = getSupabase();
  const ahora = new Date().toISOString();
  const iglesia_id = session.user.iglesia_id ?? getDB().iglesia.id;

  const { data, error } = await sb
    .from("contactos")
    .insert({
      nombre: input.nombre.trim(),
      telefono: input.telefono?.trim() ? input.telefono.trim() : null,
      estado: input.estado,
      nota: (input.nota ?? "").trim(),
      colportor_id: session.user.id,
      iglesia_id,
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "No se pudo crear el contacto");

  const nuevo: Contacto = {
    id: data.id as string,
    nombre: data.nombre as string,
    telefono: (data.telefono as string | null) ?? null,
    estado: data.estado as EstadoContacto,
    nota: (data.nota as string) ?? "",
    colportor_id: data.colportor_id as string,
    iglesia_id: data.iglesia_id as string,
    creado_en: data.creado_en as string,
    actualizado_en: data.actualizado_en as string,
  };
  upsertLocal("contactos", nuevo);

  // Evento de creación (best-effort — no bloqueamos el flujo si falla)
  await sb.from("eventos").insert({
    contacto_id: nuevo.id,
    actor_id: session.user.id,
    iglesia_id,
    tipo: "created",
    payload: {},
    creado_en: ahora,
  });

  return nuevo;
}

/** Puede eliminar quien lo creó o cualquier monitor (además enforced por RLS). */
export function puedeEliminar(session: Session, contacto: Contacto): boolean {
  if (session.esMonitor) return true;
  return contacto.colportor_id === session.user.id;
}

export async function eliminarContacto(session: Session, id: string): Promise<boolean> {
  const c = getDB().contactos.find((x) => x.id === id);
  if (!c) return false;
  if (!puedeEliminar(session, c)) return false;

  const sb = getSupabase();
  const iglesia_id = session.user.iglesia_id ?? c.iglesia_id;

  const { error } = await sb.from("contactos").delete().eq("id", id);
  if (error) return false;

  removeLocal("contactos", id);

  await sb.from("eventos").insert({
    contacto_id: id,
    actor_id: session.user.id,
    iglesia_id,
    tipo: "deleted",
    payload: { nombre: c.nombre },
    creado_en: new Date().toISOString(),
  });

  return true;
}
