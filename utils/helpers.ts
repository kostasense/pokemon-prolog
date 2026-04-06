/**
 * Escala una imagen dándole dimensiones exactas en píxeles.
 * <Image> como: style={scaleImage(64, 64)}
 */
export function scaleImage(width: number, height: number) {
  return { width, height } as const;
}

/**
 * Formatea un nombre de ubicación para mostrarlo en UI.
 */
export function formatLocationName(id: string): string {
  return id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
