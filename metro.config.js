const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Permite importar archivos .pl como assets de texto
config.resolver.assetExts.push('pl');

module.exports = config;