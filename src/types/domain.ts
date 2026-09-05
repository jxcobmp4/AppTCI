export type Rol = "monitor" | "colportor";

export type EstadoContacto =
  | "contacted"
  | "interested"
  | "follow_up"
  | "attending"
  | "not_interested";

export type LatLng = { lat: number; lng: number };

export type Iglesia = {
  id: string;
  nombre: string;
  ciudad: string;
  centro: LatLng;
};

export type Usuario = {
  id: string;
  nombre: string;
  rol: Rol;
  email: string;
  avatar: string | null;
  departamento?: string | null;
  ciudad?: string | null;
  iglesia_id?: string;
  ubicacion?: LatLng | null;
  ubicacion_actualizada_en?: string | null; // ISO
};

export type Contacto = {
  id: string;
  nombre: string;
  telefono: string | null;
  estado: EstadoContacto;
  nota: string;
  colportor_id: string;
  iglesia_id: string;
  creado_en: string; // ISO
  actualizado_en: string; // ISO
};

export type EventoTipo =
  | "created"
  | "status_changed"
  | "note_added"
  | "deleted";

export type Evento = {
  id: string;
  contacto_id: string;
  actor_id: string;
  tipo: EventoTipo;
  payload: Record<string, unknown>;
  creado_en: string; // ISO
};

export type DB = {
  version: number;
  iglesia: Iglesia;
  usuarios: Usuario[];
  contactos: Contacto[];
  eventos: Evento[];
};

export type Session = {
  user: Usuario;
  esMonitor: boolean;
  esColportor: boolean;
};
