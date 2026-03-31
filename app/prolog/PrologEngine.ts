import pl from 'tau-prolog';

// Extiende Tau Prolog con modulos necesarios
import 'tau-prolog/modules/lists';
import 'tau-prolog/modules/js';   // Interop JS↔Prolog

type Substitution = Record<string, any>;

class PrologEngine {
  private session: any;
  private initialized = false;

  constructor() {
    // 1000 = limite de pasos de inferencia (ajusta segun necesidad)
    this.session = pl.create(1000);
  }

  /**
   * Carga un programa Prolog desde un string
   */
  async loadProgram(prologCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.session.consult(prologCode, {
        success: () => {
          this.initialized = true;
          resolve();
        },
        error: (err: any) => {
          reject(new Error(`Error al cargar programa Prolog: ${pl.format_answer(err)}`));
        }
      });
    });
  }

  /**
   * Ejecuta una query y devuelve TODAS las soluciones
   */
  async queryAll(goal: string): Promise<Substitution[]> {
    if (!this.initialized) throw new Error('Motor Prolog no inicializado');

    return new Promise((resolve, reject) => {
      const solutions: Substitution[] = [];

      this.session.query(goal, {
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
                getNext(); // Busca siguiente solución
              },
              fail: () => resolve(solutions),   // No más soluciones
              error: (err: any) => reject(new Error(pl.format_answer(err))),
              limit: () => resolve(solutions),   // Límite de pasos alcanzado
            });
          };
          getNext();
        },
        error: (err: any) => reject(new Error(`Query inválida: ${goal} — ${pl.format_answer(err)}`)),
      });
    });
  }

  /**
   * Ejecuta una query y devuelve solo la PRIMERA solución
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
      case './2': {
        // Lista Prolog → Array JS
        const arr: any[] = [];
        let current = term;
        while (current.indicator === './2') {
          arr.push(this.termToJS(current.args[0]));
          current = current.args[1];
        }
        return arr;
      }
      case '[]/0':
        return [];
      default:
        // Atomo, numero, etc.
        if (term.args && term.args.length > 0) {
          return {
            functor: term.id,
            args: term.args.map((a: any) => this.termToJS(a))
          };
        }
        return term.id !== undefined ? term.id : term.value;
    }
  }
}

// Singleton — una sola instancia para toda la app
export const prologEngine = new PrologEngine();