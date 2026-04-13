import { prologEngine } from "../src/prolog/PrologEngine";
import { isEgg } from "./helpers";
import {
  Backpack,
  Egg,
  FoePokemon,
  Location,
  Pokeball,
  Pokemon,
} from "./interfaces";

const query = (goal: string) => prologEngine.queryAll(goal, false);
const queryAll = (goal: string) => prologEngine.queryAll(goal, true);
const prove = (goal: string) => prologEngine.prove(goal);
const assert = (fact: string) => prologEngine.assert(fact);
const retract = (fact: string) => prologEngine.retract(fact);

export class PrologService {
  async getStarters(): Promise<string[]> {
    const result = await query("starters(List)");
    const list = result[0]?.List;
    if (!Array.isArray(list)) return [];
    return list.map((n: any) => String(n).toUpperCase());
  }

  async chooseStarter(starter: string): Promise<boolean> {
    const cleanName = starter.toLowerCase().trim();
    const results = await prove(`chooseStarter(${cleanName})`);
    return results;
  }

  async getCurrentLocation(): Promise<Location> {
    const result = await query("location(Main, Place)");
    const location: Location = {
      main: result[0].Main,
      place: result[0].Place,
    };
    return location;
  }

  async getTeamPokemons(): Promise<(Pokemon | Egg)[]> {
    const result = await query("backpack(Money, Medals, Pokeballs, Team)");
    const pokemons: (Pokemon | Egg)[] = [];
    for (const pair of result[0].Team) {
      const tag = pair.args[0];
      const name = pair.args[1];

      if (name === "egg") {
        const result = await query(`playerEggs(${tag}, Pokemon, DistanceLeft)`);

        const webo: Egg = {
          tag: tag,
          pokemon: result[0].Pokemon.toUpperCase(),
          distanceLeft: result[0].DistanceLeft,
        };

        pokemons.push(webo);
      } else {
        const result = await query(
          `owned(${tag}, Pokemon, State, Level, Atk, CurrentHP, MaxHP, Exp, Moves)`,
        );

        const pokemon: Pokemon = {
          tag: tag,
          pokemon: result[0].Pokemon.toUpperCase(),
          state: result[0].State.toUpperCase(),
          level: result[0].Level,
          atk: result[0].Atk,
          currentHp: result[0].CurrentHP,
          maxHp: result[0].MaxHP,
          exp: result[0].Exp,
          moves: [],
        };

        for (const pairMoves of result[0].Moves) {
          if (pairMoves.args[1] === "learned") {
            pokemon.moves.push(pairMoves.args[0]);
          }
        }

        pokemons.push(pokemon);
      }
    }

    console.log(pokemons);

    return pokemons;
  }

  async getBackpackContent(): Promise<Backpack> {
    const result = await query("backpack(Money, Medals, Pokeballs, Team)");
    console.log(result);
    const backpack: Backpack = {
      money: result[0].Money,
      medals: result[0].Medals,
      pokeballs: result[0].Pokeballs,
    };
    return backpack;
  }

  async getCitiesToMove(): Promise<string[]> {
    const results = await query("connectedCities(Cities)");
    const locations = results[0].Cities;
    return locations;
  }

  async moveToCity(city: string): Promise<boolean> {
    const cleanName = city?.toLowerCase().trim();
    const results = await prove(`selectCity(${cleanName})`);
    return results;
  }

  async getInRouteLocation(): Promise<Location> {
    const result = await query("inRoute(Route, City)");
    const location: Location = {
      main: String(result[0].Route),
      place: "",
    };
    return location;
  }

  async getLocationsInCity(): Promise<string[]> {
    const city = (await this.getCurrentLocation()).main;

    const results = await query(`city(${city}, Locations)`);
    const locations = results[0].Locations;

    return locations;
  }

  async moveToLocationInCity(location: string): Promise<boolean> {
    const city = (await this.getCurrentLocation()).main;

    const cleanName = location.toLowerCase().trim();
    const results = await prove(`travel(${city}, ${cleanName})`);

    return results;
  }

  async getPokeballs(): Promise<Pokeball[]> {
    const results = await queryAll("pokeball(Name, Cost)");
    const pokeballs: Pokeball[] = [];

    for (const result of results) {
      const pokeball: Pokeball = {
        name: result.Name,
        cost: result.Cost,
      };

      pokeballs.push(pokeball);
    }

    return pokeballs;
  }

  async buyPokeball(type: string, cant: number): Promise<[boolean, number]> {
    while (cant > 0) {
      const result = await prove(`buyPokeball(${type})`);
      if (!result) {
        return [false, cant];
      }
      cant--;
    }

    return [true, 0];
  }

  async healTeam(pokemons: (Pokemon | Egg)[]): Promise<boolean> {
    for (const pokemon of pokemons) {
      if (isEgg(pokemon)) continue;

      const tag = pokemon.tag;

      const cured = await prove(`healPokemon(${tag})`);
      if (!cured) return false;
    }
    return true;
  }

