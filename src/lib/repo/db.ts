"use client";

import type {
  Contacto,
  DB,
  Evento,
  Iglesia,
  LatLng,
  Rol,
  Usuario,
} from "@/types/domain";
import { getSupabase } from "@/lib/supabase/client";

// ---------- Cache en memoria ----------
// Los pages consumen `getDB()` de forma síncrona. La cache se hidrata desde
// Supabase al iniciar sesión, y se mantiene fresca vía Realtime.

const empty = (): DB => ({
  version: 1,
  iglesia: { id: "", nombre: "", ciudad: "", centro: { lat: 0, lng: 0 } },
  usuarios: [],
  contactos: [],
  eventos: [],
});

let cache: DB = empty();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function getDB(): DB {
  return cache;
}

export function subscribeDB(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ---------- Mapeo de filas Supabase → tipos del dominio ----------

type ProfileRow = {
  id: string;
  nombre: string;
  rol: Rol;
  iglesia_id: string;
  departamento: string | null;
  ciudad: string | null;
  ubicacion_lat: number | null;
  ubicacion_lng: number | null;
  ubicacion_actualizada_en: string | null;
};

type IglesiaRow = {
  id: string;
  departamento: string;
  ciudad: string;
  nombre: string;
};

type ContactoRow = {
  id: string;
  nombre: string;
  telefono: string | null;
  estado: Contacto["estado"];
  nota: string;
  colportor_id: string;
  iglesia_id: string;
  creado_en: string;
  actualizado_en: string;
};

type EventoRow = {
  id: string;
  contacto_id: string;
  actor_id: string;
  iglesia_id: string;
  tipo: Evento["tipo"];
  payload: Record<string, unknown>;
  creado_en: string;
};

function toUsuario(r: ProfileRow): Usuario {
  const loc: LatLng | null =
    r.ubicacion_lat != null && r.ubicacion_lng != null
      ? { lat: r.ubicacion_lat, lng: r.ubicacion_lng }
      : null;
  return {
    id: r.id,
    nombre: r.nombre,
    rol: r.rol,
    email: "", // no expuesto vía profiles
    avatar: null,
    departamento: r.departamento,
    ciudad: r.ciudad,
    ubicacion: loc,
    ubicacion_actualizada_en: r.ubicacion_actualizada_en,
  };
}

function toIglesia(r: IglesiaRow, centro: LatLng): Iglesia {
  return { id: r.id, nombre: r.nombre, ciudad: r.ciudad, centro };
}

function toContacto(r: ContactoRow): Contacto {
  return {
    id: r.id,
    nombre: r.nombre,
    telefono: r.telefono,
    estado: r.estado,
    nota: r.nota,
    colportor_id: r.colportor_id,
    iglesia_id: r.iglesia_id,
    creado_en: r.creado_en,
    actualizado_en: r.actualizado_en,
  };
}

function toEvento(r: EventoRow): Evento {
  return {
    id: r.id,
    contacto_id: r.contacto_id,
    actor_id: r.actor_id,
    tipo: r.tipo,
    payload: r.payload,
    creado_en: r.creado_en,
  };
}

// ---------- Hidratación + Realtime ----------

type Unsubscribe = () => void;
let realtimeUnsub: Unsubscribe | null = null;

export async function hydrateFromSupabase(iglesiaId: string, centroFallback: LatLng) {
  const sb = getSupabase();

  const [{ data: iglesia }, { data: usuarios }, { data: contactos }, { data: eventos }] =
    await Promise.all([
      sb.from("iglesias").select("*").eq("id", iglesiaId).maybeSingle(),
      sb.from("profiles").select("*").eq("iglesia_id", iglesiaId),
      sb.from("contactos").select("*").eq("iglesia_id", iglesiaId).order("creado_en", { ascending: false }),
      sb.from("eventos").select("*").eq("iglesia_id", iglesiaId).order("creado_en", { ascending: false }).limit(200),
    ]);

  cache = {
    version: 1,
    iglesia: iglesia
      ? toIglesia(iglesia as IglesiaRow, centroFallback)
      : { id: iglesiaId, nombre: "TCI", ciudad: "", centro: centroFallback },
    usuarios: (usuarios as ProfileRow[] | null)?.map(toUsuario) ?? [],
    contactos: (contactos as ContactoRow[] | null)?.map(toContacto) ?? [],
    eventos: (eventos as EventoRow[] | null)?.map(toEvento) ?? [],
  };
  notify();
}

export function subscribeRealtime(iglesiaId: string): Unsubscribe {
  if (realtimeUnsub) {
    realtimeUnsub();
    realtimeUnsub = null;
  }
  const sb = getSupabase();
  const ch = sb
    .channel(`iglesia:${iglesiaId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles", filter: `iglesia_id=eq.${iglesiaId}` },
      (payload) => applyChange("usuarios", payload)
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "contactos", filter: `iglesia_id=eq.${iglesiaId}` },
      (payload) => applyChange("contactos", payload)
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "eventos", filter: `iglesia_id=eq.${iglesiaId}` },
      (payload) => applyChange("eventos", payload)
    )
    .subscribe();

  realtimeUnsub = () => {
    sb.removeChannel(ch);
    realtimeUnsub = null;
  };
  return realtimeUnsub;
}

type Payload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

function applyChange(kind: "usuarios" | "contactos" | "eventos", payload: Payload) {
  const map = {
    usuarios: (r: unknown) => toUsuario(r as ProfileRow),
    contactos: (r: unknown) => toContacto(r as ContactoRow),
    eventos: (r: unknown) => toEvento(r as EventoRow),
  }[kind];

  const list = cache[kind] as Array<{ id: string }>;
  if (payload.eventType === "INSERT") {
    const item = map(payload.new);
    if (!list.some((x) => x.id === (item as { id: string }).id)) list.unshift(item);
  } else if (payload.eventType === "UPDATE") {
    const item = map(payload.new);
    const idx = list.findIndex((x) => x.id === (item as { id: string }).id);
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
  } else if (payload.eventType === "DELETE") {
    const id = (payload.old as { id?: string }).id;
    const idx = list.findIndex((x) => x.id === id);
    if (idx >= 0) list.splice(idx, 1);
  }
  // Reasigna la referencia del array para que consumidores que comparen por
  // identidad detecten el cambio (aunque nuestro pipeline usa versión/tick).
  (cache as unknown as Record<string, unknown>)[kind] = [...list];
  notify();
}

// ---------- Reset ----------
export function resetCache() {
  cache = empty();
  if (realtimeUnsub) {
    realtimeUnsub();
    realtimeUnsub = null;
  }
  notify();
}

// ---------- Optimistic helpers (usados por las mutaciones) ----------
export function upsertLocal<K extends "usuarios" | "contactos" | "eventos">(
  kind: K,
  item: DB[K][number]
) {
  const list = cache[kind] as Array<{ id: string }>;
  const idx = list.findIndex((x) => x.id === (item as { id: string }).id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  (cache as unknown as Record<string, unknown>)[kind] = [...list];
  notify();
}

export function removeLocal(kind: "usuarios" | "contactos" | "eventos", id: string) {
  const list = cache[kind] as Array<{ id: string }>;
  const idx = list.findIndex((x) => x.id === id);
  if (idx >= 0) list.splice(idx, 1);
  (cache as unknown as Record<string, unknown>)[kind] = [...list];
  notify();
}
