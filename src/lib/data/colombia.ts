// Departamentos de Colombia con sus principales ciudades/municipios y sus
// coordenadas aproximadas (centro urbano). Sirve para centrar el mapa en la
// ciudad que el usuario eligió al entrar, sin depender de un servicio de
// geocodificación externo.

export type LatLng = { lat: number; lng: number };
export type CiudadEntry = { nombre: string; coords: LatLng };
export type DeptEntry = { departamento: string; ciudades: CiudadEntry[] };

export const COLOMBIA: DeptEntry[] = [
  { departamento: "Amazonas", ciudades: [
    { nombre: "Leticia",        coords: { lat: -4.2159, lng: -69.9406 } },
    { nombre: "Puerto Nariño",  coords: { lat: -3.7817, lng: -70.3800 } },
  ]},
  { departamento: "Antioquia", ciudades: [
    { nombre: "Medellín",       coords: { lat:  6.2442, lng: -75.5812 } },
    { nombre: "Bello",          coords: { lat:  6.3373, lng: -75.5586 } },
    { nombre: "Envigado",       coords: { lat:  6.1663, lng: -75.5836 } },
    { nombre: "Itagüí",         coords: { lat:  6.1723, lng: -75.6111 } },
    { nombre: "Rionegro",       coords: { lat:  6.1550, lng: -75.3736 } },
    { nombre: "Apartadó",       coords: { lat:  7.8834, lng: -76.6255 } },
    { nombre: "Turbo",          coords: { lat:  8.0947, lng: -76.7286 } },
    { nombre: "Sabaneta",       coords: { lat:  6.1531, lng: -75.6169 } },
    { nombre: "La Estrella",    coords: { lat:  6.1583, lng: -75.6444 } },
    { nombre: "Copacabana",     coords: { lat:  6.3475, lng: -75.5083 } },
    { nombre: "Caldas",         coords: { lat:  6.0906, lng: -75.6367 } },
  ]},
  { departamento: "Arauca", ciudades: [
    { nombre: "Arauca",         coords: { lat:  7.0847, lng: -70.7591 } },
    { nombre: "Saravena",       coords: { lat:  6.9508, lng: -71.8722 } },
    { nombre: "Tame",           coords: { lat:  6.4614, lng: -71.7422 } },
    { nombre: "Arauquita",      coords: { lat:  7.0300, lng: -71.4272 } },
  ]},
  { departamento: "Atlántico", ciudades: [
    { nombre: "Barranquilla",   coords: { lat: 10.9878, lng: -74.7889 } },
    { nombre: "Soledad",        coords: { lat: 10.9172, lng: -74.7644 } },
    { nombre: "Malambo",        coords: { lat: 10.8592, lng: -74.7742 } },
    { nombre: "Sabanalarga",    coords: { lat: 10.6303, lng: -74.9214 } },
    { nombre: "Puerto Colombia",coords: { lat: 10.9958, lng: -74.9531 } },
  ]},
  { departamento: "Bogotá D.C.", ciudades: [
    { nombre: "Bogotá",         coords: { lat:  4.7110, lng: -74.0721 } },
  ]},
  { departamento: "Bolívar", ciudades: [
    { nombre: "Cartagena",      coords: { lat: 10.3910, lng: -75.4794 } },
    { nombre: "Magangué",       coords: { lat:  9.2419, lng: -74.7539 } },
    { nombre: "Turbaco",        coords: { lat: 10.3336, lng: -75.4110 } },
    { nombre: "El Carmen de Bolívar", coords: { lat: 9.7178, lng: -75.1214 } },
  ]},
  { departamento: "Boyacá", ciudades: [
    { nombre: "Tunja",          coords: { lat:  5.5353, lng: -73.3678 } },
    { nombre: "Duitama",        coords: { lat:  5.8253, lng: -73.0322 } },
    { nombre: "Sogamoso",       coords: { lat:  5.7143, lng: -72.9339 } },
    { nombre: "Chiquinquirá",   coords: { lat:  5.6167, lng: -73.8167 } },
    { nombre: "Paipa",          coords: { lat:  5.7797, lng: -73.1169 } },
  ]},
  { departamento: "Caldas", ciudades: [
    { nombre: "Manizales",      coords: { lat:  5.0703, lng: -75.5138 } },
    { nombre: "La Dorada",      coords: { lat:  5.4508, lng: -74.6650 } },
    { nombre: "Chinchiná",      coords: { lat:  4.9822, lng: -75.6033 } },
    { nombre: "Villamaría",     coords: { lat:  5.0450, lng: -75.5133 } },
    { nombre: "Riosucio",       coords: { lat:  5.4225, lng: -75.7008 } },
  ]},
  { departamento: "Caquetá", ciudades: [
    { nombre: "Florencia",      coords: { lat:  1.6144, lng: -75.6062 } },
    { nombre: "San Vicente del Caguán", coords: { lat: 2.1114, lng: -74.7692 } },
  ]},
  { departamento: "Casanare", ciudades: [
    { nombre: "Yopal",          coords: { lat:  5.3392, lng: -72.3958 } },
    { nombre: "Aguazul",        coords: { lat:  5.1728, lng: -72.5464 } },
    { nombre: "Villanueva",     coords: { lat:  4.6072, lng: -72.9281 } },
  ]},
  { departamento: "Cauca", ciudades: [
    { nombre: "Popayán",        coords: { lat:  2.4448, lng: -76.6147 } },
    { nombre: "Santander de Quilichao", coords: { lat: 3.0106, lng: -76.4864 } },
    { nombre: "Puerto Tejada",  coords: { lat:  3.2350, lng: -76.4197 } },
    { nombre: "Patía",          coords: { lat:  2.1069, lng: -76.9819 } },
  ]},
  { departamento: "Cesar", ciudades: [
    { nombre: "Valledupar",     coords: { lat: 10.4631, lng: -73.2532 } },
    { nombre: "Aguachica",      coords: { lat:  8.3097, lng: -73.6111 } },
    { nombre: "Codazzi",        coords: { lat: 10.0342, lng: -73.2367 } },
    { nombre: "La Jagua de Ibirico", coords: { lat: 9.5647, lng: -73.3350 } },
  ]},
  { departamento: "Chocó", ciudades: [
    { nombre: "Quibdó",         coords: { lat:  5.6919, lng: -76.6583 } },
    { nombre: "Istmina",        coords: { lat:  5.1522, lng: -76.6853 } },
    { nombre: "Condoto",        coords: { lat:  5.0906, lng: -76.6489 } },
  ]},
  { departamento: "Córdoba", ciudades: [
    { nombre: "Montería",       coords: { lat:  8.7500, lng: -75.8878 } },
    { nombre: "Cereté",         coords: { lat:  8.8850, lng: -75.7961 } },
    { nombre: "Lorica",         coords: { lat:  9.2394, lng: -75.8144 } },
    { nombre: "Sahagún",        coords: { lat:  8.9469, lng: -75.4453 } },
    { nombre: "Planeta Rica",   coords: { lat:  8.4131, lng: -75.5836 } },
  ]},
  { departamento: "Cundinamarca", ciudades: [
    { nombre: "Soacha",         coords: { lat:  4.5794, lng: -74.2158 } },
    { nombre: "Chía",           coords: { lat:  4.8619, lng: -74.0592 } },
    { nombre: "Fusagasugá",     coords: { lat:  4.3378, lng: -74.3644 } },
    { nombre: "Zipaquirá",      coords: { lat:  5.0272, lng: -73.9950 } },
    { nombre: "Girardot",       coords: { lat:  4.3038, lng: -74.8006 } },
    { nombre: "Facatativá",     coords: { lat:  4.8114, lng: -74.3550 } },
    { nombre: "Mosquera",       coords: { lat:  4.7053, lng: -74.2308 } },
    { nombre: "Madrid",         coords: { lat:  4.7328, lng: -74.2650 } },
    { nombre: "Funza",          coords: { lat:  4.7167, lng: -74.2117 } },
    { nombre: "Cajicá",         coords: { lat:  4.9186, lng: -74.0244 } },
  ]},
  { departamento: "Guainía", ciudades: [
    { nombre: "Inírida",        coords: { lat:  3.8656, lng: -67.9236 } },
  ]},
  { departamento: "Guaviare", ciudades: [
    { nombre: "San José del Guaviare", coords: { lat: 2.5675, lng: -72.6408 } },
  ]},
  { departamento: "Huila", ciudades: [
    { nombre: "Neiva",          coords: { lat:  2.9273, lng: -75.2819 } },
    { nombre: "Pitalito",       coords: { lat:  1.8547, lng: -76.0517 } },
    { nombre: "Garzón",         coords: { lat:  2.1958, lng: -75.6272 } },
    { nombre: "La Plata",       coords: { lat:  2.3922, lng: -75.8886 } },
  ]},
  { departamento: "La Guajira", ciudades: [
    { nombre: "Riohacha",       coords: { lat: 11.5444, lng: -72.9072 } },
    { nombre: "Maicao",         coords: { lat: 11.3792, lng: -72.2456 } },
    { nombre: "Uribia",         coords: { lat: 11.7147, lng: -72.2681 } },
    { nombre: "San Juan del Cesar", coords: { lat: 10.7708, lng: -73.0025 } },
  ]},
  { departamento: "Magdalena", ciudades: [
    { nombre: "Santa Marta",    coords: { lat: 11.2408, lng: -74.1990 } },
    { nombre: "Ciénaga",        coords: { lat: 11.0114, lng: -74.2453 } },
    { nombre: "Fundación",      coords: { lat: 10.5183, lng: -74.1856 } },
    { nombre: "El Banco",       coords: { lat:  9.0069, lng: -73.9711 } },
  ]},
  { departamento: "Meta", ciudades: [
    { nombre: "Villavicencio",  coords: { lat:  4.1420, lng: -73.6266 } },
    { nombre: "Acacías",        coords: { lat:  3.9878, lng: -73.7581 } },
    { nombre: "Granada",        coords: { lat:  3.5461, lng: -73.7048 } },
    { nombre: "Puerto López",   coords: { lat:  4.0925, lng: -72.9569 } },
  ]},
  { departamento: "Nariño", ciudades: [
    { nombre: "Pasto",          coords: { lat:  1.2136, lng: -77.2811 } },
    { nombre: "Ipiales",        coords: { lat:  0.8283, lng: -77.6450 } },
    { nombre: "Tumaco",         coords: { lat:  1.7972, lng: -78.7644 } },
    { nombre: "Túquerres",      coords: { lat:  1.0872, lng: -77.6167 } },
    { nombre: "La Unión",       coords: { lat:  1.6008, lng: -77.1319 } },
  ]},
  { departamento: "Norte de Santander", ciudades: [
    { nombre: "Cúcuta",         coords: { lat:  7.8939, lng: -72.5078 } },
    { nombre: "Ocaña",          coords: { lat:  8.2372, lng: -73.3547 } },
    { nombre: "Pamplona",       coords: { lat:  7.3753, lng: -72.6472 } },
    { nombre: "Villa del Rosario", coords: { lat: 7.8339, lng: -72.4744 } },
    { nombre: "Los Patios",     coords: { lat:  7.8353, lng: -72.5064 } },
  ]},
  { departamento: "Putumayo", ciudades: [
    { nombre: "Mocoa",          coords: { lat:  1.1519, lng: -76.6478 } },
    { nombre: "Puerto Asís",    coords: { lat:  0.5031, lng: -76.4967 } },
    { nombre: "Sibundoy",       coords: { lat:  1.2033, lng: -76.9203 } },
  ]},
  { departamento: "Quindío", ciudades: [
    { nombre: "Armenia",        coords: { lat:  4.5347, lng: -75.6811 } },
    { nombre: "Calarcá",        coords: { lat:  4.5233, lng: -75.6444 } },
    { nombre: "Montenegro",     coords: { lat:  4.5661, lng: -75.7492 } },
    { nombre: "La Tebaida",     coords: { lat:  4.4519, lng: -75.7869 } },
  ]},
  { departamento: "Risaralda", ciudades: [
    { nombre: "Pereira",        coords: { lat:  4.8133, lng: -75.6961 } },
    { nombre: "Dosquebradas",   coords: { lat:  4.8339, lng: -75.6764 } },
    { nombre: "Santa Rosa de Cabal", coords: { lat: 4.8636, lng: -75.6206 } },
    { nombre: "La Virginia",    coords: { lat:  4.8994, lng: -75.8836 } },
  ]},
  { departamento: "San Andrés y Providencia", ciudades: [
    { nombre: "San Andrés",     coords: { lat: 12.5583, lng: -81.7181 } },
    { nombre: "Providencia",    coords: { lat: 13.3789, lng: -81.3714 } },
  ]},
  { departamento: "Santander", ciudades: [
    { nombre: "Bucaramanga",    coords: { lat:  7.1194, lng: -73.1227 } },
    { nombre: "Floridablanca",  coords: { lat:  7.0669, lng: -73.0864 } },
    { nombre: "Girón",          coords: { lat:  7.0736, lng: -73.1739 } },
    { nombre: "Piedecuesta",    coords: { lat:  6.9931, lng: -73.0492 } },
    { nombre: "Barrancabermeja",coords: { lat:  7.0653, lng: -73.8547 } },
    { nombre: "San Gil",        coords: { lat:  6.5544, lng: -73.1339 } },
    { nombre: "Málaga",         coords: { lat:  6.6994, lng: -72.7325 } },
  ]},
  { departamento: "Sucre", ciudades: [
    { nombre: "Sincelejo",      coords: { lat:  9.3047, lng: -75.3978 } },
    { nombre: "Corozal",        coords: { lat:  9.3178, lng: -75.2919 } },
    { nombre: "Sampués",        coords: { lat:  9.1839, lng: -75.3811 } },
    { nombre: "San Marcos",     coords: { lat:  8.6631, lng: -75.1319 } },
  ]},
  { departamento: "Tolima", ciudades: [
    { nombre: "Ibagué",         coords: { lat:  4.4389, lng: -75.2322 } },
    { nombre: "Espinal",        coords: { lat:  4.1500, lng: -74.8836 } },
    { nombre: "Melgar",         coords: { lat:  4.2036, lng: -74.6478 } },
    { nombre: "Honda",          coords: { lat:  5.2081, lng: -74.7419 } },
    { nombre: "Chaparral",      coords: { lat:  3.7239, lng: -75.4839 } },
  ]},
  { departamento: "Valle del Cauca", ciudades: [
    { nombre: "Cali",           coords: { lat:  3.4516, lng: -76.5320 } },
    { nombre: "Palmira",        coords: { lat:  3.5394, lng: -76.3033 } },
    { nombre: "Buenaventura",   coords: { lat:  3.8836, lng: -77.0311 } },
    { nombre: "Tuluá",          coords: { lat:  4.0847, lng: -76.1958 } },
    { nombre: "Buga",           coords: { lat:  3.9019, lng: -76.2978 } },
    { nombre: "Cartago",        coords: { lat:  4.7469, lng: -75.9128 } },
    { nombre: "Yumbo",          coords: { lat:  3.5844, lng: -76.4919 } },
    { nombre: "Jamundí",        coords: { lat:  3.2597, lng: -76.5378 } },
  ]},
  { departamento: "Vaupés", ciudades: [
    { nombre: "Mitú",           coords: { lat:  1.2011, lng: -70.1747 } },
  ]},
  { departamento: "Vichada", ciudades: [
    { nombre: "Puerto Carreño", coords: { lat:  6.1889, lng: -67.4856 } },
    { nombre: "La Primavera",   coords: { lat:  5.4903, lng: -70.4106 } },
  ]},
];

export const DEPARTAMENTOS = COLOMBIA.map((d) => d.departamento);

export function ciudadesDe(departamento: string): string[] {
  return COLOMBIA.find((d) => d.departamento === departamento)?.ciudades.map((c) => c.nombre) ?? [];
}

/** Retorna las coordenadas del centro urbano de la ciudad, o null si no está registrada. */
export function coordsDe(departamento: string, ciudad: string): LatLng | null {
  return (
    COLOMBIA.find((d) => d.departamento === departamento)?.ciudades.find((c) => c.nombre === ciudad)
      ?.coords ?? null
  );
}
