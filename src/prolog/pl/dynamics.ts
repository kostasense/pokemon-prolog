export const dynamics = `
    % ==== POKEMON ====
    %:- dynamic nextTag/1.
    %:- dynamic owned/9.
    %:- dynamic enemy/6.

    % ==== PLAYER ====
    %:- dynamic backpack/3.
    %:- dynamic location/2.
    %:- dynamic activePokemon/1.
    %:- dynamic playerEggs/3.

    init_game:-
        retractall(backpack(_, _, _)), asserta(backpack(0, [], [])),
        retractall(location(_, _)), asserta(location(littleroot, plaza)),
        retractall(activePokemon(_)), asserta(activePokemon(none)),
        retractall(playerEggs(_, _, _)), asserta(playerEggs(none, none, none)),
        retractall(inRoute(_, _)), asserta(inRoute(none, none)),
        retractall(inBattle(_)), asserta(inBattle(no)),

        retractall(nextTag(_)), asserta(nextTag(1)),
        retractall(owned(_, _, _, _, _, _, _, _, _)), asserta(owned(none, none, none, none, none, none, none, none, none)),
        retractall(enemy(_, _, _, _, _, _)), asserta(enemy(none, none, none, none, none, none)), 
        retractall(ownedEvolutions(_, _)), asserta(ownedEvolutions(none, [])),
        
        retractall(winner(_, _)), asserta(winner(none, none)),
        retractall(hitWith(_)), asserta(hitWith(none)).
`;
