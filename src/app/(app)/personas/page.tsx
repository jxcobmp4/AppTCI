import { Search, SlidersHorizontal, Users } from "lucide-react";

export default function PersonasPage() {
  return (
    <div className="px-5 pt-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Personas</h1>
        <span className="text-xs text-(--color-fg-subtle)">0 contactos</span>
      </header>

      <div className="mt-4 flex gap-2">
        <div className="card flex flex-1 items-center gap-2 px-3 py-2.5">
          <Search size={18} className="text-(--color-fg-subtle)" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-(--color-fg-subtle)"
          />
        </div>
        <button className="card flex h-11 w-11 items-center justify-center" aria-label="Ordenar">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <div className="mt-8 card flex flex-col items-center gap-2 p-10 text-center">
        <Users size={28} className="text-(--color-fg-subtle)" />
        <p className="text-sm font-medium">Aún no hay personas registradas</p>
        <p className="text-xs text-(--color-fg-muted)">
          Cuando registres contactos, aparecerán aquí.
        </p>
      </div>
    </div>
  );
}
