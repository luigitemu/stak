/**
 * Measurement-only ESLint config. Every complexity/size rule is set to a max of
 * 0 so the reported "actual" number in each message can be parsed into a
 * distribution. Does not replace eslint.config.js — that file still enforces
 * the real budgets as errors.
 */
const base = require("./eslint.config.js");

module.exports = [
  ...base,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "**/*.test.{ts,tsx}",
      "src/__tests__/**",
      "src/lib/board-fixtures.ts",
    ],
    rules: {
      complexity: ["error", 0],
      "max-depth": ["error", 0],
      "max-params": ["error", 0],
      "max-nested-callbacks": ["error", 0],
      "max-lines": [
        "error",
        { max: 0, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 0, skipBlankLines: true, skipComments: true },
      ],
    },
  },
];
