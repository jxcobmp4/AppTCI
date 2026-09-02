"use client";

import type { EstadoContacto } from "@/types/domain";
import { cn } from "@/lib/utils";

const opciones: Array<{ value: EstadoContacto; label: string; dot: string }> = [
  { value: "contacted",     label: "Contactado",   dot: "bg-(--color-status-contacted)" },
  { value: "interested",    label: "Interesado",   dot: "bg-(--color-status-interested)" },
  { value: "follow_up",     label: "Seguimiento",  dot: "bg-(--color-status-follow)" },
  { value: "attending",     label: "Asiste",       dot: "bg-(--color-status-attending)" },
  { value: "not_interested", label: "No interesado", dot: "bg-(--color-status-not)" },
];

export function EstadoPicker({
  value,
  onChange,
}: {
  value: EstadoContacto;
  onChange: (v: EstadoContacto) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {opciones.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition",
              active
                ? "border-(--color-brand) bg-(--color-brand-soft) text-(--color-brand)"
                : "border-(--color-border) bg-(--color-surface) text-(--color-fg-muted) hover:bg-(--color-surface-2)"
            )}
            aria-pressed={active}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", o.dot)} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
