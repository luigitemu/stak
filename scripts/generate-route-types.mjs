/**
 * Generates the expo-router typed-route declarations without starting a dev server.
 *
 * `expo customize tsconfig.json` is the documented way to do this, but it writes
 * through a 1000ms debounce and the CLI process usually exits first, so it only
 * lands the file intermittently. This calls the generator directly and writes
 * synchronously, which makes `tsc --noEmit` reproducible in CI.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();
const routerRoot = path.join(projectRoot, "src/app");

// expo-router reads the app root from the environment; it is normally inlined by
// Metro, but this script runs in plain Node.
process.env.EXPO_ROUTER_APP_ROOT = routerRoot;

const { requireContext } = require("expo-router/internal/testing");
const { EXPO_ROUTER_CTX_IGNORE } = require("expo-router/_ctx-shared");
const {
  getTypedRoutesDeclarationFile,
} = require("@expo/router-server/build/typed-routes/generate");

const ctx = requireContext(routerRoot, true, EXPO_ROUTER_CTX_IGNORE);
const routeFiles = ctx.keys();

if (routeFiles.length === 0) {
  console.error(`No route files found under ${routerRoot}`);
  process.exit(1);
}

const declaration = getTypedRoutesDeclarationFile(ctx, {});

// getTypedRoutesDeclarationFile swallows errors from route parsing and returns a
// declaration with an empty route union, which degrades every href to
// ExternalPathString and produces confusing downstream type errors. Anything
// that short is a generation failure, not a project with no routes.
if (!declaration || declaration.length < 1000) {
  console.error(
    "Route type generation produced an empty route union.\n" +
      "Every file under src/app is treated as a route, so a stray non-route " +
      "file there (a co-located *.test.tsx, for example) can break the route tree.\n" +
      `Files seen: ${routeFiles.join(", ")}`
  );
  process.exit(1);
}

const typesDir = path.join(projectRoot, ".expo/types");
fs.mkdirSync(typesDir, { recursive: true });
fs.writeFileSync(path.join(typesDir, "router.d.ts"), declaration);

// tsconfig.json includes expo-env.d.ts, which is gitignored and therefore absent
// on a fresh CI checkout.
fs.writeFileSync(
  path.join(projectRoot, "expo-env.d.ts"),
  '/// <reference types="expo/types" />\n\n' +
    "// NOTE: This file should not be edited and should be in your git ignore\n"
);

console.log(`Generated route types for ${routeFiles.length} files in src/app`);
