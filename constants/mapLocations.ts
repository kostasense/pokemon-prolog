/**
 * Define cada sección del mapa con:
 *   id        → nombre único que coincide con el valor retornado por Prolog
 *   label     → nombre legible para el jugador
 *   x, y      → posición del centro de la sección en porcentaje (0-100)
 *               relativo al tamaño del contenedor del mapa
 *
 * Para añadir una nueva sección, solo agrega un objeto al array.
 * La cabeza del jugador se colocará automáticamente en la sección
 * cuyo `id` coincida con la ubicación fetcheada.
 */
export type MapLocation = {
  id: string;
  label: string;
  /** Porcentaje horizontal (0 = izquierda, 100 = derecha) */
  x: number;
  /** Porcentaje vertical (0 = arriba, 100 = abajo) */
  y: number;
};

export const MAP_LOCATIONS: MapLocation[] = [
  // ── Agrega aquí todas tus secciones del mapa ──────────────────────
  { id: "pueblo_inicial", label: "Pueblo Inicial", x: 20, y: 75 },
  { id: "ruta_1", label: "Ruta 1", x: 35, y: 60 },
  { id: "ciudad_plateada", label: "Ciudad Plateada", x: 55, y: 45 },
  { id: "cueva_oscura", label: "Cueva Oscura", x: 70, y: 30 },
  { id: "ciudad_aurora", label: "Ciudad Aurora", x: 80, y: 65 },
  // ─────────────────────────────────────────────────────────────────
];

/** Devuelve la sección que coincide con el id dado, o undefined. */
export function getLocationById(id: string): MapLocation | undefined {
  return MAP_LOCATIONS.find((loc) => loc.id === id);
}
