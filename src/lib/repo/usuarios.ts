"use client";

import type { Rol, Usuario } from "@/types/domain";
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
    ubicacion: getDB().iglesia.centro,
  };

  updateDB((db) => ({ ...db, usuarios: [...db.usuarios, usuario] }));
  setSessionUserId(usuario.id);
  return usuario;
}
