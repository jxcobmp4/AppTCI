import { Map as MapIcon, Filter, Search } from "lucide-react";

export default function MapaPage() {
  return (
    <div className="relative h-[calc(100vh-6rem)]">
      {/* Barra de búsqueda y filtros flotantes */}
      <div className="absolute inset-x-0 top-0 z-10 flex gap-2 p-4">
        <div className="card flex flex-1 items-center gap-2 px-3 py-2.5">
          <Search size={18} className="text-(--color-fg-subtle)" />
          <input
            type="search"
            placeholder="Buscar por nombre..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-(--color-fg-subtle)"
          />
        </div>
        <button
          className="card flex h-11 w-11 items-center justify-center"
          aria-label="Filtros"
        >
          <Filter size={18} />
        </button>
      </div>

      {/* Placeholder del mapa — se sustituye por MapLibre en Fase 6 */}
      <div className="flex h-full flex-col items-center justify-center bg-(--color-surface-2) text-(--color-fg-subtle)">
        <MapIcon size={40} />
        <p className="mt-2 text-sm">El mapa llegará en la Fase 6</p>
      </div>
    </div>
  );
}
