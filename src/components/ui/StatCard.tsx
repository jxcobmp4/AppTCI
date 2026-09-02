import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "brand" | "success" | "warning";
  className?: string;
};

const accents: Record<NonNullable<Props["accent"]>, string> = {
  default: "text-(--color-fg)",
  brand: "text-(--color-brand)",
  success: "text-(--color-success)",
  warning: "text-(--color-warning)",
};

export function StatCard({ label, value, hint, accent = "default", className }: Props) {
  return (
    <div className={cn("card p-4", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-(--color-fg-subtle)">
        {label}
      </p>
      <p className={cn("mt-1.5 text-3xl font-semibold tracking-tight", accents[accent])}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-(--color-fg-muted)">{hint}</p>}
    </div>
  );
}
