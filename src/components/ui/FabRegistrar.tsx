"use client";

import { Plus } from "lucide-react";

export function FabRegistrar() {
  return (
    <button
      type="button"
      onClick={() => {
        // TODO: abrir bottom-sheet de registro (Fase 5)
        alert("Registro de contacto — Fase 5");
      }}
      className="fixed right-5 bottom-24 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-brand) text-white shadow-[0_10px_30px_-8px_rgba(79,70,229,0.55)] transition active:scale-95 hover:bg-(--color-brand-hover) safe-bottom"
      aria-label="Registrar contacto"
    >
      <Plus size={26} strokeWidth={2.6} />
    </button>
  );
}
