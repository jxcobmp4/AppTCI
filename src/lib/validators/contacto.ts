import { z } from "zod";

export const estadoContactoSchema = z.enum([
  "contacted",
  "interested",
  "follow_up",
  "attending",
  "not_interested",
]);

export const nuevoContactoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(80),
  telefono: z.string().trim().max(30).optional().nullable(),
  estado: estadoContactoSchema,
  nota: z.string().max(500).optional(),
});

export type NuevoContactoInput = z.infer<typeof nuevoContactoSchema>;
