/**
 * Define cada sección del mapa con:
 *   id        → valor retornado por Prolog
 *   label     → nombre legible para el jugador
 *   x, y      → relativo al tamaño del contenedor del mapa
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
  { id: "littleroot", label: "Littleroot", x: 18.3, y: 67.5 },
];

export function getLocationById(id: string): MapLocation | undefined {
  return MAP_LOCATIONS.find((loc) => loc.id === id);
}
