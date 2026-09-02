"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getDB, getSessionUserId, setSessionUserId } from "@/lib/repo/db";
import type { Usuario } from "@/types/domain";

export default function LoginPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    if (getSessionUserId()) {
      router.replace("/inicio");
      return;
    }
    setUsuarios(getDB().usuarios);
  }, [router]);

  function entrar(id: string) {
    setSessionUserId(id);
    router.push("/inicio");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-(--color-brand) text-lg font-bold text-white">
          E
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido a Encuentro</h1>
        <p className="mt-1 text-sm text-(--color-fg-muted)">
          Modo demo — elige una cuenta para probar la app.
        </p>
      </div>

      <ul className="space-y-2">
        {usuarios.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => entrar(u.id)}
              className="card flex w-full items-center gap-3 p-4 text-left transition hover:bg-(--color-surface-2)"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-brand-soft) text-sm font-semibold text-(--color-brand)">
                {u.nombre.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{u.nombre}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-(--color-fg-muted)">
                  <RoleChip rol={u.rol} />
                  <span>·</span>
                  <span>{u.email}</span>
                </span>
              </span>
              <ChevronRight size={18} className="text-(--color-fg-subtle)" />
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-xs text-(--color-fg-subtle)">
        Autenticación real (magic link con Supabase) en la Fase 3.
      </p>
    </div>
  );
}

function RoleChip({ rol }: { rol: Usuario["rol"] }) {
  const isMonitor = rol === "monitor";
  return (
    <span
      className={
        isMonitor
          ? "rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700"
          : "rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700"
      }
    >
      {isMonitor ? "Monitor" : "Evangelizador"}
    </span>
  );
}
