export const evolutions = `
    % evolves_into(pokemón, evolution, required_level)
    % ===== NORMAL =====
    evolves_into(eevee, flareon, 17).
    evolves_into(eevee, vaporeon, 17).
    evolves_into(eevee, leafeon, 17).
    evolves_into(pidgey, pidgeotto, 17).
    evolves_into(pidgeotto, pidgeot, 24).
    evolves_into(jigglypuff, wigglytuff, 17).

    % ===== FIRE =====
    evolves_into(charmander, charmeleon, 17).
    evolves_into(charmeleon, charizard, 24).
    evolves_into(vulpix, ninetales, 17).
    evolves_into(ponyta, rapidash, 17).

    % ===== WATER =====
    evolves_into(squirtle, wartortle, 17).
    evolves_into(wartortle, blastoise, 24).
    evolves_into(poliwag, poliwhirl, 17).
    evolves_into(poliwhirl, poliwrath, 24).
    evolves_into(psyduck, golduck, 17).

    % ===== GRASS =====
    evolves_into(bellsprout, weepinbell, 17).
    evolves_into(weepinbell, victreebel, 24).
    evolves_into(bulbasaur, ivysaur, 17).
    evolves_into(ivysaur, venusaur, 24).
    evolves_into(oddish, gloom, 17).
    evolves_into(gloom, vileplume, 24).

    % ===== GHOST =====
    evolves_into(gastly, haunter, 17).
    evolves_into(haunter, gengar, 24).
    evolves_into(litwick, lampent, 17).
    evolves_into(lampent, chandelure, 24).
`;
