import { prologEngine } from "../src/prolog/PrologEngine";

const query = (goal: string) => prologEngine.queryAll(goal);
const queryOne = (goal: string) => prologEngine.queryOne(goal);
const prove = (goal: string) => prologEngine.prove(goal);
const assert = (fact: string) => prologEngine.assert(fact);
const retract = (fact: string) => prologEngine.retract(fact);

export class PrologService {
  async getWildPokemonNames(limit = 4): Promise<string[]> {
    const results = await query("wild_pokemon(Name, _, _, _, _, _, _)");
    return results
      .slice(0, limit)
      .map((r: any) => (r.Name as string).toUpperCase());
  }

  async getStarters(): Promise<string[]> {
    const results = await query("starters(List), member(Name, List)");
    return results.map((r: any) => (r.Name as string).toUpperCase());
  }
}

export const prologService = new PrologService();
