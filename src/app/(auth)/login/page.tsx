"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/session/SessionProvider";
import { crearUsuarioYEntrar } from "@/lib/repo/usuarios";
import { ciudadesDe, DEPARTAMENTOS } from "@/lib/data/colombia";
import type { Rol } from "@/types/domain";

type Step = { kind: "role" } | { kind: "form"; rol: Rol };

export default function LoginPage() {
  const router = useRouter();
  const { session, ready } = useSession();
  const [step, setStep] = useState<Step>({ kind: "role" });

  // Solo redirigimos cuando la sesión está RESUELTA a un usuario válido.
  // Antes usábamos getSessionUserId() sin verificar el usuario, y un id
  // huérfano provocaba loop /inicio ↔ /login (parpadeo).
  useEffect(() => {
    if (ready && session) router.replace("/inicio");
  }, [ready, session, router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <header className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/logoivpt.png"
          alt="IVPT"
          width={96}
          height={96}
          priority
          className="mb-4 h-24 w-auto"
        />
        <h1 className="text-2xl font-semibold tracking-tight">TCI Operacional</h1>
        <p className="mt-1 text-sm text-(--color-fg-muted)">
          {step.kind === "role"
            ? "¿Cómo vas a ingresar?"
            : step.rol === "monitor"
            ? "Ingreso de monitor"
            : "Ingreso de colportor"}
        </p>
      </header>

      {step.kind === "role" ? (
        <RolePicker onPick={(rol) => setStep({ kind: "form", rol })} />
      ) : (
        <FormRol rol={step.rol} onBack={() => setStep({ kind: "role" })} />
      )}
    </div>
  );
}

function RolePicker({ onPick }: { onPick: (rol: Rol) => void }) {
  return (
    <ul className="space-y-3">
      <li>
        <button
          type="button"
          onClick={() => onPick("monitor")}
          className="card flex w-full items-center gap-4 p-5 text-left transition hover:bg-(--color-surface-2)"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <ShieldCheck size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-base font-semibold">Monitor</span>
            <span className="mt-0.5 block text-xs text-(--color-fg-muted)">
              Acceso completo a la iglesia, equipo y estadísticas.
            </span>
          </span>
          <ChevronRight size={18} className="text-(--color-fg-subtle)" />
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => onPick("colportor")}
          className="card flex w-full items-center gap-4 p-5 text-left transition hover:bg-(--color-surface-2)"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <UserRound size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-base font-semibold">Colportor</span>
            <span className="mt-0.5 block text-xs text-(--color-fg-muted)">
              Registra tus contactos, revisa tus estadísticas y tu ubicación.
            </span>
          </span>
          <ChevronRight size={18} className="text-(--color-fg-subtle)" />
        </button>
      </li>

      <li className="pt-2 text-center">
        <p className="text-[11px] text-(--color-fg-subtle)">
          Modo demo · autenticación real con Supabase en la Fase 3
        </p>
      </li>
    </ul>
  );
}

function FormRol({ rol, onBack }: { rol: Rol; onBack: () => void }) {
  const router = useRouter();
  const [departamento, setDepartamento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const ciudades = useMemo(() => ciudadesDe(departamento), [departamento]);

  const puedeEntrar =
    !!departamento &&
    !!ciudad &&
    !!password.trim() &&
    (rol === "monitor" || nombre.trim().length > 0);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEntrar) return;

    // Reglas de contraseña (modo demo)
    if (rol === "monitor") {
      if (password !== "Admin1") {
        toast.error("Contraseña incorrecta");
        return;
      }
    } else {
      const esperada = `${nombre.trim()}144`;
      if (password !== esperada) {
        toast.error("Contraseña incorrecta");
        return;
      }
    }

    setSaving(true);
    try {
      crearUsuarioYEntrar({
        rol,
        departamento,
        ciudad,
        nombre: rol === "colportor" ? nombre : undefined,
      });
      toast.success("Bienvenido a TCI Operacional");
      router.push("/inicio");
    } catch {
      toast.error("No se pudo iniciar sesión");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-(--color-fg-muted) hover:text-(--color-fg)"
      >
        <ArrowLeft size={14} /> Volver
      </button>

      <Field label="Departamento">
        <select
          value={departamento}
          onChange={(e) => {
            setDepartamento(e.target.value);
            setCiudad("");
          }}
          className="w-full appearance-none rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm outline-none focus:border-(--color-brand)"
        >
          <option value="">Elige un departamento</option>
          {DEPARTAMENTOS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Ciudad">
        <select
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          disabled={!departamento}
          className="w-full appearance-none rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm outline-none focus:border-(--color-brand) disabled:opacity-50"
        >
          <option value="">
            {departamento ? "Elige una ciudad" : "Primero elige un departamento"}
          </option>
          {ciudades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      {rol === "colportor" && (
        <Field label="Nombre">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre y apellido"
            className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm outline-none focus:border-(--color-brand)"
            autoComplete="name"
          />
        </Field>
      )}

      <Field label="Contraseña">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm outline-none focus:border-(--color-brand)"
          autoComplete="current-password"
        />
      </Field>

      <button
        type="submit"
        disabled={!puedeEntrar || saving}
        className="mt-2 w-full rounded-2xl bg-(--color-brand) px-4 py-3.5 text-base font-semibold text-white transition hover:bg-(--color-brand-hover) disabled:opacity-50"
      >
        {saving ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-(--color-fg-muted)">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
