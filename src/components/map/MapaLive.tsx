"use client";

import { useEffect, useRef, useState } from "react";
import type { Map, Marker } from "maplibre-gl";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { LatLng, Usuario } from "@/types/domain";

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

type Props =
  | {
      modo: "monitor";
      centro: LatLng;
      yo: Usuario;
      colportores: Usuario[]; // solo con ubicación
    }
  | {
      modo: "colportor";
      centro: LatLng;
      yo: Usuario;
      ubicacionYo: LatLng | null;
    };

export function MapaLive(props: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);

  // Init una vez
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
        zoom: 13,
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

  // Marcadores — solo iglesia + colportores. NUNCA contactos.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let disposed = false;

    (async () => {
      const { Marker: MLMarker, Popup: MLPopup, LngLatBounds } = await import("maplibre-gl");
      if (disposed || !mapRef.current) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Iglesia
      const iglesiaEl = document.createElement("div");
      iglesiaEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:white;border:3px solid #4F46E5;border-radius:50%;color:#4F46E5;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.15);">✝</div>`;
      markersRef.current.push(
        new MLMarker({ element: iglesiaEl })
          .setLngLat([props.centro.lng, props.centro.lat])
          .setPopup(new MLPopup({ offset: 20 }).setHTML(`<div style="padding:2px 4px;font-size:12px;"><strong>Iglesia</strong></div>`))
          .addTo(map)
      );

      const puntos: LatLng[] = [];

      if (props.modo === "monitor") {
        for (const c of props.colportores) {
          if (!c.ubicacion) continue;
          const el = document.createElement("div");
          el.innerHTML = `
            <div style="position:relative;">
              <div style="position:absolute;inset:-12px;background:radial-gradient(circle,rgba(59,130,246,0.35),transparent 70%);border-radius:50%;"></div>
              <div style="position:relative;width:22px;height:22px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>
            </div>`;
          const cuando = c.ubicacion_actualizada_en
            ? `hace ${escape(formatDistanceToNow(new Date(c.ubicacion_actualizada_en), { locale: es }))}`
            : "sin actualización";
          markersRef.current.push(
            new MLMarker({ element: el })
              .setLngLat([c.ubicacion.lng, c.ubicacion.lat])
              .setPopup(
                new MLPopup({ offset: 22 }).setHTML(
                  `<div style="padding:4px 6px;font-size:12px;">
                     <strong>${escape(c.nombre)}</strong><br/>
                     <span style="color:#64748B;">Actualizado ${cuando}</span>
                   </div>`
                )
              )
              .addTo(map)
          );
          puntos.push(c.ubicacion);
        }
      } else if (props.ubicacionYo) {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="position:relative;">
            <div style="position:absolute;inset:-16px;background:radial-gradient(circle,rgba(59,130,246,0.35),transparent 70%);border-radius:50%;animation:mePulse 2.4s ease-in-out infinite;"></div>
            <div style="position:relative;width:22px;height:22px;background:#3B82F6;border:4px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          </div>
          <style>@keyframes mePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }</style>`;
        markersRef.current.push(
          new MLMarker({ element: el })
            .setLngLat([props.ubicacionYo.lng, props.ubicacionYo.lat])
            .setPopup(new MLPopup({ offset: 22 }).setHTML(`<div style="padding:4px;font-size:12px;"><strong>Tú</strong></div>`))
            .addTo(map)
        );
        puntos.push(props.ubicacionYo);
      }

      // Encuadre
      if (puntos.length === 1) {
        map.easeTo({ center: [puntos[0].lng, puntos[0].lat], zoom: 15, duration: 400 });
      } else if (puntos.length > 1) {
        const bounds = new LngLatBounds();
        puntos.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 500 });
      } else {
        map.easeTo({ center: [props.centro.lng, props.centro.lat], zoom: 13, duration: 400 });
      }
    })();

    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    props.modo,
    props.modo === "monitor"
      ? props.colportores.map((c) => c.ubicacion_actualizada_en ?? "").join("|")
      : `${props.ubicacionYo?.lat ?? "n"},${props.ubicacionYo?.lng ?? "n"}`,
  ]);

  return <div ref={container} className="h-full w-full" />;
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
