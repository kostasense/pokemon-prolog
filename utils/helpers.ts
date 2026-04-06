/**
 * Escala una imagen dandole dimensiones exactas en pixeles
 * <Image> como: style={scaleImage(64, 64)}
 */
export function scaleImage(width: number, height: number) {
  return { width, height } as const;
}
