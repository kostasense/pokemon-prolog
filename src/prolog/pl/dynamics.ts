export const dynamics = `
    % ==== POKEMON ====
    :- dynamic nextTag/1.
    :- dynamic owned/9.
    :- dynamic enemy/6.

    % ==== PLAYER ====
    :- dynamic backpack/3.
    :- dynamic location/2.
    :- dynamic activePokemon/1.
    :- dynamic playerEggs/3.

    :- retractall(backpack(_, _, _)), asserta(location(littleroot, square)).
    :- retractall(backpack(_, _, _)), asserta(backpack(0, [], [])).
    :- retractall(activePokemon(_)), asserta(activePokemon(none)).
    :- retractall(playerEggs(_, _, _)), asserta(playerEggs(none, none, none)).

    :- retractall(nextTag(_)), asserta(nextTag(1)).
    :- retractall(owned(_, _, _, _, _, _, _, _, _)), asserta(owned(none, none, none, none, none, none, none, none, none)).
`;
