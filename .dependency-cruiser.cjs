/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment: "Circular dependencies make the module graph unmeasurable.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      comment: "Orphan modules are unused leftovers agents tend to leave behind.",
      severity: "error",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)src/__tests__/",
          "\\.test\\.(ts|tsx)$",
          "(^|/)src/global\\.css$",
          "(^|/)src/app/",
        ],
      },
      to: {},
    },
    {
      name: "no-unresolved",
      comment: "Every import must resolve.",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "lib-no-ui",
      comment: "src/lib is the domain layer: it must not import app or components.",
      severity: "error",
      from: { path: "(^|/)src/lib/" },
      to: { path: "(^|/)src/(app|components)/" },
    },
    {
      name: "components-no-app",
      comment: "src/components must not import screens from src/app.",
      severity: "error",
      from: { path: "(^|/)src/components/" },
      to: { path: "(^|/)src/app/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)src/__tests__/|\\.test\\.(ts|tsx)$" },
    includeOnly: "^src",
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
      mainFields: ["main", "types", "typings"],
    },
    reporterOptions: {
      mermaid: {
        minify: false,
      },
    },
  },
};
