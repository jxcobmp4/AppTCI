"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session, Usuario } from "@/types/domain";
import { getSupabaseOrNull } from "@/lib/supabase/client";
import { hydrateFromSupabase, resetCache, subscribeDB, subscribeRealtime } from "@/lib/repo/db";
import { cerrarSesion } from "@/lib/repo/usuarios";

type Ctx = {
  session: Session | null;
  ready: boolean;
  configError: string | null;
  logout: () => void;
};

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [, force] = useState(0);

  useEffect(() => subscribeDB(() => force((n) => n + 1)), []);

  useEffect(() => {
    let cancelled = false;
    const sb = getSupabaseOrNull();
    if (!sb) {
      setConfigError(
        "Supabase no está configurado. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel y vuelve a desplegar."
      );
      setReady(true);
      return;
    }

    async function cargarProfile(userId: string) {
      const client = sb!;
      try {
        const { data, error } = await client
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          // Tabla no existe / RLS bloqueando / red caída
          setConfigError(
            "No se pudo leer 'profiles' de Supabase. ¿Corriste supabase/migrations/0001_init.sql? (" +
              error.message +
              ")"
          );
          setProfile(null);
          setReady(true);
          return;
        }
        if (!data) {
          setProfile(null);
          setReady(true);
          return;
        }
        const u: Usuario = {
          id: data.id as string,
          nombre: data.nombre as string,
          rol: data.rol as Usuario["rol"],
          email: "",
          avatar: null,
          departamento: (data.departamento as string) ?? null,
          ciudad: (data.ciudad as string) ?? null,
          iglesia_id: data.iglesia_id as string,
          ubicacion:
            data.ubicacion_lat != null && data.ubicacion_lng != null
              ? { lat: data.ubicacion_lat as number, lng: data.ubicacion_lng as number }
              : null,
          ubicacion_actualizada_en: (data.ubicacion_actualizada_en as string) ?? null,
        };
        setProfile(u);
        setReady(true);

        const fallback = { lat: 4.711, lng: -74.0721 };
        try {
          await hydrateFromSupabase(u.iglesia_id!, fallback);
          subscribeRealtime(u.iglesia_id!);
        } catch (e) {
          console.warn("[Supabase] hidratación falló:", e);
        }
      } catch (e) {
        if (cancelled) return;
        setConfigError(
          "Error de conexión con Supabase: " + (e instanceof Error ? e.message : String(e))
        );
        setReady(true);
      }
    }

    sb.auth
      .getUser()
      .then(({ data }) => {
        if (cancelled) return;
        if (data.user) cargarProfile(data.user.id);
        else setReady(true);
      })
      .catch((e) => {
        if (cancelled) return;
        setConfigError("Auth error: " + (e instanceof Error ? e.message : String(e)));
        setReady(true);
      });

    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
      if (cancelled) return;
      if (s?.user) cargarProfile(s.user.id);
      else {
        resetCache();
        setProfile(null);
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const session = useMemo<Session | null>(() => {
    if (!profile) return null;
    return {
      user: profile,
      esMonitor: profile.rol === "monitor",
      esColportor: profile.rol === "colportor",
    };
  }, [profile]);

  const logout = useCallback(async () => {
    await cerrarSesion();
    router.push("/login");
  }, [router]);

  return (
    <SessionCtx.Provider value={{ session, ready, configError, logout }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession fuera de SessionProvider");
  return ctx;
}

export function useRequireSession() {
  const { session, ready } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);
  return session;
}
