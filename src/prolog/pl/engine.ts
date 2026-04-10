export const engine = `
    % ==== HELPERS ====
    %!  addPair(+Key, +Value, +Pairs, -New)
    %   returns new list with element added
    addPair(K, V, Pairs, [K-V | Pairs]).

    %!  add(+Value, +List, -New)
    %   returns new list with element added
    add(V, List, [V | List]).

    %!  pairs_values(+List, -New)
    %   get a list of pairs and return only values
    pairs_values([], []).
    pairs_values([_-V | T], [V | R]):- pairs_values(T, R).

    %!  take(Int, +List, -New)
    %   take first N elements of a list
    take(0, _, []).
    take(_, [], []).
    take(N, [H | T], [H | R]):-
        N > 0,
        N1 is N - 1,
        take(N1, T, R).

    %!  randomPokemon(-Object)
    %   find all posible (not evolved) pokemon and return a random one
    randomPokemon(O):- findall(X, egg(X, _), All), random_member(O, All).

    %!  generateTag(-Tag)
    generateTag(Tag):-
        retract(nextTag(Tag)),
        Next is Tag + 1,
        asserta(nextTag(Next)).

    %!  learnMoves(+Learned, +Moves, -Updated)
    %   update moves as learned or forgotten
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

    %!  getLearned(+Moves, -Learned)
    %   return list with only learned moves
    getLearned([], []).
    getLearned([M-learned | T], [M | R]):- getLearned(T, R).
    getLearned([_-_ | T], R):- getLearned(T, R).

    % ==== POKEMON ====
    %!  nextLevel(+Level, -RequiredExp)
    %   calculates required experience for next level
    nextLevel(Level, RequiredExp):- RequiredExp is 50 + (20 * Level).

    %!  newMoves(-List)
    %   returns new moves for <active> pokemon, will return false if there isn't any    
    newMove(NewMoves):-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, Level, _, _, _, _, Moves),
        type(Pokemon, Type),
        findall(M, (learnsAt(Type, M, L), L =< Level, member(M-locked, Moves)), All),
        sort(All, NewMoves).

    %!  forgetMove(+Move)
    %   marks given move as forgotten for <active> pokemon
    forgetMove(Move):-
        activePokemon(Tag),
        owned(Tag, A, B, C, D, E, F, G, Moves),
        updateMoves(Move, forgotten, Moves, New),
        
        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, A, B, C, D, E, F, G, New)).

    %!  resolveMove(+Move, +Choice)
    %   marks move as given choice (must be rejected or learned), will return false if choice = learned and pokemon knows four moves already
    resolveMove(Move, learned):-
        activePokemon(Tag),
        owned(Tag, A, B, C, D, E, F, G, Moves),
        getLearned(Moves, Learned),
        length(Learned, Length),
        Length < 4,
        updateMoves(Move, learned, Moves, New),
        
        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, A, B, C, D, E, F, G, New)).

    resolveMove(Move, rejected):-
        activePokemon(Tag),
        owned(Tag, A, B, C, D, E, F, G, Moves),
        updateMoves(Move, rejected, Moves, New),
        
        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, A, B, C, D, E, F, G, New)).

    %!  updateMoves(+Move, +State, +All, -New)
    %   marks move as given state 
    updateMoves(_, _, [], []).
    updateMoves(M, State, [M-_ | T], [M-State | R]):- updateMoves(M, State, T, R).
    updateMoves(Move, State, [M-S | T], [M-S | R]):- M \\= Move, updateMoves(Move, State, T, R).

    %!  learnsAt(+Type, ?Move, ?Level)
    %   returns when will a move be learned based on given type
    learnsAt(Type, Move, Level):- move(Move, Type, _, Level).
    learnsAt(_, Move, Level):- move(Move, normal, _, Level).

    %!  allMoves(+Type, -Moves)
    %   all available moves for a pokemon
    allMoves(Type, Moves):- findall(M-locked, (move(M, Type, _, _) ; move(M, normal, _, _)), U), sort(U, Moves).

    %!  pokemonMoves(+Pokemon, +Level, -Moves)
    %   returns a list with all moves a pokemon knows, moves its forgotten and moves that are still locked
    pokemonMoves(Pokemon, Level, Moves):-
        type(Pokemon, Type),
        allMoves(Type, AllMoves),
        findall(MoveLevel-Move, (learnsAt(Type, Move, MoveLevel), MoveLevel =< Level), A),
        sort(A, S),
        reverse(S, Reversed),
        take(4, Reversed, T),
        pairs_values(T, M),
        learnMoves(M, AllMoves, Moves).

    %!  showLearned(+Tag, -Learned)
    %   shows learned moves only
    showLearned(Tag, Learned):- owned(Tag, _, _, _, _, _, _, _, Moves), getLearned(Moves, Learned).

    %!  currentEvolution(+Pokemon, +Level, -Result)
    %   returns current stage of evolution of given pokemon
    currentEvolution(Pokemon, Level, Result) :- evolves(Pokemon, Evolution, Required), Level >= Required, currentEvolution(Evolution, Level, Result).
    currentEvolution(Pokemon, _, Pokemon).

    %!  baseForm(+Pokemon, -Base)
    %   returns base form of a given pokemon
    baseForm(Pokemon, Base) :- \\+ evolves(_, Pokemon, _), Base = Pokemon.
    baseForm(Pokemon, Base) :- evolves(Pre, Pokemon, _), baseForm(Pre, Base).

    %!  allEvolutions(+Pokemon, -Evolutions) 
    %   all evolutions for a pokemon
    allEvolutions(Pokemon, Evolutions):- baseForm(Pokemon, Base), findall(E-locked, reachable(Base, E), L), Evolutions = [Base-evolved | L].

    %!  reachable(+Pokemon, -Evolution)
    %   returns evolutions reachable based on current
    reachable(Pokemon, E):- evolves(Pokemon, E, _).
    reachable(Pokemon, E):- evolves(Pokemon, Mid, _), reachable(Mid, E).

    %! evolved(+Pokemon, +Level, +AllEvolutions, -Evolutions)
    %  marks evolutions as <evolved> based on level
    evolved(_, _, [], []).
    evolved(Pokemon, Level, [E-locked | T], [E-evolved | R]):- evolves(Pokemon, E, L), L =< Level, evolved(E, Level, T, R).
    evolved(_, Level, [E-S | T], [E-S | R]):- evolved(E, Level, T, R).

    %   scaledAttack(+BaseAtk, +Level, -Atk)
    %   returns attack based on level
    scaledAttack(BaseAtk, Level, Attack) :- Attack is BaseAtk + (Level * 2).

    %   scaledHP(+BaseHP, +Level, -Atk)
    %   returns max hp based on level
    scaledHP(BaseHP, Level, MaxHP) :- MaxHP is BaseHP + (Level * 3).

    %! pokemonHealth(+CurrentHP, +MaxHP, -State)
    %  determines pokemon's health based on its hp
    pokemonHealth(CurrentHP, MaxHP, healthy):- Porcentage is (CurrentHP / MaxHP) * 100, Porcentage >= 50.
    pokemonHealth(CurrentHP, MaxHP, weak):- Porcentage is (CurrentHP / MaxHP) * 100, Porcentage >= 20.
    pokemonHealth(CurrentHP, _, low):- CurrentHP >= 1.
    pokemonHealth(0, _, fainted).

    %!  pokemonStats(+Pokemon, +Level, -Atk, -HP, -Moves)
    pokemonStats(Pokemon, Level, Atk, HP, Moves):-
        baseStats(Pokemon, BaseAtk, BaseHP),
        scaledAttack(BaseAtk, Level, Atk),
        scaledHP(BaseHP, Level, HP),
        pokemonMoves(Pokemon, Level, Moves).

    % ==== PLAYER ====
    %!  addToTeam(+Tag, +Type)
    %   asserts new team with pokemon or egg added
    addToTeam(Tag, Type):-
        backpack(A, B, C, Team),
        addPair(Tag, Type, Team, NewTeam),
        
        retract(backpack(_, _, _, _)),
        asserta(backpack(A, B, C, NewTeam)).

    %!  removeFromTeam(+Tag)
    %   new list with given pokemon or egg removed
    removeFromTeam(Tag):-
        owned(Tag, Pokemon, _, _, _, _, _, _, _),
        backpack(A, B, C, Team),
        select(Tag-Pokemon, Team, NewTeam),

        retract(backpack(_, _, _, _)),
        asserta(backpack(A, B, C, NewTeam)).

    removeFromTeam(Tag):-
        backpack(A, B, C, Team),
        select(Tag-egg, Team, NewTeam),

        retract(backpack(_, _, _, _)),
        asserta(backpack(A, B, C, NewTeam)).

    %!  sendToComputer(+Tag, +Type)
    sendToComputer(Tag, Type):-
        computer(All),
        addPair(Tag, Type, All, New),

        retract(computer(_)),
        asserta(computer(New)).

    %!  selectCity(+City)
    %   sets inRoute(-Route) based on city selected
    selectCity(CityB):-
        location(CityA, _),
        getRoute(CityA, CityB, Route),

        retract(inRoute(_, _)),
        asserta(inRoute(Route, CityB)).

    %!  choosePokemon(+Tag)
    %   choose active pokemon for fights
    choosePokemon(Tag):-
        retract(activePokemon(_)),
        asserta(activePokemon(Tag)),

        % save starting hp
        owned(Tag, _, _, _, _, CurrentHP, _, _, _),
        retract(startingHP(_)),
        asserta(startingHP(CurrentHP)).

    %!  travel(+City, +Location)
    %   change player's location
    travel(City, Location) :-
        retractall(location(_, _)),
        asserta(location(City, Location)).

    %!  growEgg(+Route, +List)
    %   updates all eggs in list based on distance of given rute
    growEgg(_, []).

    growEgg(Route, [Tag-egg | T]):-
        playerEggs(Tag, Pokemon, CurrentDistance),
        route(Route, _, _, RouteDistance, _),
        NewDistance is CurrentDistance - min(RouteDistance, CurrentDistance), 

        retract(playerEggs(Tag, Pokemon, _)),
        asserta(playerEggs(Tag, Pokemon, NewDistance)),
        growEgg(Route, T).

    growEgg(Route, [_-_ | T]):- growEgg(Route, T).

    %!  checkEgg(+List, -List)
    %   returns list with eggs ready to hatch
    checkEgg([], []).
    checkEgg([Tag-egg | T], [Tag | R]):- playerEggs(Tag, _, 0), checkEgg(T, R).
    checkEgg([_-_ | T], R):- checkEgg(T, R).

    %! hatchEgg(+Tag)
    %  asserts given egg as owned
    hatchEgg(Tag):-
        playerEggs(Tag, Pokemon, _),
        random_between(2, 4, Level),
        pokemonStats(Pokemon, Level, Atk, HP, Moves),
        
        retract(playerEggs(Tag, _, _)),
        asserta(owned(Tag, Pokemon, healthy, Level, Atk, HP, HP, 0, Moves)), 
        
        removeFromTeam(Tag),
        addToTeam(Tag, Pokemon).

    %!  attemptCatch(+Pokeball, -SavedIn)
    %   if successfull, will return if pokemon was saved in backpack or computer
    %   else, will return false
    attemptCatch(Pokeball, SavedIn):-
        usePokeball(Pokeball),
        enemy(Pokemon, State, Level, Atk, CurrentHP, MaxHP, Moves),
        catchChance(CurrentHP, MaxHP, Chance),
        random_between(1, 100, Roll),
        Roll =< Chance,
        catchSuccess(Pokemon, State, Level, Atk, CurrentHP, MaxHP, Moves, SavedIn).

    catchChance(CurrentHP, MaxHP, Chance):-
        LostHP is 100 - (CurrentHP * 100 / MaxHP),
        Chance is 50 + (LostHP / 15 * 10).

    %!  catchSuccess(+Pokemon, +State, +Level, +Atk, +CurrentHP, +MaxHP, +Moves, -SavedIn)
    %   asserts new owned pokemon if catch succeeded
    catchSuccess(Pokemon, State, Level, Atk, CurrentHP, MaxHP, Moves, backpack):-
        % check if there's space in team
        backpack(_, _, _, Team),
        length(Team, Length),
        Length < 4,

        generateTag(Tag),
        addToTeam(Tag, Pokemon),

        % random experience
        nextLevel(Level, U),
        random_between(0, U, Exp),

        % get pokemon evolutions
        baseForm(Pokemon, Base),
        allEvolutions(Base, AllEvolutions),
        evolved(Base, Level, AllEvolutions, Evolutions),

        % catch pokemon
        asserta(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves)),
        asserta(ownedEvolutions(Tag, Evolutions)).

    catchSuccess(Pokemon, State, Level, Atk, CurrentHP, MaxHP, Moves, computer):-
        generateTag(Tag),
        sendToComputer(Tag, Pokemon),

        % random experience
        nextLevel(Level, U),
        random_between(0, U, Exp),

        % get pokemon evolutions
        baseForm(Pokemon, Base),
        allEvolutions(Base, AllEvolutions),
        evolved(Base, Level, AllEvolutions, Evolutions),

        % catch pokemon
        asserta(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves)),
        asserta(ownedEvolutions(Tag, Evolutions)).

    %!  buyPokeball(+Pokeball)
    %   will return false if current money is less than required
    buyPokeball(Pokeball):-
        pokeball(Pokeball, Cost),
        backpack(Money, M, P, Team),

        Cost =< Money,
        NewMoney is Money - Cost,

        add(Pokeball, P, NewP),

        retract(backpack(_, _, _, _)),
        asserta(backpack(NewMoney, M, NewP, Team)).

    %!  usePokeball(+Pokeball)
    %   removes given pokeball from backpack
    usePokeball(Pokeball):-
        backpack(Money, Badges, Pokeballs, Team),
        select(Pokeball, Pokeballs, New),

        retract(backpack(_, _, _, _)),
        asserta(backpack(Money, Badges, New, Team)).

    %! chooseStarter(+Pokemon)
    %  assert as given pokemon as owned
    chooseStarter(Pokemon):-
        generateTag(Tag),
        addToTeam(Tag, Pokemon),

        % pokemon stats
        Level = 5,
        pokemonStats(Pokemon, Level, Atk, HP, Moves),
        allEvolutions(Pokemon, AllEvolutions),
        evolved(Pokemon, Level, AllEvolutions, Evolutions),

        asserta(owned(Tag, Pokemon, healthy, Level, Atk, HP, HP, 0, Moves)),

        retractall(ownedEvolutions(_, _)),
        asserta(ownedEvolutions(Tag, Evolutions)).

    %!  healPokemon(+Tag)
    %   changes given pokemon's hp to full
    healPokemon(Tag):-
        owned(Tag, Pokemon, _, Level, Atk, _, MaxHP, Exp, Moves),

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, healthy, Level, Atk, MaxHP, MaxHP, Exp, Moves)).

    %!  levelUp
    %   levels up <active> pokemon, will return false if current experience is less than required
    levelUp:-
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

    %!  checkEvolution
    %   true if <active> pokemon wants to evolve, will return false if level is less than required or evolution has been rejected before
    checkEvolution:-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, Level, _, _, _, _, _),
        evolves(Pokemon, E, EvoLevel),
        ownedEvolutions(Tag, Evolutions),
        member(E-locked, Evolutions),
        Level >= EvoLevel.

    %!  resolveEvolution(+Choice)
    %   mark evolution as given choice, needs to be <evolved> or <rejected>
    resolveEvolution(evolved) :-
        activePokemon(Tag),
        owned(Tag, Pokemon, A, B, C, D, E, F, G),
        evolves(Pokemon, Evo, _),
        ownedEvolutions(Tag, Evolutions),
        updateEvolutions(Evo, evolved, Evolutions, New),

        retract(ownedEvolutions(Tag, _)),
        asserta(ownedEvolutions(Tag, New)),
        
        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Evo, A, B, C, D, E, F, G)),
        
        removeFromTeam(Tag),
        addToTeam(Tag, Evo).

    resolveEvolution(rejected) :-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, _, _, -, _, _, _),
        evolves(Pokemon, Evo, _),
        ownedEvolutions(Tag, Evolutions),
        updateEvolutions(Evo, rejected, Evolutions, New),

        retract(ownedEvolutions(Tag, _)),
        asserta(ownedEvolutions(Tag, New)).

    %!  updateEvolutions(+Evolution, +NewState, +All, -New)
    %   marks given evolution as <evolved> or <rejected>
    updateEvolutions(_, _, [], []).
    updateEvolutions(E, NewState, [E-_ | T], [E-NewState | R]):- updateEvolutions(E, NewState, T, R).
    updateEvolutions(Evolution, NewState, [E-S | T], [E-S | R]):- E \\= Evolution, updateEvolutions(Evolution, NewState, T, R).

    % ==== EVENTS ====
    %!  enterBattle
    %   changes state to fighting
    enterBattle:-
        retract(inBattle(_)),
        asserta(inBattle(yes)).

    %!  determineEncounter(+Route, +Type, -Final)
    %   if trainer in route has beed defeated, change encounter to wild pokemon
    determineEncounter(Route, trainer, trainer):- trainer(Route, _, _, _, no).
    determineEncounter(Route, trainer, pokemon):- trainer(Route, _, _, _, yes).

    %!  event(-Type)
    %   generates a random event
    event(Type):- 
        Events = [pokemon-35, trainer-35, egg-15, pokeball-15],
        random_between(1, 100, Roll),
        pickEvent(Roll, Events, 0, Type).

    pickEvent(Roll, [E-W | _], A, E):-
        NA is A + W,
        Roll =< NA.

    pickEvent(Roll, [_-W | T], A, Event):-
        NA is A + W,
        pickEvent(Roll, T, NA, Event).

    %!  handleEvent(+Type, -Nothing)
    %   for battle events
    handleEvent(pokemon, _):- 
        inRoute(Route, _),
        encounter(Route, pokemon),
        enterBattle.

    handleEvent(trainer, _):-
        inRoute(Route, _),
        determineEncounter(Route, trainer, Final),
        encounter(Route, Final),
        enterBattle.

    %!  handleEvent(+Type, -Item)
    %   for item-related events
    handleEvent(egg, Item):- randomPokemon(Item).
    handleEvent(pokeball, Item):- findall(P, pokeball(P, _), List), random_member(Item, List).

    %!  pickUpItem(+Type, +Item, -SavedIn)
    pickUpItem(egg, Item, backpack):-
        % check if there's space in team
        backpack(_, _, _, Team),
        length(Team, Length),
        Length < 4,

        generateTag(Tag),
        asserta(playerEggs(Tag, Item)),
        addToTeam(Tag, egg).

    pickUpItem(egg, Item, computer):-
        generateTag(Tag),
        sendToComputer(Tag, egg),
        asserta(playerEggs(Tag, Item)).

    pickUpItem(pokeball, Item, backpack):-
        backpack(A, B, Pokeballs, C),
        add(Item, Pokeballs, New),
        retract(backpack(_, _, _, _)),
        asserta(backpack(A, B, New, C)).

    %!  encounterLevel(+Route, -Level)
    encounterLevel(Route, Level):-
        route(Route, _, _, _, Difficulty),
        difficulty(Difficulty, L, U),
        random_between(L, U, Level).

    %!  encounter(+Route, +Type)
    %   generate random encounter of given type
    encounter(Route, pokemon):-
        encounterLevel(Route, Level),

        % change pokemon to its evolved form (if it applies)
        randomPokemon(Pokemon),
        currentEvolution(Pokemon, Level, Result),

        % set type of fight in winner predicate
        retract(winner(_, _)),
        asserta(winner(none, pokemon)),
        
        setEnemy(Result, Level).

    encounter(Route, trainer):-
        encounterLevel(Route, Level),

        % trainer
        random_between(50, 250, Money),
        retract(trainer(Route, Trainer, _, Pokemon, Defeated)),
        asserta(trainer(Route, Trainer, Money, Pokemon, Defeated)),

        % set type of fight in winner predicate
        retract(winner(_, _)),
        asserta(winner(none, trainer)),
        
        setEnemy(Pokemon, Level).

    %!  setEnemy(+Pokemon, -Level)
    %   helper to set enemy stats
    setEnemy(Pokemon, Level):-
        baseForm(Pokemon, Base),
        pokemonStats(Base, Level, Atk, HP, Moves),
        
        % assert enemy
        retract(enemy(_, _, _, _, _, _)),
        asserta(enemy(Pokemon, healthy, Level, Atk, HP, HP, Moves)).

    % ==== BATTLE LOGIC ====
    %!  selectMove(+Move)
    %   select move for player given name
    selectMove(Move):- retract(hitWith(_)), asserta(hitWith(Move)).

    %!  enemyMove(-Move)
    %   selects a random move for enemy
    enemyMove(Move):-
        enemy(_, _, _, _, _, _, Moves),
        getLearned(Moves, Learned),
        random_member(Move, Learned),
        
        retract(hitWith(_)),
        asserta(hitWith(Move)).

    %!  hitEnemy
    %   updates enemy's current hp and state based on damage done
    hitEnemy:-
        enemy(Pokemon, _, Level, EnemyAtk, CurrentHP, MaxHP, Moves),
        
        % get active pokemon attack
        activePokemon(Tag),
        owned(Tag, _, _, _, Atk, _, _, _, _),

        % calculate damage done
        hitWith(Move),
        weakTo(Pokemon, Move),
        move(Move, _, MoveAtk, _),
        Damage is Atk * MoveAtk * 2,
        
        % assert new hp
        NewHP is CurrentHP - min(Damage, CurrentHP),
        pokemonHealth(CurrentHP, MaxHP, State),

        retract(enemy(_, _, _, _, _, _, _)),
        asserta(enemy(Pokemon, State, Level, EnemyAtk, NewHP, MaxHP, Moves)).

    hitEnemy:-
        enemy(Pokemon, _, Level, EnemyAtk, CurrentHP, MaxHP, Moves),
        
        % get active pokemon attack
        activePokemon(Tag),
        owned(Tag, _, _, _, Atk, _, _, _, _),

        % calculate damage done
        hitWith(Move),
        move(Move, _, MoveAtk, _),
        Damage is Atk * MoveAtk,
        
        % assert new hp,
        NewHP is CurrentHP - min(Damage, CurrentHP),
        pokemonHealth(CurrentHP, MaxHP, State),

        retract(enemy(_, _, _, _, _, _, _)),
        asserta(enemy(Pokemon, State, Level, EnemyAtk, NewHP, MaxHP, Moves)).

    %!  hitPlayer
    %   updates active-pokemon's current hp and state based on damage done
    hitPlayer:-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, Level, Atk, CurrentHP, MaxHP, Exp, Moves),

        % get enemy stats
        enemy(_, _, _, EnemyAtk, _, _, _),
        hitWith(Move),

        % calculate damage done
        weakTo(Pokemon, Move),
        move(Move, _, MoveAtk, _),
        Damage is EnemyAtk * MoveAtk * 2,
        
        % assert new hp,
        NewHP is CurrentHP - min(Damage, CurrentHP),
        pokemonHealth(CurrentHP, MaxHP, State),

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, NewHP, MaxHP, Exp, Moves)).

    hitPlayer:-
        activePokemon(Tag),
        owned(Tag, Pokemon, _, Level, Atk, CurrentHP, MaxHP, Exp, Moves),

        % get enemy stats
        enemy(_, _, _, EnemyAtk, _, _, _),
        hitWith(Move),

        % calculate damage done
        move(Move, _, MoveAtk, _),
        Damage is EnemyAtk * MoveAtk,
        
        % assert new hp,
        NewHP is CurrentHP - min(Damage, CurrentHP),
        pokemonHealth(CurrentHP, MaxHP, State),

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, NewHP, MaxHP, Exp, Moves)).

    %!  fainted(+Object)
    %   check if given object has fainted
    fainted(enemy):- enemy(_, _, _, _, HP, _, _), HP == 0.
    fainted(player):- activePokemon(Tag), owned(Tag, _, _, _, _, HP, _, _, _), HP == 0.

    %!  calculate(+CurrentHP, +StartingHP, +MaxHP, -Porcentage)
    calculate(CurrentHP, StartingHP, MaxHP, Porcentage):- Lost is StartingHP - CurrentHP, Porcentage is Lost / MaxHP * 100.

    %!  checkWinner(+Round)
    %   checks winner given round number
    checkWinner(8):-
        winner(_, gym),

        % check hp lost for opponent
        enemy(_, _, _, _, EnemyCurrent, EnemyMax, _),
        calculate(EnemyCurrent, EnemyMax, EnemyMax, EnemyLost),

        % check hp lost for player
        activePokemon(Tag),
        startingHP(PlayerStarting),
        owned(Tag, _, _, _, _, PlayerCurrent, PlayerMax, _, _),
        calculate(PlayerCurrent, PlayerStarting, PlayerMax, PlayerLost),

        PlayerLost > EnemyLost,
        retract(winner(_, Type)),
        asserta(winner(enemy, Type)),
        
        retract(owned(Tag, B, _, D, E, _, G, H, I)),
        asserta(owned(Tag, B, fainted, D, E, 0, G, H, I)).

    checkWinner(8):-
        % check hp lost for opponent
        enemy(_, _, _, _, EnemyCurrent, EnemyMax, _),
        calculate(EnemyCurrent, EnemyMax, EnemyMax, EnemyLost),

        % check hp lost for player
        activePokemon(Tag),
        startingHP(PlayerStarting),
        owned(Tag, _, _, _, _, PlayerCurrent, PlayerMax, _, _),
        calculate(PlayerCurrent, PlayerStarting, PlayerMax, PlayerLost),

        PlayerLost > EnemyLost,
        retract(winner(_, Type)),
        asserta(winner(enemy, Type)).

    checkWinner(8):-
        % check hp lost for opponent
        enemy(_, _, _, _, EnemyCurrent, EnemyMax, _),
        calculate(EnemyCurrent, EnemyMax, EnemyMax, EnemyLost),

        % check hp lost for player
        activePokemon(Tag),
        startingHP(PlayerStarting),
        owned(Tag, _, _, _, _, PlayerCurrent, PlayerMax, _, _),
        calculate(PlayerCurrent, PlayerStarting, PlayerMax, PlayerLost),

        PlayerLost < EnemyLost,
        retract(winner(_, Type)),
        asserta(winner(player, Type)).

    checkWinner(8):-
        % check hp lost for opponent
        enemy(_, _, _, _, EnemyCurrent, EnemyMax, _),
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

    %!  gainedExp(-Gained)
    %   gained experience based on enemy level
    gainedExp(Gained):-
        winner(player, _),
        enemy(_, _, EnemyLevel, _, _, _, _),
        owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves),

        Gained is EnemyLevel * 15,
        NewExp is Exp + Gained,

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, NewExp, Moves)).

    gainedExp(Gained):-
        winner(draw, _),
        enemy(_, _, EnemyLevel, _, _, _, _),
        owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves),

        Gained is EnemyLevel * 15 / 2,
        NewExp is Exp + Gained,

        retract(owned(Tag, _, _, _, _, _, _, _, _)),
        asserta(owned(Tag, Pokemon, State, Level, Atk, CurrentHP, MaxHP, NewExp, Moves)).

    gainedExp(0).

    %!  gainedMoney(-Gained)
    %   gained money for player after a battle against trainer
    gainedMoney(Gained):-
        winner(player, trainer),

        inRoute(Route, _),
        trainer(Route, _, Money, _, _),
        backpack(CurrentMoney, Badges, Pokeballs, Team),

        Gained is (Money * 0.5),
        NewMoney is CurrentMoney + Gained,

        retract(backpack(_, _, _, _)),
        asserta(backpack(NewMoney, Badges, Pokeballs, Team)).

    gainedMoney(Gained):-
        winner(enemy, trainer),
        backpack(Money, Badges, Pokeballs, Team),
        
        Gained is -(Money * 0.1),
        NewMoney is Money + Gained,
        retract(backpack(_, _, _, _)),
        asserta(backpack(NewMoney, Badges, Pokeballs, Team)).

    gainedMoney(300):-
        winner(player, gym),
        backpack(Money, Badges, Pokeballs, Team),

        NewMoney is Money + 300,
        retract(backpack(_, _, _, _)),
        asserta(backpack(NewMoney, Badges, Pokeballs, Team)).

    gainedMoney(0).

    %!  allowTravel
    %   asserts player's new location
    allowTravel:-
        inRoute(_, CityA),
        travel(CityA, plaza),
        retract(inRoute(_, _)),
        asserta(inRoute(none, none)).

    %!  exitBattle
    %   changes state from fighting to idle
    exitBattle:-
        retract(inBattle(_)),
        asserta(inBattle(no)),
        retract(idle(_)),
        asserta(idle(city)).

    %!  endBattle
    %   allows travel and/or exits battle based on battle winner 
    endBattle:-
        winner(enemy, trainer),
        exitBattle.

    endBattle:-
        winner(player, trainer),
        % mark trainer in route as defeated
        inRoute(R, _),
        retract(trainer(R, T, M, P, _)),
        asserta(trainer(R, T, M, P, yes)),
        allowTravel,
        endBattle.

    endBattle:-
        winner(_, pokemon),
        allowTravel,
        exitBattle.

    endBattle:-
        winner(player, gym),
        queue([Next | Rest], Level),
        saveExp,

        % reset winner but stay in battle
        retract(winner(_, _)),
        asserta(winner(none, gym)),

        retract(queue(_, _)),
        asserta(queue(Rest, Level)),
        
        setEnemy(Next, Level).

    endBattle:-
        winner(player, gym),
        queue([], _),
        saveExp,
        location(City, _),
        gymnasium(City, Leader, _, _),
        gymLeader(Leader, Level, Team, no),
        retract(gymLeader(_, _, _, _)),
        asserta(gymLeader(Leader, Level, Team, yes)),
        exitBattle.

    endBattle:-
        winner(enemy, gym),
        backpack(_, _, _, Team),
        isTeamNuked(Team),
        exitBattle.

    endBattle:-
        winner(_, gym),
        % reset winner but stay in battle
        retract(winner(_, _)),
        asserta(winner(none, gym)).

    % ==== GYMNASIUM BATTLES ====
    %!  challenge
    %   starts battle against leader of current city's gymnasium, will
    %   return false if it has been defeated already
    challenge:-
        % get leader
        location(City, _),
        gymnasium(City, Leader, _, _),
        gymLeader(Leader, Level, [First | Rest], no),

        % set type of fight in winner predicate
        retract(winner(_, _)),
        asserta(winner(none, gym)),

        retract(queue(_, _)),
        asserta(queue(Rest, Level)),

        setEnemy(First, Level),
        enterBattle.

    %!  saveExp
    %   helper to save experience gained in gymnasium
    saveExp:-
        gainedExp(Gained),
        gymExp(Record),
        add(Gained, Record, S),
        retract(gymExp(_)),
        retract(gymExp(S)).

    %!  gainBadge
    %   adds badge tp backpack
    gainBadge:-
        location(City, _),
        gymnasium(City, _, _, Badge),
        backpack(A, Badges, B, C),
        add(Badge, Badges, New),

        retract(backpack(_, _, _, _)),
        asserta(backpack(A, New, B, C)).

    %!  isTeamNuked(+Team)
    %   returns false if player has pokemon with hp left
    isTeamNuked([]).
    isTeamNuked([Tag-_ | R]) :-
        owned(Tag, _, fainted, _, _, _, _, _, _),
        isTeamNuked(R).

    % ==== GAME BEATEN ====
    %!  allBadges
    %   returns true if player has gained all badges
    allBadges:-
        backpack(_, Badges, _, _),
        findall(B, gymnasium(_, _, _, B), All),
        msort(Badges, Sorted),
        msort(All, Sorted).

    %!  caughtAll
    %   returns true if player has caught at least one pokemon for every type
    caughtAll:-
        findall(T, (owned(_, P, _, _, _, _, _, _, _), type(P, T)), Owned),
        findall(O, type(_, O), All),
        sort(Owned, Sorted),
        sort(All, Sorted).
`;
