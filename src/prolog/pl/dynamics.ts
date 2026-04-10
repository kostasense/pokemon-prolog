export const dynamics = `
    init_game:-
        retractall(backpack(_, _, _, _)), asserta(backpack(100, [stone, heat, feather, rain, knuckle, dynamo], [], [])),
        retractall(location(_, _)), asserta(location(littleroot, plaza)),
        retractall(activePokemon(_)), asserta(activePokemon(none)),
        retractall(playerEggs(_, _, _)), asserta(playerEggs(none, none, none)),
        retractall(inRoute(_, _)), asserta(inRoute(none, none)),
        retractall(inBattle(_)), asserta(inBattle(no)),

        retractall(nextTag(_)), asserta(nextTag(1)),
        retractall(owned(_, _, _, _, _, _, _, _, _)), asserta(owned(none, none, none, none, none, none, none, none, none)),
        retractall(enemy(_, _, _, _, _, _)), asserta(enemy(none, none, none, none, none, none)), 
        retractall(ownedEvolutions(_, _)), asserta(ownedEvolutions(none, [])),
        retractall(computer(_)), asserta(computer([])),

        retractall(winner(_, _)), asserta(winner(none, none)),
        retractall(hitWith(_)), asserta(hitWith(none)),
        retractall(startingHP(_)), asserta(startingHP(none)).
`;
