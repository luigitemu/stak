const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const existingBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existingBlockList)
    ? existingBlockList
    : existingBlockList
      ? [existingBlockList]
      : []),
  // Expo Router's require.context matches every .tsx under src/app. Keep Jest
  // files out of the native bundle — they import Node stdlib via RNTL.
  /\.(test|spec)\.[jt]sx?$/,
];

module.exports = withNativeWind(config, { input: "./src/global.css" });
