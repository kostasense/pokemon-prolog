import type { Answer } from "trealla";
import { Prolog } from "trealla";

type Substitution = Record<string, any>;

class PrologEngine {
  private pl: Prolog | null = null;
  private initialized = false;
  private programParts: string[] = [];

  async init(): Promise<void> {
    this.pl = new Prolog();
    await this.pl.init();
  }

  async loadProgram(prologCode: string): Promise<void> {
    if (!this.pl)
      throw new Error("Motor no inicializado — llama init() primero");
    this.programParts.push(prologCode);
    // consultText carga el string directamente como programa Prolog
    await this.pl.consultText(prologCode);
    this.initialized = true;
  }

  async loadPrograms(prologFiles: string[]): Promise<void> {
    for (const code of prologFiles) {
      await this.loadProgram(code);
    }
  }

  /**
   * Ejecuta una query y devuelve TODAS las soluciones
   */
  async queryAll(goal: string): Promise<Substitution[]> {
    if (!this.pl || !this.initialized)
      throw new Error("Motor Prolog no inicializado");

    const solutions: Substitution[] = [];

    // Trealla usa un iterador async — itera hasta agotar todas las soluciones
    for await (const answer of this.pl.query(goal)) {
      if (answer.status === "success") {
        // answer.value ya es un objeto { Variable: valor } — no necesita conversión
        solutions.push(answer.answer as Substitution); // Busca siguiente solucion
      }
    }

    return solutions;
  }

  /**
   * Ejecuta una query y devuelve solo la PRIMERA solucion
   */
  async queryOne(goal: string): Promise<Substitution | null> {
    if (!this.pl || !this.initialized)
      throw new Error("Motor Prolog no inicializado");

    // queryOnce es más eficiente que queryAll cuando solo necesitas una solución
    const answer: Answer = await this.pl.queryOnce(goal);
    if (answer.status === "success") return answer.answer as Substitution;
    return null; // No mas soluciones / fallo
  }

  /**
   * Verifica si un goal es verdadero (true/false)
   */
  async prove(goal: string): Promise<boolean> {
    const result = await this.queryOne(goal);
    return result !== null;
  }

  /**
   * Aserta un hecho dinamicamente en tiempo de ejecucion
   * Util para: posicion del jugador, estado del juego, etc.
   */
  async assert(fact: string): Promise<void> {
    await this.queryOne(`assert(${fact})`);
  }

  /**
   * Retracta (elimina) un hecho dinamico
   */
  async retract(fact: string): Promise<void> {
    await this.queryOne(`retract(${fact})`);
  }

  /**
   * Convierte un termino Prolog a valor JavaScript
   * Trealla ya devuelve valores JS nativos en answer.answer,
   * pero este metodo se mantiene por compatibilidad por si se
   * necesita procesar terminos manualmente en el futuro
   */
  private termToJS(term: any): any {
    if (!term) return null;

    switch (term.indicator) {
      case "./2": {
        // Lista Prolog → Array JS
        const arr: any[] = [];
        let current = term;
        while (current.indicator === "./2") {
          arr.push(this.termToJS(current.args[0]));
          current = current.args[1];
        }
        return arr;
      }
      case "[]/0":
        return [];
      default:
        // Atomo, numero, etc.
        if (term.args && term.args.length > 0) {
          return {
            functor: term.id,
            args: term.args.map((a: any) => this.termToJS(a)),
          };
        }
        return term.id !== undefined ? term.id : term.value;
    }
  }
}

// Singleton — una sola instancia para toda la app
export const prologEngine = new PrologEngine();
