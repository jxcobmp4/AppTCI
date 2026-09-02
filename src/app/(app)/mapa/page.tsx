"use client";

import { useMemo } from "react";
import { EyeOff } from "lucide-react";
import { FakeMapa } from "@/components/map/FakeMapa";
import { useSession } from "@/lib/session/SessionProvider";
import { useDbVersion } from "@/lib/repo/useLive";
import { listContactos } from "@/lib/repo/contactos";
import { getDB } from "@/lib/repo/db";

export default function MapaPage() {
  const { session } = useSession();
  const v = useDbVersion();

  const data = useMemo(() => {
    if (!session) return null;
    const db = getDB();
    const centro = db.iglesia.centro;
    if (session.esMonitor) {
      return {
        modo: "monitor" as const,
        centro,
        yo: session.user,
        contactos: listContactos(session),
        evangelizadores: db.usuarios.filter((u) => u.rol === "evangelizador"),
      };
    }
    // Evangelizador: solo su ubicación
    return {
      modo: "evangelizador" as const,
      centro,
      yo: session.user,
      ubicacionYo: session.user.ubicacion ?? centro,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, v]);

  if (!session || !data) return null;

  return (
    <div className="relative h-[calc(100vh-6rem)]">
      {/* Chip informativo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-4">
        {data.modo === "monitor" ? (
          <div className="card px-3 py-1.5 text-xs font-medium text-(--color-fg-muted)">
            {data.contactos.length} contactos · {data.evangelizadores.length} evangelizadores
          </div>
        ) : (
          <div className="card flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-(--color-fg-muted)">
            <EyeOff size={14} />
            Solo tú ves esta información
          </div>
        )}
      </div>

      {data.modo === "monitor" ? (
        <FakeMapa
          modo="monitor"
          centro={data.centro}
          yo={data.yo}
          contactos={data.contactos}
          evangelizadores={data.evangelizadores}
        />
      ) : (
        <FakeMapa
          modo="evangelizador"
          centro={data.centro}
          yo={data.yo}
          ubicacionYo={data.ubicacionYo}
        />
      )}

      {/* Leyenda solo para monitor */}
      {data.modo === "monitor" && (
        <div className="absolute inset-x-0 bottom-4 z-10 mx-auto flex max-w-md flex-wrap items-center justify-center gap-2 px-4">
          <div className="card flex items-center gap-3 px-3 py-2 text-[11px] font-medium text-(--color-fg-muted)">
            <Chip color="var(--color-status-contacted)" label="Contactado" />
            <Chip color="var(--color-status-interested)" label="Interesado" />
            <Chip color="var(--color-status-follow)" label="Seguimiento" />
            <Chip color="var(--color-status-attending)" label="Asiste" />
            <Chip color="var(--color-status-not)" label="No int." />
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
