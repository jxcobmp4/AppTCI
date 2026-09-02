"use client";

import type { Session } from "@/types/domain";
import { getDB } from "./db";
import { listContactos } from "./contactos";

export type Stats = {
  hoy: number;
  semana: number;
  mes: number;
  total: number;
  interesados: number;
  seguimientos: number;
  asisten: number;
  porDia: Array<{ dia: string; total: number }>;
  ranking: Array<{ usuarioId: string; nombre: string; total: number }>;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysAgo(n: number) {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

export function statsFor(session: Session): Stats {
  const contactos = listContactos(session);
  const hoy0 = startOfDay(new Date()).getTime();
  const semana0 = daysAgo(6).getTime();
  const mes0 = daysAgo(29).getTime();

  const tsList = contactos.map((c) => new Date(c.creado_en).getTime());
  const count = (from: number) => tsList.filter((t) => t >= from).length;

  const porDia: Array<{ dia: string; total: number }> = [];
  const dias = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  for (let i = 6; i >= 0; i--) {
    const from = daysAgo(i).getTime();
    const to = daysAgo(i - 1).getTime();
    const total = tsList.filter((t) => t >= from && t < to).length;
    const d = new Date(from);
    porDia.push({ dia: dias[d.getDay()], total });
  }

  // Ranking solo para monitor
  let ranking: Stats["ranking"] = [];
  if (session.esMonitor) {
    const db = getDB();
    const grupos = new Map<string, number>();
    for (const c of db.contactos) {
      grupos.set(c.evangelizador_id, (grupos.get(c.evangelizador_id) ?? 0) + 1);
    }
    ranking = db.usuarios
      .filter((u) => u.rol === "evangelizador")
      .map((u) => ({ usuarioId: u.id, nombre: u.nombre, total: grupos.get(u.id) ?? 0 }))
      .sort((a, b) => b.total - a.total);
  }

  return {
    hoy: count(hoy0),
    semana: count(semana0),
    mes: count(mes0),
    total: contactos.length,
    interesados: contactos.filter((c) => c.estado === "interested").length,
    seguimientos: contactos.filter((c) => c.estado === "follow_up").length,
    asisten: contactos.filter((c) => c.estado === "attending").length,
    porDia,
    ranking,
  };
}
