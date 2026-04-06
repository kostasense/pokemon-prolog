/**
 * Escala una imagen dandole dimensiones exactas en pixeles
 * <Image> como: style={scaleImage(64, 64)}
 */
export function scaleImage(width: number, height: number) {
  return { width, height } as const;
}

/**
 * Formatea un nombre de ubicacion para mostrarlo en UI.
 */
export function formatLocationName(id: string): string {
  return id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
