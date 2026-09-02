"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/types/domain";
import {
  clearSession,
  getDB,
  getSessionUserId,
  setSessionUserId,
  subscribeDB,
} from "@/lib/repo/db";

type Ctx = {
  session: Session | null;
  ready: boolean;
  loginAs: (userId: string) => void;
  logout: () => void;
};

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // ready = ya montamos en cliente y leímos localStorage
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setUserId(getSessionUserId());
    setReady(true);
    return subscribeDB(() => {
      setUserId(getSessionUserId());
      setTick((n) => n + 1);
    });
  }, []);

  const session = useMemo<Session | null>(() => {
    if (!userId) return null;
    const user = getDB().usuarios.find((u) => u.id === userId);
    if (!user) return null;
    return {
      user,
      esMonitor: user.rol === "monitor",
      esEvangelizador: user.rol === "evangelizador",
    };
    // Recalcular cuando cambie userId o cuando la DB haya mutado (tick).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tick]);

  const loginAs = useCallback((id: string) => setSessionUserId(id), []);
  const logout = useCallback(() => {
    clearSession();
    router.push("/login");
  }, [router]);

  return (
    <SessionCtx.Provider value={{ session, ready, loginAs, logout }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession fuera de SessionProvider");
  return ctx;
}

/** Envuelve una página cliente que requiere sesión: si no hay, redirige a /login. */
export function useRequireSession() {
  const { session, ready } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);
  return session;
}
