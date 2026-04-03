const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Proxy que intercepta CUALQUIER módulo de Node.js que tau-prolog
// intente importar (fs, path, os, readline, etc.) y los redirige
// a un stub vacío — evita errores de bundle en Android/iOS
const NODE_STUB = path.resolve(__dirname, "src/stubs/node-stub.js");
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (_target, moduleName) => NODE_STUB,
  },
);

module.exports = config;
