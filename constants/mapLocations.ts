/**
 * Define cada seccion del mapa con:
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
  { id: "littleroot", label: "Littleroot Town", x: 18.45, y: 67.5 },
  { id: "oldale", label: "Oldale Town", x: 18.45, y: 57.5 },
  { id: "petalburg", label: "Petalburg City", x: 8.45, y: 57.5 },
  { id: "dewford", label: "Dewford Town", x: 11.95, y: 82.5 },
  { id: "slateport", label: "Slateport City", x: 31.95, y: 65 },
  { id: "rustboro", label: "Rustboro City", x: 5.1, y: 40 },
  { id: "verdanturf", label: "Verdanturf Town", x: 18.45, y: 42.5 },
  { id: "lavaridge", label: "Lavaridge Town", x: 21.95, y: 27.5 },
  { id: "fallarbor", label: "Fallarbor Town", x: 15.1, y: 12.5 },
  { id: "mauville", label: "Mauville City", x: 33.45, y: 42.5 },
  { id: "fortree", label: "Fortree City", x: 45.1, y: 12.5 },
  { id: "pacifidlog", label: "Pacifidlog Town", x: 61.95, y: 62.5 },
  { id: "lilycove", label: "Lilycove City", x: 66.95, y: 27.5 },
  { id: "sootopolis", label: "Sootopolis City", x: 75.25, y: 47.5 },
  { id: "mossdeep", label: "Mossdeep City", x: 86.95, y: 37.5 },
  { id: "evergrande", label: "Evergrande City", x: 95.4, y: 55.25 },
];

export function getLocationById(id: string): MapLocation | undefined {
  return MAP_LOCATIONS.find((loc) => loc.id === id);
}
