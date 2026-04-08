import { prologEngine } from "../src/prolog/PrologEngine";
import { Location } from "./interfaces";

const query = (goal: string) => prologEngine.queryAll(goal);
const queryOne = (goal: string) => prologEngine.queryOne(goal);
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

  async getOwnedPokemons() {
    const result = await query("backpack(Money, Pokeballs, Team)");
    console.log(result);
  }

  async getBackpackContent() {
    const result = await query("backpack(Money, Pokeballs, Team)");
    console.log(result);
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
