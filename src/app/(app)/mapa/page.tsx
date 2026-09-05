"use client";

import { useCallback, useMemo, useState } from "react";
import { EyeOff, MapPin, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MapaLive } from "@/components/map/MapaLive";
import { useSession } from "@/lib/session/SessionProvider";
import { useDbVersion } from "@/lib/repo/useLive";
import { actualizarMiUbicacion, listColportoresConUbicacion } from "@/lib/repo/usuarios";
import { getDB } from "@/lib/repo/db";

type Estado = "idle" | "pidiendo" | "denegado" | "error";

export default function MapaPage() {
  const { session } = useSession();
  const v = useDbVersion();
  const [estado, setEstado] = useState<Estado>("idle");

  const data = useMemo(() => {
    if (!session) return null;
    const centro = getDB().iglesia.centro;
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
      (pos) => {
        actualizarMiUbicacion(session, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        setEstado("idle");
        toast.success("Ubicación actualizada ✓");
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

  if (!session || !data) return null;

  const yo = session.user;
  const hace = yo.ubicacion_actualizada_en
    ? formatDistanceToNow(new Date(yo.ubicacion_actualizada_en), { locale: es })
    : null;

  return (
    <div className="relative h-[calc(100vh-6rem)]">
      {/* Chip informativo arriba */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-4">
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
