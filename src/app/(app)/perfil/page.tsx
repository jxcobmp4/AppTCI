import { LogOut, Settings, Users } from "lucide-react";

export default function PerfilPage() {
  return (
    <div className="px-5 pt-6">
      <header className="card flex items-center gap-4 p-5">
        <div className="h-14 w-14 rounded-full bg-(--color-brand-soft)" />
        <div>
          <p className="text-base font-semibold">Invitado</p>
          <p className="text-xs text-(--color-fg-muted)">La sesión llega en la Fase 3</p>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs text-(--color-fg-subtle)">Este mes</p>
          <p className="mt-1 text-2xl font-semibold">0</p>
          <p className="text-xs text-(--color-fg-muted)">contactos</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-(--color-fg-subtle)">Total</p>
          <p className="mt-1 text-2xl font-semibold">0</p>
          <p className="text-xs text-(--color-fg-muted)">contactos</p>
        </div>
      </section>

      <nav className="mt-6 space-y-2">
        <MenuItem icon={<Users size={18} />} label="Equipo" hint="Solo admin" />
        <MenuItem icon={<Settings size={18} />} label="Configuración" />
        <MenuItem icon={<LogOut size={18} />} label="Cerrar sesión" danger />
      </nav>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  hint,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className="card flex w-full items-center justify-between p-4 text-left transition hover:bg-(--color-surface-2)"
    >
      <span className="flex items-center gap-3">
        <span
          className={
            danger
              ? "text-(--color-error)"
              : "text-(--color-fg-muted)"
          }
        >
          {icon}
        </span>
        <span className={danger ? "text-sm font-medium text-(--color-error)" : "text-sm font-medium"}>
          {label}
        </span>
      </span>
      {hint && <span className="text-xs text-(--color-fg-subtle)">{hint}</span>}
    </button>
  );
}
