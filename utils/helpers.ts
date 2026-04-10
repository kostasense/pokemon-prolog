import { Egg, Pokemon } from "./interfaces";

/**
 * Escala una imagen dandole dimensiones exactas en pixeles
 * <Image> como: style={scaleImage(64, 64)}
 */
export function scaleImage(width: number, height: number) {
  return { width, height } as const;
}

/**
 * Dice si una instancia de entidad en el equipo es Pokemon o Huevo
 */
export function isEgg(pokemon: Pokemon | Egg): pokemon is Egg {
  return (pokemon as Egg).distanceLeft !== undefined;
  //return true;
}
