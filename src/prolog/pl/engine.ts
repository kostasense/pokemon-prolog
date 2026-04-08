export const engine = `
    % ==== HELPERS ====
    % get a list of pairs and return only values
    pairs_values([], []).

    pairs_values([_-V | T], [V | R]):-
        pairs_values(T, R).

    % take first N elements of a list
    take(0, _, []).
    take(_, [], []).
    take(N, [H | T], [H | R]):-
        N > 0,
        N1 is N - 1,
        take(N1, T, R).

    % find all posible (not evolved) pokemon and return a random one
    randomPokemon(O):-
        findall(X, egg(X, _), All),
        random_member(O, All).

    % generate tag
    % nextTag(1).
    generateTag(Tag):-
        retract(nextTag(Tag)),
        Next is Tag + 1,
        asserta(nextTag(Next)).

    % mark moves as learned or forgotten in a given list
    learnMoves(_, [], []).

    learnMoves(Learned, [M-locked | T], [M-learned | R]):-
        member(M, Learned),
        learnMoves(Learned, T, R).

    learnMoves(Learned, [M-locked | T], [M-forgotten | R]):-
        \\+ member(M, Learned),
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

    % given (base) pokemon level get its current evolution
    currentEvolution(Pokemon, Level, Result) :-
        evolves(Pokemon, Evolution, Required),
        Level >= Required,
        currentEvolution(Evolution, Level, Result).

    currentEvolution(Pokemon, _, Pokemon).

    % ==== POKEMON ====
    nextLevel(Level, RequiredExp):- RequiredExp is 50 + (20 * Level).

    % learns move at level ?
    learnsAt(Type, Move, Level):- move(Move, Type, _, Level).
    learnsAt(_, Move, Level):- move(Move, normal, _, Level).

    % all moves for a pokemon given type
    allMoves(Type, Moves):- findall(M-locked, (move(M, Type, _, _) ; move(M, normal, _, _)), U), sort(U, Moves).

    % mark the four most recent moves as learned given level and pokemon type
    pokemonMoves(Pokemon, Level, Moves):-
        type(Pokemon, Type),
        allMoves(Type, AllMoves),
        findall(MoveLevel-Move, (learnsAt(Type, Move, MoveLevel), MoveLevel =< Level), A),
        sort(A, S),
        reverse(S, Reversed),
        take(4, Reversed, T),
        pairs_values(T, M),
        learnMoves(M, AllMoves, Moves).

    % base form given an evolved pokemon (or not)
    baseForm(Pokemon, Base) :-
        \\+ evolves(_, Pokemon, _),
        Base = Pokemon.

    baseForm(Pokemon, Base) :-
        evolves(Pre, Pokemon, _),
        baseForm(Pre, Base).

    % all evolutions for a pokemon
    allEvolutions(Pokemon, Evolutions):- findall(E-locked, reachable(Pokemon, E), Evolutions).

    % direct evolution
    reachable(Pokemon, E):- evolves(Pokemon, E, _).

    % transitive — goes through the chain
    reachable(Pokemon, E):- evolves(Pokemon, Mid, _), reachable(Mid, E).

    % mark evolution as evolved
    pokemonEvolutions(_, _, [], []).

    pokemonEvolutions(Pokemon, Level, [E-locked | T], [E-evolved | R]):-
        evolves(Pokemon, E, L),
        L =< Level,
        pokemonEvolutions(E, Level, T, R).

    pokemonEvolutions(_, Level, [E-S | T], [E-S | R]):- pokemonEvolutions(E, Level, T, R).

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
    % owned(tag, pokemon, state, level, atk, current-hp, max-hp, exp, moves)
    % owned(tag, pokemon, state, level, atk, current-hp, max-hp, exp, moves)
    % inBattle(yes | no).
    % inRoute(route, city).
    % idle(none).

    % select a city in map to travel
    selectCity(CityB):-
        location(CityA, _),

        connected(CityA, CityB), % allow travel if they are connected, you can comment this if you're gonna check it separetly
        getRoute(CityA, CityB, Route),

        retract(inRoute(_, _)),
        assert(inRoute(Route, CityB)).

    % choose active pokemon for fights
    choosePokemon(Tag):-
        retract(activePokemon(_)),
        asserta(activePokemon(Tag)),

        % save starting hp
        owned(Tag, _, _, _, _, CurrentHP, _, _, _),
        retract(startingHP(_)),
        asserta(startingHP(CurrentHP)).

    % change player's location
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
        asserta(owned(Tag, Pokemon, healthy, Level, Atk, HP, HP, 0, Moves)).

    % catch pokemon 
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

        % get pokemon evolutions
        baseForm(Pokemon, Base),
        allEvolutions(Base, AllEvolutions),
        pokemonEvolutions(Base, Level, AllEvolutions, Evolutions),

        % catch pokemon
        retract(enemy(_, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves)),
        asserta(ownedEvolutions(Tag, Evolutions)).

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

    % assert as owned the chosen starter pokemon
    chooseStarter(Pokemon):-
        generateTag(Tag),

        % pokemon stats
        baseStats(Pokemon, BaseAtk, BaseHP),
        random_between(2, 4, Level),
        scaledAttack(BaseAtk, Level, Atk),
        scaledHP(BaseHP, Level, HP),
        pokemonMoves(Pokemon, Level, Moves),

        allEvolutions(Pokemon, AllEvolutions),
        pokemonEvolutions(Pokemon, Level, AllEvolutions, Evolutions),

        retractall(owned(_, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, healthy, Level, Atk, HP, HP, 0, Moves)),

        retractall(ownedEvolutions(_, _)),
        asserta(ownedEvolutions(Tag, Evolutions)).

    % heal pokemon
    healPokemon(Tag):-
        owned(Tag, Pokemon, _, Level, Atk, _, MaxHP, Exp, Moves),

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, healthy, Level, Atk, MaxHP, MaxHP, Exp, Moves)).

    % level up pokemon
    levelUp():-
        activePokemon(Tag),
        owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves),

        nextLevel(Level, RequiredExp),
        Exp >= RequiredExp,

        % new stats
        NewLevel is Level + 1,
        NewAtk is Atk + 2,
        NewHP is MaxHP + 3,

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, NewLevel, NewAtk, CurrentHP, NewHP, 0, Moves)). 

    % check if active pokemon wants to evolve 
    checkEvolution(Pokemon):-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, Level, _, _, _, _, _),
        evolves(Pokemon, E, EvoLevel),
        ownedEvolutions(Tag, Evolutions),
        member(E-locked, Evolutions),
        Level >= EvoLevel.

    % mark evolution as evolved or rejected
    resolveEvolution(Choice):-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, _, _, _, _, _, _),
        evolves(Pokemon, E, _),
        ownedEvolutions(Tag, Evolutions),
        updateEvolutions(E, Choice, Evolutions, New),

        retract(ownedEvolutions(Tag, _)),
        asserta(ownedEvolutions(Tag, New)).

    updateEvolutions(_, _, [], []).
    updateEvolutions(E, NewState, [E-_ | T], [E-NewState | R]):- updateEvolutions(E, NewState, T, R).
    updateEvolutions(Evolution, NewState, [E-S | T], [E-S | R]):- E \\= Evolution, updateEvolutions(Evolution, NewState, T, R).

    % ==== RANDOM ENCOUNTER ====
    % enemy(pokemon, level, atk, current-hp, max-hp, moves)

    % events
    % wild pokemon
    % trainer
    % egg appears % TODO
    % pokeball appears % TODO
    generateEvent(Type):- random_member([pokemon, trainer, egg, pokeball], Type).

    % event(Type).

    enterBattle(Type) :-
        inRoute(Route, _),
        determineEncounter(Route, Type, FinalType),
        
        % change state
        retract(inBattle(_)),
        asserta(inBattle(yes)),
        
        encounter(Route, FinalType).

    determineEncounter(Route, trainer, trainer) :-
        trainer(Route, _, _, _, no), !.

    determineEncounter(Route, trainer, pokemon) :-
        trainer(Route, _, _, _, yes), !.

    determineEncounter(_, pokemon, pokemon).

    % generate random encounter of given type
    encounter(Route, Type):-
        Type == pokemon,
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

        % change pokemon to its evolved form (if it applies)
        currentEvolution(Pokemon, Level, Result),

        % set type of fight in winner predicate
        retract(winner(_, _)),
        asserta(winner(none, Type)),

        % assert enemy
        retractall(enemy(_, _, _, _, _, _)),
        asserta(enemy(Result, Level, Atk, HP, HP, Moves)).

    encounter(Route, Type):-
        Type == trainer,
        route(Route, _, _, _, Difficulty),
        difficulty(Difficulty, L, U),
        random_between(L, U, Level),

        % trainer
        random_between(50, 250, Money),
        retract(trainer(Route, Trainer, _, Pokemon, Defeated)),
        asserta(trainer(Route, Trainer, Money, Pokemon, Defeated)),

        % set pokemon stats
        baseForm(Pokemon, Base),
        baseStats(Base, BaseAtk, BaseHP),
        scaledAttack(BaseAtk, Level, Atk),
        scaledHP(BaseHP, Level, HP),
        learnMoves(Pokemon, Level, Moves),

        % set type of fight in winner predicate
        retract(winner(_, _)),
        asserta(winner(none, Type)),
        
        % assert enemy
        retractall(enemy(_, _, _, _, _, _)),
        asserta(enemy(Pokemon, Level, Atk, HP, HP, Moves)).

    % ==== BATTLE LOGIC ====
    % hitWith(none).
    % startingHP(none). 
    hitEnemy:-
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

    hitEnemy:-
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

    hitPlayer:-
        activePokemon(Tag),
        owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves),

        % get enemy stats
        enemy(_, _, EnemyAtk, _, _, _),
        hitWith(Move),

        % calculate damage done
        weakTo(Pokemon, Move),
        move(Move, _, MoveAtk, _),
        Damage is EnemyAtk * MoveAtk * 2,
        
        % assert new hp,
        NewHP is CurrentHP - min(Damage, CurrentHP),
        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, NewHP, MaxHP, Exp, Moves)).

    hitPlayer:-
        activePokemon(Tag),
        owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves),

        % get enemy stats
        enemy(_, _, EnemyAtk, _, _, _),
        hitWith(Move),

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
        random_member(Move, Learned),
        
        retract(hitWith(_)),
        asserta(hitWith(Move)).

    % check if either pokemon has fainted
    fainted(enemy):- enemy(_, _, _, HP, _, _), HP == 0.

    fainted(player) :-
        activePokemon(Tag),
        owned(Tag, _, _, _, _, HP, _, _, _),
        HP == 0.

    % winner(player | enemy, pokemon | trainer)
    % winner(none, none).
    calculate(CurrentHP, StartingHP, MaxHP, Porcentage):- 
        Lost is StartingHP - CurrentHP,
        Porcentage is Lost / MaxHP * 100.

    checkWinner(Round):-
        Round == 4,

        % check hp lost for opponent
        enemy(_, _, _, EnemyCurrent, EnemyMax, _),
        calculate(EnemyCurrent, EnemyMax, EnemyMax, EnemyLost),

        % check hp lost for player
        activePokemon(Tag),
        startingHP(PlayerStarting),
        owned(Tag, _, _, _, _, PlayerCurrent, PlayerMax, _, _),
        calculate(PlayerCurrent, PlayerStarting, PlayerMax, PlayerLost),

        PlayerLost > EnemyLost,
        retract(winner(_, Type)),
        asserta(winner(enemy, Type)).

    checkWinner(Round):-
        Round == 4,

        % check hp lost for opponent
        enemy(_, _, _, EnemyCurrent, EnemyMax, _),
        calculate(EnemyCurrent, EnemyMax, EnemyMax, EnemyLost),

        % check hp lost for player
        activePokemon(Tag),
        startingHP(PlayerStarting),
        owned(Tag, _, _, _, _, PlayerCurrent, PlayerMax, _, _),
        calculate(PlayerCurrent, PlayerStarting, PlayerMax, PlayerLost),

        PlayerLost < EnemyLost,
        retract(winner(_, Type)),
        asserta(winner(player, Type)).

    checkWinner(Round):-
        Round == 4,

        % check hp lost for opponent
        enemy(_, _, _, EnemyCurrent, EnemyMax, _),
        calculate(EnemyCurrent, EnemyMax, EnemyMax, EnemyLost),

        % check hp lost for player
        activePokemon(Tag),
        startingHP(PlayerStarting),
        owned(Tag, _, _, _, _, PlayerCurrent, PlayerMax, _, _),
        calculate(PlayerCurrent, PlayerStarting, PlayerMax, PlayerLost),

        PlayerLost == EnemyLost,
        retract(winner(_, Type)),
        asserta(winner(draw, Type)).

    checkWinner(_):-
        fainted(player),

        retract(winner(_, Type)),
        asserta(winner(enemy, Type)).

    checkWinner(_):-
        fainted(enemy),

        retract(winner(_, Type)),
        asserta(winner(player, Type)).

    % change pokemon to new state depending on its current hp
    updateState:-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, Level, Atk, CurrentHP, MaxHP, Exp, Moves),
        pokemonHealth(CurrentHP, MaxHP, NewState),

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, NewState, Level, Atk, CurrentHP, MaxHP, Exp, Moves)).

    % gained experience depending on enemy level
    gainedExp(Exp):-
        winner(player, _),
        enemy(_, EnemyLevel, _, _, _, _),
        NewExp is Exp + EnemyLevel * 15,

        retract(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, NewExp, Moves)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, NewExp, Moves)).

    gainedExp(Exp):-
        winner(draw, _),
        enemy(_, EnemyLevel, _, _, _, _),
        NewExp is Exp + EnemyLevel * 15 / 2,

        retract(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, NewExp, Moves)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, NewExp, Moves)).

    gainedExp(0).

    % gained money
    gainedMoney(Gained):-
        winner(player, trainer),

        inRoute(Route, _),
        trainer(Route, _, Money, _, _),
        backpack(CurrentMoney, Pokeballs, Team),

        Gained is (Money * 0.5),
        NewMoney is CurrentMoney + Gained,

        retract(backpack(_, _, _)),
        asserta(backpack(NewMoney, Pokeballs, Team)).

    gainedMoney(Gained):-
        winner(enemy, trainer),
        backpack(Money, Pokeballs, Team),
        
        Gained is -(Money * 0.1),
        NewMoney is Money + Gained,
        retract(backpack(_, _, _)),
        asserta(backpack(NewMoney, Pokeballs, Team)).

    gainedMoney(0).

    % exit battle
    allowTravel:-
        inRoute(_, CityA),
        travel(CityA, plaza),
        retract(inRoute(_, _)),
        asserta(inRoute(none, none)).

    exitBattle:-
        retract(inBattle(_)),
        asserta(inBattle(no)),
        retract(idle(_)),
        asserta(idle(city)).

    endBattle:-
        winner(player, _),
        updateState,
        allowTravel,
        exitBattle.

    endBattle:-
        winner(none, _),
        allowTravel,
        exitBattle.

    endBattle:-
        winner(enemy, pokemon),
        updateState,
        allowTravel,
        exitBattle.

    endBattle:-
        winner(enemy, trainer),
        updateState,
        exitBattle.
`;
