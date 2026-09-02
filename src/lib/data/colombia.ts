// Departamentos de Colombia con sus principales ciudades/municipios.
// Fuente: DANE. Lista pragmática para el formulario de registro.

export type DeptEntry = { departamento: string; ciudades: string[] };

export const COLOMBIA: DeptEntry[] = [
  { departamento: "Amazonas", ciudades: ["Leticia", "Puerto Nariño"] },
  { departamento: "Antioquia", ciudades: ["Medellín", "Bello", "Envigado", "Itagüí", "Rionegro", "Apartadó", "Turbo", "Sabaneta", "La Estrella", "Copacabana", "Caldas"] },
  { departamento: "Arauca", ciudades: ["Arauca", "Saravena", "Tame", "Arauquita"] },
  { departamento: "Atlántico", ciudades: ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Puerto Colombia"] },
  { departamento: "Bogotá D.C.", ciudades: ["Bogotá"] },
  { departamento: "Bolívar", ciudades: ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar"] },
  { departamento: "Boyacá", ciudades: ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa"] },
  { departamento: "Caldas", ciudades: ["Manizales", "La Dorada", "Chinchiná", "Villamaría", "Riosucio"] },
  { departamento: "Caquetá", ciudades: ["Florencia", "San Vicente del Caguán"] },
  { departamento: "Casanare", ciudades: ["Yopal", "Aguazul", "Villanueva"] },
  { departamento: "Cauca", ciudades: ["Popayán", "Santander de Quilichao", "Puerto Tejada", "Patía"] },
  { departamento: "Cesar", ciudades: ["Valledupar", "Aguachica", "Codazzi", "La Jagua de Ibirico"] },
  { departamento: "Chocó", ciudades: ["Quibdó", "Istmina", "Condoto"] },
  { departamento: "Córdoba", ciudades: ["Montería", "Cereté", "Lorica", "Sahagún", "Planeta Rica"] },
  { departamento: "Cundinamarca", ciudades: ["Soacha", "Chía", "Fusagasugá", "Zipaquirá", "Girardot", "Facatativá", "Mosquera", "Madrid", "Funza", "Cajicá"] },
  { departamento: "Guainía", ciudades: ["Inírida"] },
  { departamento: "Guaviare", ciudades: ["San José del Guaviare"] },
  { departamento: "Huila", ciudades: ["Neiva", "Pitalito", "Garzón", "La Plata"] },
  { departamento: "La Guajira", ciudades: ["Riohacha", "Maicao", "Uribia", "San Juan del Cesar"] },
  { departamento: "Magdalena", ciudades: ["Santa Marta", "Ciénaga", "Fundación", "El Banco"] },
  { departamento: "Meta", ciudades: ["Villavicencio", "Acacías", "Granada", "Puerto López"] },
  { departamento: "Nariño", ciudades: ["Pasto", "Ipiales", "Tumaco", "Túquerres", "La Unión"] },
  { departamento: "Norte de Santander", ciudades: ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios"] },
  { departamento: "Putumayo", ciudades: ["Mocoa", "Puerto Asís", "Sibundoy"] },
  { departamento: "Quindío", ciudades: ["Armenia", "Calarcá", "Montenegro", "La Tebaida"] },
  { departamento: "Risaralda", ciudades: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia"] },
  { departamento: "San Andrés y Providencia", ciudades: ["San Andrés", "Providencia"] },
  { departamento: "Santander", ciudades: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "San Gil", "Málaga"] },
  { departamento: "Sucre", ciudades: ["Sincelejo", "Corozal", "Sampués", "San Marcos"] },
  { departamento: "Tolima", ciudades: ["Ibagué", "Espinal", "Melgar", "Honda", "Chaparral"] },
  { departamento: "Valle del Cauca", ciudades: ["Cali", "Palmira", "Buenaventura", "Tuluá", "Buga", "Cartago", "Yumbo", "Jamundí"] },
  { departamento: "Vaupés", ciudades: ["Mitú"] },
  { departamento: "Vichada", ciudades: ["Puerto Carreño", "La Primavera"] },
];

export const DEPARTAMENTOS = COLOMBIA.map((d) => d.departamento);

export function ciudadesDe(departamento: string): string[] {
  return COLOMBIA.find((d) => d.departamento === departamento)?.ciudades ?? [];
}
