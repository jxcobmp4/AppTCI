export type Rol = "monitor" | "evangelizador";

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
  ubicacion?: LatLng | null;
};

export type Contacto = {
  id: string;
  nombre: string;
  estado: EstadoContacto;
  nota: string;
  ubicacion: LatLng | null;
  evangelizador_id: string;
  iglesia_id: string;
  creado_en: string; // ISO
  actualizado_en: string; // ISO
};

export type EventoTipo =
  | "created"
  | "status_changed"
  | "note_added"
  | "follow_up_added";

export type Evento = {
  id: string;
  contacto_id: string;
  actor_id: string;
  tipo: EventoTipo;
  payload: Record<string, unknown>;
  creado_en: string; // ISO
};

export type DB = {
  iglesia: Iglesia;
  usuarios: Usuario[];
  contactos: Contacto[];
  eventos: Evento[];
};

export type Session = {
  user: Usuario;
  esMonitor: boolean;
  esEvangelizador: boolean;
};
