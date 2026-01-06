/**
 * Metro configuration for React Native
 * https://facebook.github.io/metro/docs/configuration
 */

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, {
  transformer: {
    // 🔹 REQUIRED for correct debugging (original source, not bundle)
    enableBabelRCLookup: true,
    enableBabelRuntime: true,

    // 🔹 Keep source maps intact
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false, // ❗ MUST be false for debugger
      },
    }),
  },

  resolver: {
    // 🔹 Allow TS + JS imports together
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'cjs'],

    // 🔹 Required for RN Web / some native libs
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
  },

  server: {
    // 🔹 Stable dev server
    enhanceMiddleware: middleware => middleware,
  },

  // 🔹 Fix watch issues on Windows
  watchFolders: [__dirname],
});
