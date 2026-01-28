const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Web에서도 react-native exports 조건을 사용하도록 설정
// (zustand 등 ESM에서 import.meta 사용 시 에러 방지)
config.resolver.unstable_conditionsByPlatform = {
  ...config.resolver.unstable_conditionsByPlatform,
  web: ["browser", "react-native"],
};

module.exports = withNativeWind(config, { input: "./global.css" });
