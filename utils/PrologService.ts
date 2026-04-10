import { prologEngine } from "../src/prolog/PrologEngine";
import { isEgg } from "./helpers";
import { Backpack, Egg, Location, Pokeball, Pokemon } from "./interfaces";

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
    const result = await query("backpack(Money, Pokeballs, Team)");
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

    return pokemons;
  }

  async getBackpackContent(): Promise<Backpack> {
    const result = await query("backpack(Money, Pokeballs, Team)");
    const backpack: Backpack = {
      money: result[0].Money,
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
    const cleanName = city.toLowerCase().trim();
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
}

export const prologService = new PrologService();
