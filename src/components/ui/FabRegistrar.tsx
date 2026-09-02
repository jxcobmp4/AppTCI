"use client";

import { useState } from "react";
import Image from "next/image";
import { RegistrarSheet } from "@/features/registro/RegistrarSheet";

export function FabRegistrar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-5 bottom-24 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-surface) shadow-[0_10px_30px_-8px_rgba(15,23,42,0.35)] ring-1 ring-(--color-border) transition active:scale-95 hover:bg-(--color-surface-2) safe-bottom"
        aria-label="Registrar contacto"
      >
        <Image src="/logoivpt.png" alt="Registrar" width={44} height={44} className="h-9 w-auto" priority />
      </button>
      <RegistrarSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
