export const PROVINCIAS = [
  "Buenos Aires",
  "Ciudad Autónoma de Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
  "— Internacional —",
  "Bolivia",
  "Brasil",
  "Chile",
  "Paraguay",
  "Uruguay",
];

export const TIPOS_CARGA = [
  "Carga General",
  "Contenedor",
  "Granel Sólido",
  "Granel Líquido",
  "Refrigerada",
  "Peligrosa",
  "Sobredimensionada",
  "Automóviles",
  "Materiales de Construcción",
  "Puerto / Import / Export",
];

export const TIPOS_VEHICULO = [
  "Camión",
  "Semi",
  "Camioneta",
  "Acoplado",
  "Chasis",
  "Tanque",
];

export const TIPOS_GASTO: Record<string, string> = {
  COMBUSTIBLE: "Combustible",
  PEAJE: "Peaje",
  MANTENIMIENTO: "Mantenimiento",
  NEUMATICOS: "Neumáticos",
  SEGURO: "Seguro",
  IMPUESTO: "Impuesto",
  SUELDO: "Sueldo / Viático",
  OTRO: "Otro",
};

export const ESTADO_VIAJE_LABELS: Record<string, string> = {
  PRESUPUESTO: "Presupuesto",
  PENDIENTE: "Pendiente",
  EN_CURSO: "En curso",
  FACTURADO: "Facturado",
  COBRADO: "Cobrado",
  CANCELADO: "Cancelado",
};

export const ESTADO_VIAJE_COLORS: Record<string, string> = {
  PRESUPUESTO: "bg-gray-100 text-gray-700",
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  EN_CURSO: "bg-blue-100 text-blue-800",
  FACTURADO: "bg-purple-100 text-purple-800",
  COBRADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-700",
};
