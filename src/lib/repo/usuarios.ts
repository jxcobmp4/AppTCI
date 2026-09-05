"use client";

import type { LatLng, Rol, Session, Usuario } from "@/types/domain";
import { getDB, upsertLocal } from "./db";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Actualiza la ubicación del usuario en sesión. RLS enforcea que
 * WITH CHECK (id = auth.uid()) — imposible escribir en otra fila.
 */
export async function actualizarMiUbicacion(session: Session, coords: LatLng): Promise<Usuario | null> {
  const sb = getSupabase();
  const ahora = new Date().toISOString();
  const { data, error } = await sb
    .from("profiles")
    .update({
      ubicacion_lat: coords.lat,
      ubicacion_lng: coords.lng,
      ubicacion_actualizada_en: ahora,
    })
    .eq("id", session.user.id)
    .select()
    .single();
  if (error || !data) return null;

  const updated: Usuario = {
    ...session.user,
    ubicacion: { lat: coords.lat, lng: coords.lng },
    ubicacion_actualizada_en: ahora,
  };
  upsertLocal("usuarios", updated);
  return updated;
}

/** Solo el monitor puede listar a los colportores de su iglesia. */
export function listColportoresConUbicacion(session: Session): Usuario[] {
  if (!session.esMonitor) return [];
  return getDB().usuarios.filter(
    (u) => u.rol === "colportor" && u.ubicacion
  );
}

// ---------- Signup / Signin ----------
// Reglas de contraseña (modo demo):
//   Monitor    → siempre "Admin1"
//   Colportor  → nombre pegado con "144" (ej: "Valentina144")
//
// Como Supabase Auth requiere email + password, usamos un email sintético
// derivado del rol + ciudad + nombre. Es determinístico: distintos usuarios
// con los mismos datos comparten la misma cuenta (lo cual es lo que queremos
// para que Ana en su teléfono y Ana en su tablet vean lo mismo).

type SignupInput = {
  rol: Rol;
  departamento: string;
  ciudad: string;
  nombre?: string; // solo colportor
};

function normaliza(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");
}

export function emailPara(input: SignupInput): string {
  const dept = normaliza(input.departamento);
  const ciudad = normaliza(input.ciudad);
  if (input.rol === "monitor") {
    return `monitor.${ciudad}.${dept}@tci-operacional.app`;
  }
  const nombre = normaliza(input.nombre ?? "sin.nombre");
  return `col.${nombre}.${ciudad}.${dept}@tci-operacional.app`;
}

export function nombreVisible(input: SignupInput): string {
  if (input.rol === "monitor") return `Monitor · ${input.ciudad}`;
  return (input.nombre ?? "").trim() || "Sin nombre";
}

/**
 * Sign-in con el password que el usuario escribió. Si el usuario no existe,
 * lo crea (signUp), lo loguea y crea su fila en `profiles` con su iglesia.
 * Devuelve el userId autenticado o lanza un Error con mensaje amigable.
 */
export async function entrarConCredenciales(
  input: SignupInput,
  password: string
): Promise<string> {
  const sb = getSupabase();
  const email = emailPara(input);

  // Intento de login directo
  const signIn = await sb.auth.signInWithPassword({ email, password });
  if (signIn.data.user) {
    await asegurarProfile(input);
    return signIn.data.user.id;
  }

  // Si no existe → crear cuenta
  const signUp = await sb.auth.signUp({ email, password });
  if (signUp.error) {
    // Si el error es "invalid credentials" (existe pero password mal), lo indicamos
    if (/invalid.*credentials|already/i.test(signIn.error?.message ?? "")) {
      throw new Error("Contraseña incorrecta");
    }
    throw new Error(signUp.error.message);
  }
  // signUp puede requerir confirmación de email; forzamos signIn si no hay session
  if (!signUp.data.session) {
    const retry = await sb.auth.signInWithPassword({ email, password });
    if (retry.error || !retry.data.user) {
      throw new Error(
        "Cuenta creada, pero requiere confirmar el email. Desactiva 'Confirm email' en Authentication → Providers → Email en Supabase."
      );
    }
  }

  await asegurarProfile(input);
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error("No se obtuvo el usuario tras signup");
  return data.user.id;
}

async function asegurarProfile(input: SignupInput) {
  const sb = getSupabase();
  const { data: userRes } = await sb.auth.getUser();
  const user = userRes.user;
  if (!user) return;

  // Verifica si ya existe el profile
  const { data: existing } = await sb.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (existing) return;

  // Obtiene o crea la iglesia por (dept, ciudad) vía RPC security definer
  const { data: iglesiaId, error: eIgl } = await sb.rpc("get_or_create_iglesia", {
    p_departamento: input.departamento,
    p_ciudad: input.ciudad,
  });
  if (eIgl || !iglesiaId) throw new Error(eIgl?.message ?? "No se pudo asignar iglesia");

  const { error: eProf } = await sb.from("profiles").insert({
    id: user.id,
    nombre: nombreVisible(input),
    rol: input.rol,
    iglesia_id: iglesiaId as string,
    departamento: input.departamento,
    ciudad: input.ciudad,
  });
  if (eProf) throw new Error(eProf.message);
}

export async function cerrarSesion(): Promise<void> {
  const sb = getSupabase();
  await sb.auth.signOut();
}
