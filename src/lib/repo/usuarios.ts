"use client";

import type { LatLng, Rol, Session, Usuario } from "@/types/domain";
import { getDB, setSessionUserId, updateDB } from "./db";

export type NuevoUsuario = {
  rol: Rol;
  departamento: string;
  ciudad: string;
  nombre?: string; // Solo colportor: nombre explícito
};

/** Crea un usuario nuevo (demo) y deja sesión iniciada como él. */
export function crearUsuarioYEntrar(input: NuevoUsuario): Usuario {
  const nombre =
    input.rol === "monitor"
      ? `Monitor · ${input.ciudad}`
      : (input.nombre ?? "").trim() || "Sin nombre";

  const emailBase = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");

  const usuario: Usuario = {
    id: `u_${Math.random().toString(36).slice(2, 10)}`,
    nombre,
    rol: input.rol,
    email: `${emailBase || "usuario"}@demo.local`,
    avatar: null,
    departamento: input.departamento,
    ciudad: input.ciudad,
    ubicacion: null,
    ubicacion_actualizada_en: null,
  };

  updateDB((db) => ({ ...db, usuarios: [...db.usuarios, usuario] }));
  setSessionUserId(usuario.id);
  return usuario;
}

/**
 * Actualiza la ubicación del usuario en sesión. Regla dura: solo puede escribir
 * su propia fila. Cuando pasemos a Supabase, este mismo control es:
 *   RLS: WITH CHECK (auth.uid() = id)
 */
export function actualizarMiUbicacion(session: Session, coords: LatLng): Usuario | null {
  let updated: Usuario | null = null;
  updateDB((db) => ({
    ...db,
    usuarios: db.usuarios.map((u) => {
      if (u.id !== session.user.id) return u;
      updated = {
        ...u,
        ubicacion: coords,
        ubicacion_actualizada_en: new Date().toISOString(),
      };
      return updated;
    }),
  }));
  return updated;
}

/**
 * Devuelve los colportores de la iglesia que tienen ubicación registrada.
 * Solo accesible para monitor. Cuando haya multi-iglesia, añadir filtro por
 * iglesia_id (y su policy RLS: USING (iglesia_id = current_iglesia())).
 */
export function listColportoresConUbicacion(session: Session): Usuario[] {
  if (!session.esMonitor) return [];
  return getDB().usuarios.filter((u) => u.rol === "colportor" && u.ubicacion);
}
