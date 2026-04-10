import { prologEngine } from "../src/prolog/PrologEngine";
import { Backpack, Egg, Location, Pokemon } from "./interfaces";

const query = (goal: string) => prologEngine.queryAll(goal, false);
const queryAll = (goal: string) => prologEngine.queryAll(goal);
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

  async getOwnedPokemons(): Promise<(Pokemon | Egg)[]> {
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

  async getMoveLocations(): Promise<string[]> {
    const results = await query("connectedCities(Cities)");
    const locations = results[0].Cities;
    return locations;
  }

  async moveToLocation(location: string): Promise<boolean> {
    const cleanName = location.toLowerCase().trim();
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
}

export const prologService = new PrologService();