  async generateEvent(): Promise<string> {
    const results = await query("event(Type)");
    const event = results[0].Type;

    return event;
  }

  async getEventDetails(type: string): Promise<string> {
    const results = await query(`handleEvent(${type}, Details)`);
    const details = results[0].Details;

    return details;
  }

  async pickupPokeball(type: string): Promise<boolean> {
    const results = await prove(`pickUpItem(pokeball, ${type}, backpack)`);
    return results;
  }

  async pickupEgg(type: string): Promise<[boolean, string]> {
    const results = await prove(`pickUpItem(egg, gastly, backpack)`);
    if (results) {
      return [results, "mochila"];
    }

    const results2 = await prove(`pickUpItem(egg, ${type}, computer)`);
    return [results2, "PC"];
  }

  async startBattle(type: string): Promise<boolean> {
    const results = await query(`handleEvent(${type}, _), inBattle(Battle)`);
    return results[0].Battle === "yes";
  }

  async challengeLeader(): Promise<boolean> {
    const results = prove(`challenge`);
    return results;
  }

  async finishRouteTravel(): Promise<boolean> {
    const results = await prove("allowTravel");
    return results;
  }

  async growEggs(route: number): Promise<boolean> {
    const results = await prove(
      `backpack(_, _, _, Team), growEgg(${route}, Team)`,
    );
    return results;
  }

  async checkEggs(): Promise<number[]> {
    const results = await query(
      "backpack(_, _, _, Team), checkEgg(Team, EggsReady)",
    );
    const eggsReady = results[0].EggsReady;
    return eggsReady;
  }

  async hatchEgg(tag: number): Promise<boolean> {
    const results = await prove(`hatchEgg(${tag})`);
    return results;
  }

  async getEnemyPokemon(): Promise<FoePokemon> {
    const result = await query(
      "enemy(Pokemon, State, Level, Atk, CurrentHP, MaxHP, Moves)",
    );

    const foePokemon: FoePokemon = {
      pokemon: result[0].Pokemon.toUpperCase(),
      state: result[0].State.toUpperCase(),
      level: result[0].Level,
      atk: result[0].Atk,
      currentHp: result[0].CurrentHP,
      maxHp: result[0].MaxHP,
      moves: result[0].Moves,
    };

    return foePokemon;
  }

  async getGymLeader(): Promise<string> {
    const result = await query(
      "location(Main, Place), gymnasium(Main, Leader, Fights, Badge)",
    );
    return result[0].Leader.toUpperCase();
  }

  async getInRouteTrainer(): Promise<string> {
    const route = await this.getInRouteLocation();

    const result = await query(
      `trainer(${route.main}, Trainer, Money, Pokemon, Defeated)`,
    );
    return result[0].Trainer.toUpperCase();
  }

  async choosePokemon(tag: number): Promise<boolean> {
    const result = prove(`choosePokemon(${tag})`);
    return result;
  }

  async getActivePokemon(): Promise<Pokemon> {
    const result = await query("activePokemon(Tag)");
    const tag = result[0].Tag;

    const pokemons = await this.getTeamPokemons();

    const activePokemon = pokemons.find((p) => p.tag === tag) as Pokemon;

    return activePokemon;
  }

  async hitEnemyWithMove(move: string): Promise<boolean> {
    const select = await prove(`selectMove('${move}')`);

    let result = false;

    if (select) {
      result = await prove("hitEnemy");
      console.log(result);
    }

    return result;
  }

  async hitPlayerWithMove(): Promise<string> {
    const result = await query("enemyMove(Move), hitPlayer");
    const moveUsed = result[0].Move;
    return moveUsed;
  }

  async checkIfWinner(round: number): Promise<boolean> {
    const result = await prove(`checkWinner(${round})`);
    return result;
  }

  async getWinner(): Promise<string> {
    const result = await query("winner(Result, Type)");
    return result[0].Result;
  }

  async getGainedExp(): Promise<number> {
    const result = await query("gainedExp(Exp)");
    return result[0].Exp;
  }

  async getGymGainedExp(): Promise<{ tag: number; exp: number }[]> {
    const result = await query("gymExp(Pairs)");
    const pairs = result[0].Pairs;

    return pairs.map((pair: any) => ({
      tag: pair.args[0],
      exp: pair.args[1],
    }));
  }

  async getGainedMoney(): Promise<number> {
    const result = await query("gainedMoney(Money)");
    return result[0].Money;
  }

  async getGainedBadge(leader: string): Promise<string> {
    const result = await query(`gymnasium(City, ${leader}, Fights, Badge)`);
    return result[0].Badge;
  }

  async checkIfTeamNuked(): Promise<boolean> {
    const result = await prove("backpack(_, _, _, Team), isTeamNuked(Team)");
    return result;
  }

  async endBattle(): Promise<boolean> {
    const result = await prove("endBattle");
    return result;
  }
}

export const prologService = new PrologService();
