// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      "ios/*",
      "android/*",
      ".expo/*",
      "coverage/*",
      "reports/*",
      "expo-env.d.ts",
    ],
  },
  {
    // Reanimated drives animation off the React render model: shared values are
    // mutable handles written from gesture callbacks on the UI thread, and
    // animated refs are read by measure() inside those callbacks. The React
    // Compiler rules model neither, so they flag every shared-value write and
    // every animated-ref read that crosses a component boundary. Scoped to the
    // files that own the board's drag gesture; on everywhere else.
    files: [
      "src/components/board/board-column.tsx",
      "src/components/board/board-drag-context.tsx",
      "src/components/board/board-view.tsx",
      "src/components/board/task-card.tsx",
    ],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      complexity: ["error", 10],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 120, skipBlankLines: true, skipComments: true },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*", "../../**", "../../../**"],
              message:
                "Use the @/ alias instead of climbing two or more directories.",
            },
          ],
        },
      ],
    },
  },
  {
    // Seed data and tests are allowed to be long; they are excluded from the
    // module-size and complexity budgets that apply to production logic.
    files: [
      "src/**/*.test.{ts,tsx}",
      "src/__tests__/**",
      "src/lib/board-fixtures.ts",
    ],
    rules: {
      complexity: "off",
      "max-depth": "off",
      "max-params": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
    },
  },
]);
