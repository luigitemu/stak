#!/usr/bin/env node
/**
 * Quality-gate ratchet.
 *
 *   collect  — parse tool reports into metrics/current.json
 *   check    — diff current against metrics/baseline.json; exit 1 on regression
 *   accept   — promote current.json to baseline.json
 *   report   — print a markdown table (used by CI for the job summary / PR comment)
 *
 * The RULES table is the whole policy.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CURRENT_PATH = path.join(ROOT, "metrics/current.json");
const BASELINE_PATH = path.join(ROOT, "metrics/baseline.json");
const REPORTS = path.join(ROOT, "reports");

const RULES = {
  "coverage.lines": { dir: "up", floor: 80, tol: 0 },
  "coverage.branches": { dir: "up", floor: 70, tol: 0 },
  "mutation.score": { dir: "up", floor: 55, tol: 0.5 },
  "complexity.max": { dir: "down", ceil: 10, tol: 0 },
  "modules.maxLines": { dir: "down", ceil: 300, tol: 0 },
  "deps.cycles": { dir: "down", ceil: 0, tol: 0 },
  "deps.layerViolations": { dir: "down", ceil: 0, tol: 0 },
  "bundle.iosBytes": { dir: "down", tol: "2%" },
};

const LAYER_RULES = new Set(["lib-no-ui", "components-no-app"]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

function get(obj, dotted) {
  return dotted.split(".").reduce((acc, key) => acc?.[key], obj);
}

function parseTol(tol, baseline) {
  if (tol == null) return 0;
  if (typeof tol === "string" && tol.endsWith("%")) {
    return (Number(tol.slice(0, -1)) / 100) * baseline;
  }
  return Number(tol);
}

function round(n, digits = 2) {
  if (typeof n !== "number" || Number.isNaN(n)) return n;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function exists(file) {
  return fs.existsSync(file);
}

function collectCoverage() {
  const file = path.join(ROOT, "coverage/coverage-summary.json");
  if (!exists(file)) {
    throw new Error(`Missing ${file}. Run jest with --coverageReporters=json-summary.`);
  }
  const total = readJson(file).total;
  return {
    statements: round(total.statements.pct),
    branches: round(total.branches.pct),
    functions: round(total.functions.pct),
    lines: round(total.lines.pct),
  };
}

function collectMutation() {
  const file = path.join(REPORTS, "mutation.json");
  if (!exists(file)) {
    throw new Error(`Missing ${file}. Run stryker run.`);
  }
  const report = readJson(file);
  const mutants = Object.values(report.files ?? {}).flatMap((f) => f.mutants ?? []);
  const killed = mutants.filter((m) => m.status === "Killed").length;
  const timeout = mutants.filter((m) => m.status === "Timeout").length;
  const survived = mutants.filter((m) => m.status === "Survived").length;
  const noCoverage = mutants.filter((m) => m.status === "NoCoverage").length;
  const scored = killed + timeout + survived + noCoverage;
  const score = scored === 0 ? 100 : ((killed + timeout) / scored) * 100;
  return {
    score: round(score),
    killed,
    survived,
    noCoverage,
    timeout,
    total: mutants.length,
  };
}

function collectEslintMetrics() {
  const file = path.join(REPORTS, "eslint-metrics.json");
  if (!exists(file)) {
    throw new Error(`Missing ${file}. Run the eslint metrics pass.`);
  }
  const results = readJson(file);
  let maxComplexity = 0;
  let maxLines = 0;
  const skip = /\.test\.(ts|tsx)$|\/__tests__\/|board-fixtures\.ts$/;

  for (const result of results) {
    if (skip.test(result.filePath)) continue;
    for (const msg of result.messages) {
      if (msg.ruleId === "complexity") {
        const match = /complexity of (\d+)/.exec(msg.message);
        if (match) maxComplexity = Math.max(maxComplexity, Number(match[1]));
      }
      if (msg.ruleId === "max-lines") {
        const match = /too many lines \((\d+)\)/.exec(msg.message);
        if (match) maxLines = Math.max(maxLines, Number(match[1]));
      }
    }
  }

  return {
    complexity: { max: maxComplexity },
    modules: { maxLines },
  };
}

function collectDeps() {
  const file = path.join(REPORTS, "deps.json");
  if (!exists(file)) {
    throw new Error(`Missing ${file}. Run depcruise.`);
  }
  const report = readJson(file);
  const violations = report.summary?.violations ?? [];
  return {
    cycles: violations.filter((v) => v.rule?.name === "no-circular").length,
    layerViolations: violations.filter((v) => LAYER_RULES.has(v.rule?.name)).length,
    unresolved: violations.filter((v) => v.rule?.name === "no-unresolved").length,
    orphans: violations.filter((v) => v.rule?.name === "no-orphans").length,
  };
}

function collectBundle() {
  const file = path.join(REPORTS, "bundle-size.json");
  if (exists(file)) {
    return readJson(file);
  }
  const iosDir = path.join(ROOT, "dist/_expo/static/js/ios");
  if (!exists(iosDir)) {
    throw new Error(
      "Missing bundle size. Run `bun run export:size` or write reports/bundle-size.json."
    );
  }
  let iosBytes = 0;
  for (const name of fs.readdirSync(iosDir)) {
    if (!/\.(js|hbc)$/.test(name) || name.endsWith(".map")) continue;
    iosBytes += fs.statSync(path.join(iosDir, name)).size;
  }
  return { iosBytes };
}

function collect() {
  const eslint = collectEslintMetrics();
  const metrics = {
    generatedAt: new Date().toISOString(),
    coverage: collectCoverage(),
    mutation: collectMutation(),
    complexity: eslint.complexity,
    modules: eslint.modules,
    deps: collectDeps(),
    bundle: collectBundle(),
  };
  writeJson(CURRENT_PATH, metrics);
  console.log(`Wrote ${path.relative(ROOT, CURRENT_PATH)}`);
  return metrics;
}

function formatDelta(current, baseline, dir) {
  if (typeof current !== "number" || typeof baseline !== "number") return "—";
  const delta = current - baseline;
  const sign = delta > 0 ? "+" : "";
  const better =
    (dir === "up" && delta >= 0) || (dir === "down" && delta <= 0);
  return `${sign}${round(delta)}${better ? "" : " ⚠"}`;
}

function evaluate(current, baseline) {
  const rows = [];
  let failed = false;

  for (const [key, rule] of Object.entries(RULES)) {
    const value = get(current, key);
    const previous = baseline ? get(baseline, key) : undefined;
    const reasons = [];

    if (value == null) {
      reasons.push("missing");
      failed = true;
    } else {
      if (rule.floor != null && value < rule.floor) {
        reasons.push(`below floor ${rule.floor}`);
        failed = true;
      }
      if (rule.ceil != null && value > rule.ceil) {
        reasons.push(`above ceiling ${rule.ceil}`);
        failed = true;
      }
      if (previous != null) {
        const tol = parseTol(rule.tol, previous);
        if (rule.dir === "up" && value < previous - tol) {
          reasons.push(`regressed from ${previous}`);
          failed = true;
        }
        if (rule.dir === "down" && value > previous + tol) {
          reasons.push(`regressed from ${previous}`);
          failed = true;
        }
      }
    }

    rows.push({
      key,
      value,
      previous,
      dir: rule.dir,
      ok: reasons.length === 0,
      reasons,
    });
  }

  return { rows, failed };
}

function markdownTable(rows) {
  const lines = [
    "| Metric | Baseline | Current | Delta | Status |",
    "| --- | ---: | ---: | ---: | --- |",
  ];
  for (const row of rows) {
    const status = row.ok ? "pass" : `fail (${row.reasons.join("; ")})`;
    lines.push(
      `| \`${row.key}\` | ${row.previous ?? "—"} | ${row.value ?? "—"} | ${formatDelta(row.value, row.previous, row.dir)} | ${status} |`
    );
  }
  return lines.join("\n");
}

function mermaidBlock() {
  const file = path.join(REPORTS, "deps.mmd");
  if (!exists(file)) return "";
  // Parentheses in node IDs (from Expo route groups like `(tabs)`) break GitHub's
  // mermaid renderer. Labels in quotes are rewritten too, which is fine.
  const body = fs.readFileSync(file, "utf8").trim().replace(/[()]/g, "_");
  if (!body) return "";
  return `\n\n## Dependency graph\n\n\`\`\`mermaid\n${body}\n\`\`\`\n`;
}

function reportMarkdown(current, baseline) {
  const { rows, failed } = evaluate(current, baseline);
  const header = failed
    ? "## Quality gate failed"
    : "## Quality gate passed";
  return `${header}\n\n${markdownTable(rows)}${mermaidBlock()}`;
}

function check() {
  if (!exists(CURRENT_PATH)) {
    throw new Error("metrics/current.json is missing. Run `bun run metrics:collect` first.");
  }
  const current = readJson(CURRENT_PATH);
  const baseline = exists(BASELINE_PATH) ? readJson(BASELINE_PATH) : null;
  const { rows, failed } = evaluate(current, baseline);
  const md = reportMarkdown(current, baseline);
  fs.mkdirSync(REPORTS, { recursive: true });
  fs.writeFileSync(path.join(REPORTS, "metrics.md"), md + "\n");
  console.log(md);
  if (failed) {
    const failing = rows.filter((r) => !r.ok).map((r) => r.key);
    console.error(`\nQuality gate failed: ${failing.join(", ")}`);
    process.exit(1);
  }
}

function accept() {
  if (!exists(CURRENT_PATH)) {
    throw new Error("metrics/current.json is missing. Run `bun run metrics:collect` first.");
  }
  const current = readJson(CURRENT_PATH);
  writeJson(BASELINE_PATH, current);
  console.log(`Promoted ${path.relative(ROOT, CURRENT_PATH)} → ${path.relative(ROOT, BASELINE_PATH)}`);
}

function report() {
  if (!exists(CURRENT_PATH)) {
    throw new Error("metrics/current.json is missing. Run `bun run metrics:collect` first.");
  }
  const current = readJson(CURRENT_PATH);
  const baseline = exists(BASELINE_PATH) ? readJson(BASELINE_PATH) : null;
  process.stdout.write(reportMarkdown(current, baseline) + "\n");
}

const cmd = process.argv[2];
const commands = { collect, check, accept, report };

if (!commands[cmd]) {
  console.error("Usage: node scripts/metrics.mjs <collect|check|accept|report>");
  process.exit(2);
}

try {
  commands[cmd]();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
