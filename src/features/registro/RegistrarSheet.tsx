"use client";

import { useEffect, useRef, useState } from "react";
import { X, MapPin, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { EstadoPicker } from "./EstadoPicker";
import { crearContacto } from "@/lib/repo/contactos";
import { nuevoContactoSchema } from "@/lib/validators/contacto";
import { useSession } from "@/lib/session/SessionProvider";
import type { EstadoContacto, LatLng } from "@/types/domain";

type Props = {
  open: boolean;
  onClose: () => void;
};

type GeoState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; coords: LatLng }
  | { kind: "denied" }
  | { kind: "error" };

export function RegistrarSheet({ open, onClose }: Props) {
  const { session } = useSession();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estado, setEstado] = useState<EstadoContacto>("contacted");
  const [nota, setNota] = useState("");
  const [geo, setGeo] = useState<GeoState>({ kind: "idle" });
  const [saving, setSaving] = useState(false);
  const nombreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setNombre("");
    setTelefono("");
    setEstado("contacted");
    setNota("");
    setGeo({ kind: "idle" });
    const t = setTimeout(() => nombreRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeo({ kind: "error" });
      return;
    }
    setGeo({ kind: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ kind: "ok", coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (err) => setGeo({ kind: err.code === err.PERMISSION_DENIED ? "denied" : "error" }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    const parsed = nuevoContactoSchema.safeParse({
      nombre,
      telefono: telefono || null,
      estado,
      nota: nota || undefined,
      ubicacion: geo.kind === "ok" ? geo.coords : null,
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Datos inválidos";
      toast.error(msg);
      return;
    }
    setSaving(true);
    try {
      crearContacto(session, parsed.data);
      toast.success(`${parsed.data.nombre} registrada`);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Registrar contacto">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <form
        onSubmit={onSubmit}
        className="absolute inset-x-0 bottom-0 mx-auto max-w-lg rounded-t-3xl bg-(--color-surface) p-5 shadow-[0_-8px_40px_-10px_rgba(15,23,42,0.25)] safe-bottom"
        style={{ animation: "slideUp 220ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-(--color-border)" aria-hidden />

        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nueva persona</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-(--color-fg-muted) hover:bg-(--color-surface-2)" aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto">
          <label className="block">
            <span className="text-xs font-medium text-(--color-fg-muted)">Nombre</span>
            <input
              ref={nombreRef}
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la persona"
              className="mt-1 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-base outline-none focus:border-(--color-brand)"
              enterKeyHint="next"
              autoComplete="off"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-(--color-fg-muted)">Teléfono (opcional)</span>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+57 300 123 4567"
              className="mt-1 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-base outline-none focus:border-(--color-brand)"
              enterKeyHint="next"
              autoComplete="off"
              inputMode="tel"
            />
          </label>

          <div>
            <span className="text-xs font-medium text-(--color-fg-muted)">Estado</span>
            <div className="mt-1">
              <EstadoPicker value={estado} onChange={setEstado} />
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-(--color-fg-muted)">Nota (opcional)</span>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder="Ej: Quiere venir el domingo"
              className="mt-1 w-full resize-none rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm outline-none focus:border-(--color-brand)"
            />
          </label>

          <div className="flex items-center gap-2 rounded-xl bg-(--color-surface-2) px-3 py-2.5 text-xs">
            <UbicacionEstado
              geo={geo}
              onRetry={() => {
                setGeo({ kind: "loading" });
                navigator.geolocation.getCurrentPosition(
                  (pos) => setGeo({ kind: "ok", coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
                  (err) => setGeo({ kind: err.code === err.PERMISSION_DENIED ? "denied" : "error" })
                );
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !nombre.trim()}
          className="mt-5 w-full rounded-2xl bg-(--color-brand) px-4 py-3.5 text-base font-semibold text-white transition hover:bg-(--color-brand-hover) disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}

function UbicacionEstado({ geo, onRetry }: { geo: GeoState; onRetry: () => void }) {
  if (geo.kind === "loading") {
    return (
      <>
        <Loader2 size={14} className="animate-spin text-(--color-fg-muted)" />
        <span className="text-(--color-fg-muted)">Obteniendo ubicación aproximada...</span>
      </>
    );
  }
  if (geo.kind === "ok") {
    return (
      <>
        <Check size={14} className="text-(--color-success)" />
        <span className="text-(--color-fg-muted)">Ubicación aproximada obtenida</span>
      </>
    );
  }
  if (geo.kind === "denied") {
    return (
      <>
        <MapPin size={14} className="text-(--color-warning)" />
        <span className="text-(--color-fg-muted)">Sin permiso de ubicación · se guardará sin ella</span>
        <button type="button" onClick={onRetry} className="ml-auto font-medium text-(--color-brand)">Reintentar</button>
      </>
    );
  }
  if (geo.kind === "error") {
    return (
      <>
        <MapPin size={14} className="text-(--color-warning)" />
        <span className="text-(--color-fg-muted)">No se pudo obtener ubicación</span>
        <button type="button" onClick={onRetry} className="ml-auto font-medium text-(--color-brand)">Reintentar</button>
      </>
    );
  }
  return null;
}
