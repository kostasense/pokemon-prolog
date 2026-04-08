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
  { id: "littleroot", label: "Pueblo Littleroot", x: 18.45, y: 67.5 },
  { id: "oldale", label: "Pueblo Oldale", x: 18.45, y: 57.5 },
  { id: "petalburg", label: "Ciudad Petalburg", x: 8.45, y: 57.5 },
  { id: "dewford", label: "Pueblo Dewford", x: 11.95, y: 82.5 },
  { id: "slateport", label: "Ciudad Slateport", x: 31.95, y: 65 },
  { id: "rustboro", label: "Ciudad Rustboro", x: 5.1, y: 40 },
  { id: "verdanturf", label: "Pueblo Verdanturf", x: 18.45, y: 42.5 },
  { id: "lavaridge", label: "Pueblo Lavaridge", x: 21.95, y: 27.5 },
  { id: "fallarbor", label: "Pueblo Fallarbor", x: 15.1, y: 12.5 },
  { id: "mauville", label: "Ciudad Mauville", x: 33.45, y: 42.5 },
  { id: "fortree", label: "Ciudad Fortree", x: 45.1, y: 12.5 },
  { id: "pacifidlog", label: "Pueblo Pacifidlog", x: 61.95, y: 62.5 },
  { id: "lilycove", label: "Ciudad Lilycove", x: 66.95, y: 27.5 },
  { id: "sootopolis", label: "Ciudad Sootopolis", x: 75.25, y: 47.5 },
  { id: "mossdeep", label: "Ciudad Mossdeep", x: 86.95, y: 37.5 },
  { id: "evergrande", label: "Ciudad Evergrande", x: 95.4, y: 55.25 },
  { id: "101", label: "Ruta 101", x: 18.45, y: 62.5 },
  { id: "102", label: "Ruta 102", x: 13.45, y: 57.5 },
  { id: "103", label: "Ruta 103", x: 24.45, y: 52.5 },
  { id: "104", label: "Ruta 104", x: 24.45, y: 52.5 },
  { id: "105", label: "Ruta 105", x: 5.1, y: 50 },
  { id: "106", label: "Ruta 106", x: 5.1, y: 70 },
  { id: "107", label: "Ruta 107", x: 24.45, y: 82.5 },
  { id: "108", label: "Ruta 108", x: 46.95, y: 62.5 },
  { id: "109", label: "Ruta 109", x: 31.95, y: 52.5 },
  { id: "110", label: "Ruta 110", x: 5.1, y: 70 },
  { id: "111", label: "Ruta 111", x: 31.95, y: 27.5 },
  { id: "112", label: "Ruta 112", x: 24.45, y: 42.5 },
  { id: "113", label: "Ruta 113", x: 31.95, y: 12.5 },
  { id: "114", label: "Ruta 114", x: 41.95, y: 27.5 },
  { id: "115", label: "Ruta 115", x: 48.95, y: 27.5 },
  { id: "116", label: "Ruta 116", x: 81.95, y: 47.5 },
  { id: "117", label: "Ruta 117", x: 11.95, y: 37.5 },
  { id: "118", label: "Ruta 118", x: 31.95, y: 12.5 },
  { id: "119", label: "Ruta 119", x: 8.45, y: 22.5 },
  { id: "120", label: "Ruta 120", x: 81.95, y: 62.5 },
  { id: "121", label: "Ruta 121", x: 81.95, y: 62.5 },
  { id: "122", label: "Ruta 122", x: 81.95, y: 55 },
  { id: "123", label: "Ruta 123", x: 85.45, y: 52.5 },
  { id: "124", label: "Ruta 124", x: 85.45, y: 52.5 },
  { id: "125", label: "Ruta 125", x: 85.45, y: 47.5 },
];

export function getLocationById(id: string): MapLocation | undefined {
  return MAP_LOCATIONS.find((loc) => loc.id === id);
}
