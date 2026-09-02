"use client";

import { useState } from "react";
import Image from "next/image";
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
            className="pointer-events-auto absolute right-5 bottom-0 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-surface) shadow-[0_10px_30px_-8px_rgba(15,23,42,0.35)] ring-1 ring-(--color-border) transition active:scale-95 hover:bg-(--color-surface-2)"
            aria-label="Registrar contacto"
          >
            <Image src="/logoivpt.png" alt="Registrar" width={44} height={44} className="h-9 w-auto" priority />
          </button>
        </div>
      </div>
      <RegistrarSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
