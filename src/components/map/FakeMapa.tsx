"use client";

import { useMemo } from "react";
import type { Contacto, LatLng, Usuario } from "@/types/domain";
import { getDB } from "@/lib/repo/db";

const STATUS_COLORS: Record<Contacto["estado"], string> = {
  contacted: "var(--color-status-contacted)",
  interested: "var(--color-status-interested)",
  follow_up: "var(--color-status-follow)",
  attending: "var(--color-status-attending)",
  not_interested: "var(--color-status-not)",
};

type Props =
  | { modo: "monitor"; contactos: Contacto[]; colportores: Usuario[]; centro: LatLng; yo: Usuario }
  | { modo: "colportor"; centro: LatLng; yo: Usuario; ubicacionYo: LatLng };

/** Mapa "de mentira" en SVG. Suficiente para validar UX. En Fase 6 se sustituye por MapLibre. */
export function FakeMapa(props: Props) {
  const { centro } = props;
  const iglesia = getDB().iglesia;

  // Escalado simple: 1° lat/lng → 4000 unidades SVG (~1.1 km por 40 unidades)
  const project = useMemo(() => {
    const scale = 4000;
    return (p: LatLng) => ({
      x: (p.lng - centro.lng) * scale + 500,
      y: (centro.lat - p.lat) * scale + 400,
    });
  }, [centro]);

  return (
    <div className="relative h-full overflow-hidden bg-(--color-surface-2)">
      <svg viewBox="0 0 1000 800" className="h-full w-full" aria-label="Mapa de contactos">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="1" />
          </pattern>
          <radialGradient id="pulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="800" fill="url(#grid)" />

        {/* "Calles" decorativas */}
        <path d="M 0 300 Q 500 250 1000 320" stroke="rgba(15,23,42,0.08)" strokeWidth="14" fill="none" />
        <path d="M 0 500 Q 500 480 1000 540" stroke="rgba(15,23,42,0.08)" strokeWidth="14" fill="none" />
        <path d="M 300 0 Q 320 400 350 800" stroke="rgba(15,23,42,0.08)" strokeWidth="14" fill="none" />
        <path d="M 700 0 Q 680 400 720 800" stroke="rgba(15,23,42,0.08)" strokeWidth="14" fill="none" />

        {/* Iglesia (centro) */}
        {(() => {
          const p = project(iglesia.centro);
          return (
            <g>
              <circle cx={p.x} cy={p.y} r="12" fill="white" stroke="var(--color-brand)" strokeWidth="3" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-brand)">
                ✝
              </text>
              <text x={p.x} y={p.y + 30} textAnchor="middle" fontSize="11" fill="var(--color-fg-muted)">
                {iglesia.nombre}
              </text>
            </g>
          );
        })()}

        {props.modo === "monitor" && (
          <>
            {/* Evangelizadores */}
            {props.colportores.map((e) => {
              if (!e.ubicacion) return null;
              const p = project(e.ubicacion);
              return (
                <g key={e.id}>
                  <circle cx={p.x} cy={p.y} r="18" fill="url(#pulse)" />
                  <circle cx={p.x} cy={p.y} r="7" fill="#3B82F6" stroke="white" strokeWidth="2" />
                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-fg)">
                    {e.nombre.split(" ")[0]}
                  </text>
                </g>
              );
            })}
            {/* Contactos */}
            {props.contactos.map((c) => {
              if (!c.ubicacion) return null;
              const p = project(c.ubicacion);
              return (
                <circle
                  key={c.id}
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill={STATUS_COLORS[c.estado]}
                  stroke="white"
                  strokeWidth="1.5"
                >
                  <title>{c.nombre}</title>
                </circle>
              );
            })}
          </>
        )}

        {props.modo === "colportor" && (
          (() => {
            const p = project(props.ubicacionYo);
            return (
              <g>
                <circle cx={p.x} cy={p.y} r="28" fill="url(#pulse)">
                  <animate attributeName="r" values="18;36;18" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={p.x} cy={p.y} r="9" fill="#3B82F6" stroke="white" strokeWidth="3" />
                <text x={p.x} y={p.y - 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-fg)">
                  {props.yo.nombre.split(" ")[0]} (tú)
                </text>
              </g>
            );
          })()
        )}
      </svg>
    </div>
  );
}
