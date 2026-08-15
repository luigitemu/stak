#!/usr/bin/env node
/**
 * Sums the iOS JS bundle produced by `expo export --platform ios` into
 * reports/bundle-size.json so the quality gate can ratchet on bytes.
 */
import fs from "node:fs";
import path from "node:path";

const iosDir = path.join(process.cwd(), "dist/_expo/static/js/ios");
if (!fs.existsSync(iosDir)) {
  console.error(`No iOS bundle at ${iosDir}. Run expo export --platform ios first.`);
  process.exit(1);
}

let iosBytes = 0;
const files = [];
for (const name of fs.readdirSync(iosDir)) {
  if (!/\.(js|hbc)$/.test(name) || name.endsWith(".map")) continue;
  const file = path.join(iosDir, name);
  const size = fs.statSync(file).size;
  iosBytes += size;
  files.push({ name, size });
}

fs.mkdirSync(path.join(process.cwd(), "reports"), { recursive: true });
fs.writeFileSync(
  path.join(process.cwd(), "reports/bundle-size.json"),
  JSON.stringify({ iosBytes, files }, null, 2) + "\n"
);
console.log(`iOS JS bundle: ${iosBytes} bytes (${files.length} file(s))`);
