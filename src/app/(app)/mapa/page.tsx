"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EyeOff, MapPin, Loader2, AlertCircle, Maximize2, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MapaLive } from "@/components/map/MapaLive";
import { useSession } from "@/lib/session/SessionProvider";
import { useDbVersion } from "@/lib/repo/useLive";
import { actualizarMiUbicacion, listColportoresConUbicacion } from "@/lib/repo/usuarios";
import { getDB } from "@/lib/repo/db";
import { coordsDe } from "@/lib/data/colombia";
import { cn } from "@/lib/utils";

type Estado = "idle" | "pidiendo" | "denegado" | "error";

export default function MapaPage() {
  const { session } = useSession();
  const v = useDbVersion();
  const [estado, setEstado] = useState<Estado>("idle");
  const [fullscreen, setFullscreen] = useState(false);

  const data = useMemo(() => {
    if (!session) return null;
    // Centro del mapa: la ciudad que el usuario eligió al entrar. Fallback:
    // el centro de la iglesia demo (Bogotá) si por alguna razón no hay match.
    const centro =
      coordsDe(session.user.departamento ?? "", session.user.ciudad ?? "") ??
      getDB().iglesia.centro;
    if (session.esMonitor) {
      return {
        modo: "monitor" as const,
        centro,
        yo: session.user,
        colportores: listColportoresConUbicacion(session),
      };
    }
    return {
      modo: "colportor" as const,
      centro,
      yo: session.user,
      ubicacionYo: session.user.ubicacion ?? null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, v]);

  const actualizar = useCallback(() => {
    if (!session) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setEstado("error");
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }
    setEstado("pidiendo");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const ok = await actualizarMiUbicacion(session, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setEstado("idle");
        if (ok) toast.success("Ubicación actualizada ✓");
        else toast.error("No se pudo guardar tu ubicación");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setEstado("denegado");
          toast.error("Debes permitir el acceso a tu ubicación");
        } else {
          setEstado("error");
          toast.error("No se pudo obtener tu ubicación");
        }
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    );
  }, [session]);

  // ESC sale de pantalla completa
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  // El botón dispara request/exit en el contexto de gesto del usuario
  // (imprescindible: los navegadores rechazan requestFullscreen fuera de
  // un event handler). El overlay CSS cubre el layout si la API se rechaza.
  const enterFullscreen = useCallback(() => {
    setFullscreen(true);
    document.documentElement.requestFullscreen?.().catch(() => {
      /* iOS Safari u otros: seguimos con el overlay CSS */
    });
  }, []);
  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  if (!session || !data) return null;

  const yo = session.user;
  const hace = yo.ubicacion_actualizada_en
    ? formatDistanceToNow(new Date(yo.ubicacion_actualizada_en), { locale: es })
    : null;

  return (
    <div
      className={cn(
        "relative",
        fullscreen
          ? "fixed inset-0 z-[60] h-screen w-screen bg-(--color-bg)"
          : "h-[calc(100vh-6rem)]"
      )}
    >
      {/* Chip informativo arriba */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-2 p-4">
        {data.modo === "monitor" ? (
          <div className="card px-3 py-1.5 text-xs font-medium text-(--color-fg-muted)">
            {data.colportores.length} colportor{data.colportores.length === 1 ? "" : "es"} con ubicación activa
          </div>
        ) : (
          <div className="card flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-(--color-fg-muted)">
            <EyeOff size={14} />
            Solo tú ves tu ubicación
          </div>
        )}
      </div>

      {/* Botón fullscreen — solo monitor, esquina superior derecha */}
      {data.modo === "monitor" && (
        <div className="absolute right-3 top-3 z-20">
          {!fullscreen ? (
            <button
              type="button"
              onClick={enterFullscreen}
              className="flex items-center gap-1.5 rounded-full bg-(--color-surface) px-3 py-2 text-xs font-semibold text-(--color-fg) shadow-lifted ring-1 ring-(--color-border) transition hover:bg-(--color-surface-2)"
              aria-label="Ver mapa en pantalla completa"
            >
              <Maximize2 size={14} />
              <span className="hidden sm:inline">Ver en pantalla completa</span>
              <span className="sm:hidden">Pantalla completa</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={exitFullscreen}
              className="flex items-center gap-1.5 rounded-full bg-(--color-fg) px-3 py-2 text-xs font-semibold text-white shadow-lifted transition hover:bg-black"
              aria-label="Salir de pantalla completa"
            >
              <X size={14} />
              Salir de pantalla completa
            </button>
          )}
        </div>
      )}

      {data.modo === "monitor" ? (
        <MapaLive
          modo="monitor"
          centro={data.centro}
          yo={data.yo}
          colportores={data.colportores}
        />
      ) : (
        <MapaLive
          modo="colportor"
          centro={data.centro}
          yo={data.yo}
          ubicacionYo={data.ubicacionYo}
        />
      )}

      {/* Botón "Actualizar mi ubicación" — visible para ambos roles */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 mx-auto max-w-md px-4">
        <div className="pointer-events-auto card space-y-2 p-3 shadow-lifted">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold">Mi ubicación</p>
              <p className="mt-0.5 truncate text-[11px] text-(--color-fg-muted)">
                {yo.ubicacion
                  ? <>Última actualización: <span className="font-medium text-(--color-fg)">hace {hace}</span></>
                  : "Sin ubicación registrada"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={actualizar}
            disabled={estado === "pidiendo"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-(--color-brand) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-hover) disabled:opacity-60"
          >
            {estado === "pidiendo" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <MapPin size={16} />
                Actualizar mi ubicación
              </>
            )}
          </button>

          {estado === "denegado" && (
            <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>
                No hemos podido acceder a tu ubicación. Activa el permiso en los ajustes de tu navegador y vuelve a intentarlo.
              </span>
            </div>
          )}
          {estado === "error" && (
            <div className="flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] text-red-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>No se pudo obtener tu ubicación. Verifica que el GPS esté activo e intenta de nuevo.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
