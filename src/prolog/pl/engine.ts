export const engine = `
    % ==== HELPERS ====
    % take first N elements of a list
    take(0, _, []).
    take(_, [], []).
    take(N, [H | T], [H | R]) :-
        N > 0,
        N1 is N - 1,
        take(N1, T, R).

    % find all posible pokemon and return a random one
    randomPokemon(O):-
        findall(X, type(X, _), All),
        random_member(O, All).

    % generate tag
    % nextTag(1).
    generateTag(Tag):-
        retract(nextTag(Tag)),
        Next is Tag + 1,
        asserta(nextTag(Next)).

    % mark as learned moves in a given list
    learnMoves(_, [], []).

    learnMoves(Learned, [M-locked | T], [M-learned | R]) :-
        member(M, Learned),
        learnMoves(Learned, T, R).

    learnMoves(Learned, [M-locked | T], [M-forgotten | R]) :-
        \+ member(M, Learned),
        move(M, _, _, ML),
        findall(LL, (member(LM, Learned), move(LM, _, _, LL)), LLs),
        min_list(LLs, MinLL),
        ML =< MinLL,
        learnMoves(Learned, T, R).

    learnMoves(Learned, [M-S | T], [M-S | R]) :-
        learnMoves(Learned, T, R).

    % return list with only learned moves
    getLearned([], []).
    getLearned([M-learned | T], [M | R]):- getLearned(T, R).

    % show player learned moves only
    showLearned(Tag, Learned):- owned(Tag, _, _, _, _, _, _, _, Moves), getLearned(Moves, Learned).

    % select move for player
    selectMove(Move):- retract(hitWith(_)), asserta(hitWith(Move)).

    % ==== POKEMON ====
    nextLevel(Level, RequiredExp):- RequiredExp is 50 + (20 * Level).

    % learns move at level ?
    learnsAt(Type, Move, Level):- move(Move, Type, _, Level).
    learnsAt(_, Move, Level):- move(Move, normal, _, Level).

    % available moves for a pokemon given type
    availableMoves(Type, Moves):- findall(M-locked, (move(M, Type, _, _) ; move(M, normal, _, _)), M), sort(M, Moves).

    % mark the four most recent moves as learned given level and pokemon type
    pokemonMoves(Pokemon, Level, Moves):-
        type(Pokemon, Type),
        availableMoves(Type, AllMoves),
        findall(MoveLevel-Move, (learnsAt(Type, Move, MoveLevel), MoveLevel =< Level), A),
        sort(0, @>=, A, S),
        take(4, S, T),
        pairs_values(T, M),
        learnMoves(M, AllMoves, Moves).

    % get scaled stats
    scaledAttack(BaseAtk, Level, Attack) :- Attack is BaseAtk + (Level * 2).
    scaledHP(BaseHP, Level, MaxHP) :- MaxHP is BaseHP + (Level * 3).

    % pokemon state
    pokemonHealth(CurrentHP, MaxHP, healthy):-
        Porcentage is (CurrentHP / MaxHP) * 100,
        Porcentage >= 50.

    pokemonHealth(CurrentHP, MaxHP, weak):-
        Porcentage is (CurrentHP / MaxHP) * 100,
        Porcentage >= 20,
        Porcentage < 50.

    pokemonHealth(CurrentHP, _, low):- CurrentHP >= 1.
    pokemonHealth(0, _, fainted).

    % ==== PLAYER ====
    % backpack(money, [pokeballs], [team])
    % player state
    traveling(none).
    battling(none, none).
    idling(map).

    % move to another city
    travel(City, Location) :-
        retractall(location(_, _)),
        asserta(location(City, Location)).

    % update egg distance
    growEgg(Route, [Tag-Type | T]):-
        Type == egg,
        playerEggs(Tag, Pokemon, CurrentDistance),
        route(Route, _, _, RouteDistance, _),
        NewDistance is CurrentDistance - min(RouteDistance, CurrentDistance), 
        retract(playerEggs(Tag, Pokemon, _)),
        asserta(playerEggs(Tag, Pokemon, NewDistance)),

        growEgg(Route, T).

    % check if any eggs are about to hatch
    checkEgg([], []).
    checkEgg([Tag-Type | T], [Tag | R]):-
        Type == egg,
        playerEggs(Tag, _, Distance),
        Distance == 0,
        checkEgg(T, R).

    hatchEgg(Tag):-
        playerEggs(Tag, Pokemon, _),
        baseStats(Pokemon, BaseAtk, BaseHP),
        random_between(2, 4, Level),
        scaledAttack(BaseAtk, Level, Atk),
        scaledHP(BaseHP, Level, HP),
        pokemonMoves(Pokemon, Level, Moves),
        retract(playerEggs(Tag, _, _)),
        asserta(owned(Tag, Pokemon, Level, Atk, HP, HP, 0, Moves)).

    % owned(tag, pokemon, state, level, atk, current-hp, max-hp, exp, moves)
    % owned(none, none, none, none, none, none, none, none, none).

    % catch(pokemon)
    attemptCatch(Pokemon, Pokeball):-
        usePokeball(Pokeball),
        enemy(Pokemon, Level, Atk, CurrentHP, MaxHP, Moves),
        catchChance(CurrentHP, MaxHP, Chance),
        random_between(1, 100, Roll),
        Roll =< Chance,
        catchSuccess(Pokemon, Level, Atk, CurrentHP, MaxHP, Moves).

    catchSuccess(Pokemon, Level, Atk, CurrentHP, MaxHP, Moves):-
        generateTag(Tag),

        % random experience
        nextLevel(Level, U),
        random_between(0, U, Exp),
        pokemonHealth(CurrentHP, MaxHP, State),

        % catch pokemon
        retract(enemy(_, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves)).

    catchChance(CurrentHP, MaxHP, Chance):-
        LostHP is abs(((CurrentHP / MaxHP) * 100) - 100),
        Chance is 50 + (LostHP / 15) * 10.

    % pokeballs
    usePokeball(P):-
        backpack(Money, Pokeballs, Team),
        select(P, Pokeballs, New),

        % update
        retract(backpack(_, _, _)),
        assert(backpack(Money, New, Team)).

    chooseStarter(Pokemon):-
        generateTag(Tag),

        % pokemon stats
        baseStats(Pokemon, BaseAtk, BaseHP),
        random_between(2, 4, Level),
        scaledAttack(BaseAtk, Level, Atk),
        scaledHP(BaseHP, Level, HP),
        pokemonMoves(Pokemon, Level, Moves),

        retract(owned(_, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, healthy, Level, Atk, HP, HP, 0, Moves)).

    healPokemon(Tag):-
        owned(Tag, Pokemon, _, Level, Atk, _, MaxHP, Exp, Moves),

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, healthy, Level, Atk, MaxHP, Exp, Moves)).

    % ==== RANDOM ENCOUNTER ====
    % enemy(pokemon, level, atk, current-hp, max-hp, moves)
    enemy(none, none, none, none, none, none).

    % generate random encounter of type T
    % 0 -> wild pokemon
    % 1 -> trainer
    encounter(Route, T):-
        T == 0,
        % get encounter difficulty
        route(Route, _, _, _, Difficulty),
        difficulty(Difficulty, L, U),
        random_between(L, U, Level),

        % set pokemon stats
        randomPokemon(Pokemon),
        baseStats(Pokemon, BaseAtk, BaseHP),
        scaledAttack(BaseAtk, Level, Atk),
        scaledHP(BaseHP, Level, HP),
        learnMoves(Pokemon, Level, Moves),
        retractall(enemy(_, _, _, _, _, _)),
        asserta(enemy(Pokemon, Level, Atk, HP, HP, Moves)).

    encounter(Route, T):-
        T == 1,
        route(Route, _, _, _, Difficulty),
        difficulty(Difficulty, L, U),
        random_between(L, U, Level),

        % trainer
        random_between(50, 250, Money),
        retract(trainer(Route, Trainer, _, Pokemon, Defeated)),
        asserta(trainer(Route, Trainer, Money, Pokemon, Defeated)),

        % set pokemon stats
        baseStats(Pokemon, BaseAtk, BaseHP),
        scaledAttack(BaseAtk, Level, Atk),
        scaledHP(BaseHP, Level, HP),
        learnMoves(Pokemon, Level, Moves),
        retractall(enemy(_, _, _, _, _, _)),
        asserta(enemy(Pokemon, Level, Atk, HP, HP, Moves)).

    % ==== BATTLE LOGIC ====
    % hit enemy
    hitWith(none).

    hitEnemy():-
        enemy(Pokemon, Level, EnemyAtk, CurrentHP, MaxHP, Moves),

        % get active pokemon attack
        activePokemon(Tag),
        owned(Tag, _, _, _, Atk, _, _, _, _),

        % calculate damage done
        hitWith(Move),
        weakTo(Pokemon, Move),
        move(Move, _, MoveAtk, _),
        Damage is Atk * MoveAtk * 2,

        % assert new hp,
        NewHP is CurrentHP - min(Damage, CurrentHP),
        retract(enemy(_, _, _, _, _, _)),
        asserta(enemy(Pokemon, Level, EnemyAtk, NewHP, MaxHP, Moves)).

    hitEnemy():-
        enemy(Pokemon, Level, EnemyAtk, CurrentHP, MaxHP, Moves),

        % get active pokemon attack
        activePokemon(Tag),
        owned(Tag, _, _, _, Atk, _, _, _, _),

        % calculate damage done
        hitWith(Move),
        move(Move, _, MoveAtk, _),
        Damage is Atk * MoveAtk,

        % assert new hp,
        NewHP is CurrentHP - min(Damage, CurrentHP),
        retract(enemy(_, _, _, _, _, _)),
        asserta(enemy(Pokemon, Level, EnemyAtk, NewHP, MaxHP, Moves)).

    hitPlayer():-
        activePokemon(Tag),
        owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves),

        % get enemy stats and move
        enemy(_, _, EnemyAtk, _, _, Moves),
        getLearned(Moves, Learned),
        random_member(Move, Learned),

        % calculate damage done
        weakTo(Pokemon, Move),
        move(Move, _, MoveAtk, _),
        Damage is EnemyAtk * MoveAtk * 2,

        % assert new hp,
        NewHP is CurrentHP - min(Damage, CurrentHP),
        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, NewHP, MaxHP, Exp, Moves)).

    hitPlayer(Move):-
        activePokemon(Tag),
        owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves),

        % get enemy stats and move
        enemy(_, _, EnemyAtk, _, _, _),

        % calculate damage done
        move(Move, _, MoveAtk, _),
        Damage is EnemyAtk * MoveAtk,

        % assert new hp,
        NewHP is CurrentHP - min(Damage, CurrentHP),
        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, NewHP, MaxHP, Exp, Moves)).

    enemyMove(Move):-
        enemy(_, _, _, _, _, Moves),
        getLearned(Moves, Learned),
        random_member(Move, Learned).

    % check if either pokemon has fainted
    fainted(enemy):- enemy(_, _, _, HP, _, _), HP == 0.

    fainted(player) :-
        activePokemon(Tag),
        owned(Tag, _, _, _, _, HP, _, _, _),
        HP == 0.

    % winner(player | enemy, pokemon | trainer)
    winner(none, none).

    finishBattle():-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, Level, Atk, CurrentHP, MaxHP, Exp, Moves),
        pokemonHealth(CurrentHP, MaxHP, NewState),

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, NewState, Level, Atk, CurrentHP, MaxHP, Exp, Moves)),

        % update based on winner
        winner(player, trainer),
        battling(Route, CityA),
        trainer(Route, Trainer, Money, Pokemon, _),

        retract(trainer(Route, _, _, _, _)),
        asserta(trainer(Route, Trainer, Money, Pokemon, yes)),

        retract(player(CurrentMoney, Pokeballs, Team)),
        NewMoney is CurrentMoney + (Money * 0.5),
        assert(player(NewMoney, Pokeballs, Team)),

        % change location to destined city
        travel(CityA, square).

    finishBattle():-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, Level, Atk, CurrentHP, MaxHP, Exp, Moves),
        pokemonHealth(CurrentHP, MaxHP, NewState),

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, NewState, Level, Atk, CurrentHP, MaxHP, Exp, Moves)),

        % update based on winner
        winner(trainer, trainer).

    finishBattle().
`;
