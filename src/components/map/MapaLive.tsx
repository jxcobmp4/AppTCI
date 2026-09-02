"use client";

import { useEffect, useRef, useState } from "react";
import type { Map, Marker } from "maplibre-gl";
import type { Contacto, LatLng, Usuario } from "@/types/domain";
import { ContactoDetalleSheet } from "@/features/contactos/ContactoDetalleSheet";

// Estilo con tiles OSM raster — sin API key.
const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    },
  },
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};

const STATUS_COLORS: Record<Contacto["estado"], string> = {
  contacted: "#F59E0B",
  interested: "#22C55E",
  follow_up: "#3B82F6",
  attending: "#8B5CF6",
  not_interested: "#EF4444",
};

type Props =
  | {
      modo: "monitor";
      centro: LatLng;
      yo: Usuario;
      contactos: Contacto[];
      colportores: Usuario[];
    }
  | {
      modo: "colportor";
      centro: LatLng;
      yo: Usuario;
      ubicacionYo: LatLng;
    };

export function MapaLive(props: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [detalle, setDetalle] = useState<Contacto | null>(null);

  // Inicializa el mapa una sola vez
  useEffect(() => {
    if (!container.current) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { Map: MLMap } = await import("maplibre-gl");
      if (cancelled || !container.current) return;

      const map = new MLMap({
        container: container.current,
        style: OSM_STYLE,
        center: [props.centro.lng, props.centro.lat],
        zoom: 14,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.on("load", () => {
        if (!cancelled) setReady(true);
      });

      cleanup = () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-pinta marcadores cuando cambien los datos
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let disposed = false;

    (async () => {
      const { Marker: MLMarker, Popup: MLPopup } = await import("maplibre-gl");
      if (disposed || !mapRef.current) return;

      // Limpia previos
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (props.modo === "monitor") {
        // Marcador de la iglesia
        const iglesiaEl = document.createElement("div");
        iglesiaEl.className = "iglesia-marker";
        iglesiaEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:white;border:3px solid var(--color-brand);border-radius:50%;color:var(--color-brand);font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.15);">✝</div>`;
        markersRef.current.push(
          new MLMarker({ element: iglesiaEl })
            .setLngLat([props.centro.lng, props.centro.lat])
            .setPopup(new MLPopup({ offset: 20 }).setHTML(`<div style="padding:2px 4px;font-size:12px;"><strong>Iglesia</strong></div>`))
            .addTo(map)
        );

        // Colportores
        for (const c of props.colportores) {
          if (!c.ubicacion) continue;
          const el = document.createElement("div");
          el.innerHTML = `
            <div style="position:relative;">
              <div style="position:absolute;inset:-10px;background:radial-gradient(circle,rgba(59,130,246,0.35),transparent 70%);border-radius:50%;"></div>
              <div style="position:relative;width:18px;height:18px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>
            </div>`;
          markersRef.current.push(
            new MLMarker({ element: el })
              .setLngLat([c.ubicacion.lng, c.ubicacion.lat])
              .setPopup(
                new MLPopup({ offset: 18 }).setHTML(
                  `<div style="padding:4px;font-size:12px;"><strong>${escape(c.nombre)}</strong><br/><span style="color:#64748B;">Colportor</span></div>`
                )
              )
              .addTo(map)
          );
        }

        // Contactos
        for (const c of props.contactos) {
          if (!c.ubicacion) continue;
          const color = STATUS_COLORS[c.estado];
          const el = document.createElement("button");
          el.type = "button";
          el.style.cssText = `width:16px;height:16px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.25);cursor:pointer;padding:0;`;
          el.setAttribute("aria-label", `Ver ${c.nombre}`);
          el.addEventListener("click", (ev) => {
            ev.stopPropagation();
            setDetalle(c);
          });
          markersRef.current.push(
            new MLMarker({ element: el })
              .setLngLat([c.ubicacion.lng, c.ubicacion.lat])
              .addTo(map)
          );
        }

        // Ajusta viewport a los datos si hay al menos uno
        const puntos = [
          ...props.contactos.filter((c) => c.ubicacion).map((c) => c.ubicacion!),
          ...props.colportores.filter((c) => c.ubicacion).map((c) => c.ubicacion!),
        ];
        if (puntos.length > 0) {
          const { LngLatBounds } = await import("maplibre-gl");
          const bounds = new LngLatBounds();
          puntos.forEach((p) => bounds.extend([p.lng, p.lat]));
          map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 500 });
        }
      } else {
        // Colportor: solo su ubicación
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="position:relative;">
            <div style="position:absolute;inset:-16px;background:radial-gradient(circle,rgba(59,130,246,0.35),transparent 70%);border-radius:50%;animation:pulse 2.4s ease-in-out infinite;"></div>
            <div style="position:relative;width:22px;height:22px;background:#3B82F6;border:4px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          </div>
          <style>@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }</style>`;
        markersRef.current.push(
          new MLMarker({ element: el })
            .setLngLat([props.ubicacionYo.lng, props.ubicacionYo.lat])
            .setPopup(new MLPopup({ offset: 22 }).setHTML(`<div style="padding:4px;font-size:12px;"><strong>Tú (${escape(props.yo.nombre.split(" ")[0])})</strong></div>`))
            .addTo(map)
        );
        map.easeTo({ center: [props.ubicacionYo.lng, props.ubicacionYo.lat], zoom: 15, duration: 400 });
      }
    })();

    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    props.modo,
    props.modo === "monitor" ? props.contactos.length : props.ubicacionYo.lat,
    props.modo === "monitor" ? props.colportores.length : props.ubicacionYo.lng,
  ]);

  return (
    <>
      <div ref={container} className="h-full w-full" />
      <ContactoDetalleSheet contacto={detalle} onClose={() => setDetalle(null)} />
    </>
  );
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
