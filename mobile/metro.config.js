const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ─── Block packages that cause the _native.useLocale crash ───────────────────
// @react-navigation/drawer v7 imports react-native-reanimated internally.
// Our custom drawer uses only React Native's built-in Animated API, so we
// stub both packages out with empty modules to prevent the crash.

const emptyModule = path.resolve(__dirname, 'src/stubs/empty.js');

config.resolver = config.resolver ?? {};
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-reanimated':    emptyModule,
  '@react-navigation/drawer':   emptyModule,
};

module.exports = config;
