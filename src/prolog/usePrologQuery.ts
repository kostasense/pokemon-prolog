import { useCallback, useEffect, useState } from "react";
import { prologEngine } from "../../src/prolog/PrologEngine";

export function usePrologQuery<T = any>(goal: string | null, deps: any[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runQuery = useCallback(async (queryGoal: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await prologEngine.queryAll(queryGoal);
      setData(results as T[]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (goal) runQuery(goal);
  }, [goal, runQuery]);

  return { data, loading, error, refetch: () => goal && runQuery(goal) };
}

/**
 * Hook para queries imperativas (no reactivas)
 * Util para acciones del jugador
 */
export function useProlog() {
  const query = useCallback((goal: string) => prologEngine.queryAll(goal), []);
  const queryOne = useCallback(
    (goal: string) => prologEngine.queryOne(goal),
    [],
  );
  const prove = useCallback((goal: string) => prologEngine.prove(goal), []);
  const assert = useCallback((fact: string) => prologEngine.assert(fact), []);
  const retract = useCallback((fact: string) => prologEngine.retract(fact), []);

  return { query, queryOne, prove, assert, retract };
}
