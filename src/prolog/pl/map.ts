export const map = `
    % route(route,  cityA,            cityB,              distance,     difficulty)
    route(101,      littleroot,       oldale,             1000,         blue).
    route(102,      oldale,           petalburg,          1500,         blue).
    route(103,      oldale,           slateport,          3500,         red).
    route(104,      oldale,           mauville,           3600,         green).
    route(105,      petalburg,        rustboro,           2300,         red).
    route(106,      petalburg,        dewford,            3200,         red).
    route(107,      slateport,        dewford,            4100,         green).
    route(108,      slateport,        pacifidlog,         6100,         turquoise).
    route(109,      slateport,        mauville,           2300,         green).
    route(110,      dewford,          rustboro,           5500,         green).
    route(111,      mauville,         lavaridge,          2100,         purple).
    route(112,      mauville,         verdanturf,         1300,         purple).
    route(113,      mauville,         fallarbor,          5200,         black).
    route(114,      mauville,         fortree,            4700,         black).
    route(115,      fortree,          lilycove,           5100,         turquoise).
    route(116,      lilycove,         pacifidlog,         1500,         turquoise).
    route(117,      verdanturf,       rustboro,           2300,         purple).
    route(118,      lavaridge,        fallarbor,          3100,         black).
    route(119,      fallarbor,        rustboro,           4000,         purple).
    route(120,      pacifidlog,       evergrande,         5800,         royal).
    route(121,      pacifidlog,       sootopolis,         5500,         lilac).
    route(122,      pacifidlog,       mossdeep,           8100,         royal).
    route(123,      evergrande,       sootopolis,         3200,         yellow).
    route(124,      evergrande,       mossdeep,           5100,         lilac).
    route(125,      sootopolis,       mossdeep,           3400,         yellow).
    
    % difficulty(color,    lower,       upper)
    difficulty(blue,       2,           4).
    difficulty(red,        4,           7).
    difficulty(green,      7,           10).
    difficulty(purple,     11,          14).
    difficulty(black,      15,          18).
    difficulty(turquoise,  19,          22).
    difficulty(royal,      23,          26).
    difficulty(lilac,      27,          30).
    difficulty(yellow,     31,          34).
    
    % map
    map(littleroot,     'Littleroot Town').
    map(oldale,         'Oldale Town').
    map(petalburg,      'Petalburg City').
    map(rustboro,       'Rustboro City').
    map(dewford,        'Dewford Town').
    map(slateport,      'Slateport City').
    map(mauville,       'Mauville City').
    map(verdanturf,     'Verdanturf Town').
    map(fallarbor,      'Fallarbor Town').
    map(lavaridge,      'Lavaridge Town').
    map(fortree,        'Fortree City').
    map(lilycove,       'Lilycove City').
    map(mossdeep,       'Mossdeep City').
    map(sootopolis,     'Sootopolis City').
    map(pacifidlog,     'Pacifidlog Town').
    map(evergrande,     'Ever Grande City').
    
    % gymnasium(city,       leader,     numberOfFights,  badge)
    gymnasium(rustboro,     roxanne,    1,               stone).
    gymnasium(mauville,     wattson,    2,               dynamo).
    gymnasium(lavaridge,    flannery,   3,               heat).
    gymnasium(lilycove,     winona,     4,               feather).
    gymnasium(mossdeep,     brawly,     5,               knuckle).
    gymnasium(sootopolis,   wallace,    6,               rain).
    
    % possible locations in cityA
    city(A, [plaza, tienda, enfermeria, gimnasio]):- gymnasium(A, _, _, _).
    city(A, [plaza, tienda, enfermeria]):- \\+ gymnasium(A, _, _, _).
    
    % prove cityA is connected to cityB (unidirectional)
    connected(A, B):- route(_, A, B, _, _).
    connected(A, B):- route(_, B, A, _, _).

    % get route from cityA and cityB
    getRoute(A, B, Route):- route(Route, A, B, _, _).
    getRoute(A, B, Route):- route(Route, B, A, _, _).

    % get connected cities to current city
    connectedCities(Cities) :-
        location(City, _),
        findall(B, (map(B, _), connected(City, B)), Cities).
    `;
