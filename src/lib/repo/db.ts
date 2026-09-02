"use client";

import type { DB } from "@/types/domain";
import seed from "@/lib/demo/seed.json";

const KEY_DB = "encuentro:db";
const KEY_SESSION = "encuentro:sesion";

type Listener = () => void;
const listeners = new Set<Listener>();

function isBrowser() {
  return typeof window !== "undefined";
}

function readRaw(): DB {
  if (!isBrowser()) return seed as unknown as DB;
  try {
    const raw = localStorage.getItem(KEY_DB);
    if (raw) return JSON.parse(raw) as DB;
  } catch {
    // corrupt data — reseed
  }
  const initial = structuredClone(seed) as unknown as DB;
  localStorage.setItem(KEY_DB, JSON.stringify(initial));
  return initial;
}

export function getDB(): DB {
  return readRaw();
}

export function setDB(next: DB) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_DB, JSON.stringify(next));
  for (const l of listeners) l();
}

export function updateDB(mutator: (db: DB) => DB) {
  const next = mutator(getDB());
  setDB(next);
}

export function subscribeDB(listener: Listener): () => void {
  listeners.add(listener);
  if (isBrowser()) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY_DB) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => listeners.delete(listener);
}

export function resetDB() {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_DB, JSON.stringify(structuredClone(seed)));
  for (const l of listeners) l();
}

// ----- sesión demo -----

export function getSessionUserId(): string | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEY_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId?: string };
    return parsed.userId ?? null;
  } catch {
    return null;
  }
}

export function setSessionUserId(userId: string) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_SESSION, JSON.stringify({ userId }));
  for (const l of listeners) l();
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_SESSION);
  for (const l of listeners) l();
}
