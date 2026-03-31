/* eslint-disable @typescript-eslint/no-require-imports */
import "./patchProcess";

type Substitution = Record<string, any>;

class PrologEngine {
  private session: any;
  private initialized = false;
  private pl: any;

  constructor() {
    // Cargar tau-prolog y sus modulos
    this.pl = require("tau-prolog/modules/core.js");
    require("tau-prolog/modules/lists.js")(this.pl);

    this.session = this.pl.create();
  }

  async loadPrograms(prologFiles: string[]): Promise<void> {
    for (const code of prologFiles) {
      await this.loadProgram(code);
    }
  }

  /**
   * Carga un programa Prolog desde un string
   */
  async loadProgram(prologCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Asegurar que el programa termina con salto de línea
      const code = prologCode.trimEnd() + "\n";
      this.session.consult(code, {
        success: () => {
          this.initialized = true;
          resolve();
        },
        error: (err: any) => {
          reject(
            new Error(
              `Error al cargar programa Prolog: ${this.pl.format_answer(err)}`,
            ),
          );
        },
      });
    });
  }

  /**
   * Ejecuta una query y devuelve TODAS las soluciones
   */
  async queryAll(goal: string): Promise<Substitution[]> {
    if (!this.initialized) throw new Error("Motor Prolog no inicializado");

    const goalWithDot = goal.trimEnd().endsWith(".") ? goal : `${goal}.`;

    return new Promise((resolve, reject) => {
      const solutions: Substitution[] = [];

      this.session.query(goalWithDot, {
        success: () => {
          const getNext = () => {
            this.session.answer({
              success: (answer: any) => {
                // Extrae las variables del answer
                const sub: Substitution = {};
                if (answer && answer.links) {
                  for (const [varName, term] of Object.entries(answer.links)) {
                    sub[varName] = this.termToJS(term);
                  }
                }
                solutions.push(sub);
                getNext(); // Busca siguiente solucion
              },
              fail: () => resolve(solutions), // No mas soluciones
              error: (err: any) =>
                reject(new Error(this.pl.format_answer(err))),
              limit: () => resolve(solutions), // Limite de pasos alcanzado
            });
          };
          getNext();
        },
        error: (err: any) =>
          reject(
            new Error(
              `Query inválida: ${goalWithDot} — ${this.pl.format_answer(err)}`,
            ),
          ),
      });
    });
  }

  /**
   * Ejecuta una query y devuelve solo la PRIMERA solucion
   */
  async queryOne(goal: string): Promise<Substitution | null> {
    const all = await this.queryAll(goal);
    return all.length > 0 ? all[0] : null;
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
