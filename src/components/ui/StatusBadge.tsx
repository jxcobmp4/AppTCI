import { cn } from "@/lib/utils";

export type ContactStatus =
  | "contacted"
  | "interested"
  | "follow_up"
  | "attending"
  | "not_interested";

const meta: Record<ContactStatus, { label: string; dot: string; bg: string; fg: string }> = {
  contacted: {
    label: "Contactado",
    dot: "bg-(--color-status-contacted)",
    bg: "bg-amber-50",
    fg: "text-amber-800",
  },
  interested: {
    label: "Interesado",
    dot: "bg-(--color-status-interested)",
    bg: "bg-emerald-50",
    fg: "text-emerald-800",
  },
  follow_up: {
    label: "Seguimiento",
    dot: "bg-(--color-status-follow)",
    bg: "bg-blue-50",
    fg: "text-blue-800",
  },
  attending: {
    label: "Asiste",
    dot: "bg-(--color-status-attending)",
    bg: "bg-violet-50",
    fg: "text-violet-800",
  },
  not_interested: {
    label: "No interesado",
    dot: "bg-(--color-status-not)",
    bg: "bg-red-50",
    fg: "text-red-800",
  },
};

export function StatusBadge({ status, className }: { status: ContactStatus; className?: string }) {
  const m = meta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        m.bg,
        m.fg,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}
