"use client";

import { useEffect, useState } from "react";
import { subscribeDB } from "./db";

/** Retorna un contador que cambia cada vez que la DB local muta. Úsalo como dep para recomputar. */
export function useDbVersion() {
  const [v, setV] = useState(0);
  useEffect(() => subscribeDB(() => setV((n) => n + 1)), []);
  return v;
}
