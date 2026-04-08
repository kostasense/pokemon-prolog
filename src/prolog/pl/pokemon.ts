export const pokemon = `
    % starter pokemon
    starters([charmander, bulbasaur, squirtle]).    

    % types
    % ===== NORMAL =====
    type(eevee,          normal).
    type(pidgey,        normal).
    type(pidgeotto,     normal).
    type(pidgeot,       normal).
    type(jigglypuff,    normal).
    type(wigglytuff,    normal).

    % ===== FIRE =====
    type(charmander,    fire).
    type(charmeleon,    fire).
    type(charizard,     fire).
    type(vulpix,        fire).
    type(ninetales,     fire).
    type(ponyta,        fire).
    type(rapidash,      fire).
    type(flareon,       fire).

    % ===== WATER =====
    type(squirtle,      water).
    type(wartortle,     water).
    type(blastoise,     water).
    type(poliwag,       water).
    type(poliwhirl,     water).
    type(poliwrath,     water).
    type(psyduck,       water).
    type(golduck,       water).
    type(vaporeon,      water).

    % ===== GRASS =====
    type(bellsprout,    grass).
    type(weepinbell,    grass).
    type(victreebel,    grass).
    type(bulbasaur,     grass).
    type(ivysaur,       grass).
    type(venusaur,      grass).
    type(oddish,        grass).
    type(gloom,         grass).
    type(vileplume,     grass).
    type(leafeon,       grass).

    % ===== GHOST =====
    type(gastly,        ghost).
    type(haunter,       ghost).
    type(gengar,        ghost).
    type(litwick,       ghost).
    type(lampent,       ghost).
    type(chandelure,    ghost).
    type(mimikyu,       ghost).

    % pokéballs
    pokeball(normal,    50).
    pokeball(superball, 100).

    % evolves(pokemon,     evolution,      required_level)
    % ===== NORMAL =====
    evolves(eevee,         flareon,        17).
    evolves(eevee,         vaporeon,       17).
    evolves(eevee,         leafeon,        17).
    evolves(pidgey,        pidgeotto,      17).
    evolves(pidgeotto,     pidgeot,        24).
    evolves(jigglypuff,    wigglytuff,     17).

    % ===== FIRE =====
    evolves(charmander,    charmeleon,     17).
    evolves(charmeleon,    charizard,      24).
    evolves(vulpix,        ninetales,      17).
    evolves(ponyta,        rapidash,       17).

    % ===== WATER =====
    evolves(squirtle,      wartortle,      17).
    evolves(wartortle,     blastoise,      24).
    evolves(poliwag,       poliwhirl,      17).
    evolves(poliwhirl,     poliwrath,      24).
    evolves(psyduck,       golduck,        17).

    % ===== GRASS =====
    evolves(bellsprout,    weepinbell,     17).
    evolves(weepinbell,    victreebel,     24).
    evolves(bulbasaur,     ivysaur,        17).
    evolves(ivysaur,       venusaur,       24).
    evolves(oddish,        gloom,          17).
    evolves(gloom,         vileplume,      24).

    % ===== GHOST =====
    evolves(gastly,        haunter,        17).
    evolves(haunter,       gengar,         24).
    evolves(litwick,       lampent,        17).
    evolves(lampent,       chandelure,     24).

    % egg(pokemon, required_distance)
    egg(mimikyu,    1000).
    egg(eevee,      2000).
    egg(pidgey,     2000).
    egg(jigglypuff, 2000).
    egg(charmander, 5000).
    egg(vulpix,     5000).
    egg(ponyta,     5000).
    egg(psyduck,    5000).
    egg(poliwag,    5000).
    egg(squirtle,   5000).
    egg(bellsprout, 5000). 
    egg(oddish,     5000).  
    egg(bulbasaur,  5000).
    egg(gastly,     10000).
    egg(litwick,    10000).

    % baseStats(pokemon,    attack,     health)
    baseStats(eevee,        4,          20).
    baseStats(pidgey,       5,          22).
    baseStats(jigglypuff,   4,          25).

    % ===== FIRE =====
    baseStats(charmander,   6,          24).
    baseStats(vulpix,       5,          23).
    baseStats(ponyta,       5,          24).

    % ===== WATER =====
    baseStats(psyduck,      3,          20).
    baseStats(poliwag,      5,          23).
    baseStats(squirtle,     6,          24).

    % ===== GRASS =====
    baseStats(bellsprout,   2,          19).
    baseStats(oddish,       3,          20).
    baseStats(bulbasaur,    6,          24).

    % ===== GHOST =====
    baseStats(gastly,       5,          22).
    baseStats(litwick,      4,          19).
    baseStats(mimikyu,      4,          20).

    % move(move, type, attack power, level)
    % ===== NORMAL =====
    move('Placaje',          normal, 1,  1).
    move('Ataque Rápido',    normal, 1,  4).
    move('Imagen',           normal, 1,  8).
    move('Rapidez',          normal, 2,  12).
    move('Golpe Cabeza',     normal, 2,  16).
    move('Cuchillada',       normal, 2,  20).
    move('Golpe Cuerpo',     normal, 1,  24).
    move('Vozarrón',         normal, 3,  28).
    move('Derribo',          normal, 3,  30).

    % ===== FIRE =====
    move('Ascuas',           fire,   1,  6).
    move('Colmillo Ígneo',   fire,   2,  12).
    move('Rueda Fuego',      fire,   2,  18).
    move('Giro Fuego',       fire,   1,  24).
    move('Envite Ígneo',     fire,   3,  30).

    % ===== WATER =====
    move('Pistola de Agua',     water,  1,  6).
    move('Burbuja',          water,  2,  12).
    move('Rayo Burbuja',     water,  1,  18).
    move('Acua Jet',         water,  1,  24).
    move('Hidroariete',      water,  2,  30).

    % ===== GRASS =====
    move('Látigo Cepa',       grass,  1,  6).
    move('Hoja Afilada',      grass,  1,  12).
    move('Hoja Mágica',       grass,  2,  18).
    move('Gigadrenado',       grass,  2,  24).
    move('Rayo Solar',        grass,  3,  30).

    % ===== GHOST =====
    move('Lengüetazo',        ghost,  30, 6).
    move('Sombra Vil',        ghost,  40, 12).
    move('Garra Umbría',      ghost,  70, 18).
    move('Bola Sombra',       ghost,  80, 24).
    move('Golpe Fantasma',    ghost,  80, 30).

    weakTo(X, Y):- type(X, water), move(Y, grass, _, _).
    weakTo(X, Y):- type(X, ghost), move(Y, ghost, _, _).
    weakTo(X, Y):- type(X, fire), move(Y, water, _, _).
`;
