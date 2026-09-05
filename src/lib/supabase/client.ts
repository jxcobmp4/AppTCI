"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;
let checked = false;

/** Devuelve el cliente Supabase o null si faltan las variables de entorno. */
export function getSupabaseOrNull(): SupabaseClient | null {
  if (cached) return cached;
  if (checked) return null;
  checked = true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (typeof window !== "undefined") {
      console.warn(
        "[Supabase] Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
          "Configúralas en Vercel → Project Settings → Environment Variables y redeploy."
      );
    }
    return null;
  }
  cached = createBrowserClient(url, key);
  return cached;
}

/** Igual que arriba pero lanza si no hay cliente (para paths que no pueden degradar). */
export function getSupabase(): SupabaseClient {
  const c = getSupabaseOrNull();
  if (!c) throw new Error("Supabase no está configurado (faltan variables de entorno).");
  return c;
}

export function supabaseConfigured(): boolean {
  return getSupabaseOrNull() !== null;
}
