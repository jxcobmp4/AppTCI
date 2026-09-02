import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

// Datos de ejemplo para el esqueleto. Se conectan a Supabase en fases posteriores.
const stats = [
  { label: "Hoy", value: 0, hint: "personas contactadas", accent: "brand" as const },
  { label: "Esta semana", value: 0, hint: "personas contactadas" },
  { label: "Seguimientos", value: 0, hint: "pendientes", accent: "warning" as const },
  { label: "Total", value: 0, hint: "desde el inicio" },
];

const actividad: Array<{ id: string; texto: string; cuando: string; status?: React.ComponentProps<typeof StatusBadge>["status"] }> = [];

export default function InicioPage() {
  const nombre = "amigo"; // TODO: leer de perfil autenticado (Fase 3)

  return (
    <div className="px-5 pt-6">
      <header>
        <p className="text-sm text-(--color-fg-muted)">Hola, {nombre} 👋</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          ¿Listo para salir a compartir?
        </h1>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold">Actividad reciente</h2>
          <a href="/personas" className="text-xs font-medium text-(--color-brand)">
            Ver todo
          </a>
        </div>

        {actividad.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-8 text-center">
            <div className="h-10 w-10 rounded-full bg-(--color-brand-soft)" />
            <p className="text-sm font-medium">Aún no hay actividad</p>
            <p className="text-xs text-(--color-fg-muted)">
              Pulsa el botón <span className="text-(--color-brand)">+</span> para registrar tu primer contacto.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {actividad.map((a) => (
              <li key={a.id} className="card flex items-center justify-between p-3">
                <div>
                  <p className="text-sm">{a.texto}</p>
                  <p className="text-xs text-(--color-fg-subtle)">{a.cuando}</p>
                </div>
                {a.status && <StatusBadge status={a.status} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
