import { StatCard } from "@/components/ui/StatCard";

const rangos = ["Hoy", "Semana", "Mes", "Año", "Todo"] as const;

export default function EstadisticasPage() {
  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-semibold tracking-tight">Estadísticas</h1>

      {/* Selector de rango */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
        {rangos.map((r, i) => (
          <button
            key={r}
            className={
              i === 0
                ? "rounded-full bg-(--color-brand) px-3.5 py-1.5 text-xs font-medium text-white"
                : "rounded-full border border-(--color-border) bg-(--color-surface) px-3.5 py-1.5 text-xs font-medium text-(--color-fg-muted)"
            }
          >
            {r}
          </button>
        ))}
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Contactados" value={0} accent="brand" />
        <StatCard label="Interesados" value={0} accent="success" />
        <StatCard label="Seguimientos" value={0} accent="warning" />
        <StatCard label="Asisten" value={0} />
      </section>

      <section className="mt-8 card p-4">
        <h2 className="text-sm font-semibold">Contactos por día</h2>
        <p className="mt-1 text-xs text-(--color-fg-muted)">
          El gráfico se conecta en la Fase 8.
        </p>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {[3, 5, 2, 7, 4, 6, 5].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-md bg-(--color-brand-soft)"
              style={{ height: `${h * 12}px` }}
              aria-hidden
            />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">Ranking del equipo</h2>
        <ul className="mt-3 space-y-2">
          {["Juan", "Carlos", "Pedro"].map((name, i) => (
            <li key={name} className="card flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-brand-soft) text-xs font-semibold text-(--color-brand)">
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{name}</span>
              </div>
              <span className="text-sm text-(--color-fg-muted)">0 contactos</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
