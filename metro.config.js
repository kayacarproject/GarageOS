const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// The actual Expo app lives in mobile/. Its ios/ and android/ native
// projects were generated from mobile/, so metro must use mobile/ as
// the project root so bundle paths match what the native projects expect.
const monoRoot = __dirname;
const projectRoot = path.resolve(monoRoot, 'mobile');

const config = getDefaultConfig(projectRoot);

// Also watch the monorepo root so metro can see hoisted node_modules.
config.watchFolders = [monoRoot];

// expo/react-native are hoisted to monoRoot by npm workspaces.
// mobile/node_modules holds packages that weren't hoisted.
config.resolver.nodeModulesPaths = [
  path.resolve(monoRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

module.exports = config;
