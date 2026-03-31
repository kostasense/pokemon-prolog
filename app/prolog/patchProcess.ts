// tau-prolog necesita ciertos globals que no existen en React Native

// 1. process.browser = true evita que tau-prolog use fs y process.argv
if (typeof process !== "undefined") {
  (process as any).browser = true;
  if (!process.argv) {
    (process as any).argv = [];
  }
}

// 2. window es requerido por tau_user_input al momento de cargar core.js
//    En React Native no existe, lo creamos como objeto vacío
if (typeof window === "undefined") {
  (global as any).window = {
    prompt: () => "", // tau_user_input lo llama si se pide input por consola
    pl: undefined, // tau-prolog escribe aquí su instancia en modo browser
  };
}

// 3. document es requerido por el detector de <script type="text/prolog">
if (typeof document === "undefined") {
  (global as any).document = {
    getElementById: () => null,
  };
}
