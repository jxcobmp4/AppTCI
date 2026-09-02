"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { RegistrarSheet } from "@/features/registro/RegistrarSheet";

export function FabRegistrar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 safe-bottom">
        <div className="pointer-events-none relative mx-auto h-0 max-w-lg">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pointer-events-auto absolute right-5 bottom-0 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-brand) text-white shadow-[0_10px_30px_-8px_rgba(79,70,229,0.55)] transition active:scale-95 hover:bg-(--color-brand-hover)"
            aria-label="Registrar contacto"
          >
            <Plus size={26} strokeWidth={2.6} />
          </button>
        </div>
      </div>
      <RegistrarSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
