// Global Jest setup — runs once per test file after the test framework is
// installed (setupFilesAfterEnv).

// react-native-gesture-handler ships its own Jest mocks for native handlers.
require("react-native-gesture-handler/jestSetup");

// react-native-reanimated ships an official mock covering useSharedValue,
// useAnimatedStyle, useAnimatedRef, measure, runOnJS, etc. — everything
// board-view.tsx needs to smoke-render without the native worklet runtime.
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

// expo-font: report fonts as already loaded so screens gated on
// `useFonts()` render immediately instead of returning null.
jest.mock("expo-font", () => ({
  ...jest.requireActual("expo-font"),
  useFonts: jest.fn(() => [true]),
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

// @expo-google-fonts/inter re-exports font asset IDs and the useFonts hook
// from expo-font — no native behavior to preserve in tests.
jest.mock("@expo-google-fonts/inter", () => ({
  useFonts: jest.fn(() => [true]),
  Inter_400Regular: "Inter_400Regular",
  Inter_500Medium: "Inter_500Medium",
  Inter_600SemiBold: "Inter_600SemiBold",
  Inter_700Bold: "Inter_700Bold",
  Inter_800ExtraBold: "Inter_800ExtraBold",
}));

// expo-splash-screen controls the native splash view — no-op in tests.
jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));
