declare module 'tau-prolog' {
  interface Session {
    consult(program: string, options: {
      success: () => void;
      error: (err: any) => void;
    }): void;

    query(goal: string, options: {
      success: () => void;
      error: (err: any) => void;
    }): void;

    answer(options: {
      success: (answer: any) => void;
      fail: () => void;
      error: (err: any) => void;
      limit: () => void;
    }): void;
  }

  function create(limit?: number): Session;
  function format_answer(answer: any): string;
}

declare module 'tau-prolog/modules/lists' {}
declare module 'tau-prolog/modules/js' {}
declare module 'tau-prolog/modules/dom' {}