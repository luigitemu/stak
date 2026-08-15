# Stak

Kanban boards for iOS, built with Expo.

## Quality gate

This repo does not rely on human code review. A GitHub Actions workflow
(`.github/workflows/quality.yml`) measures the codebase and fails the PR if any
metric regresses against `metrics/baseline.json`.

| Metric                              | What it catches                                     | Floor                                     |
| ----------------------------------- | --------------------------------------------------- | ----------------------------------------- |
| Line / branch coverage              | Untested production code                            | 80% / 70%, plus tighter per-folder floors |
| Mutation score (Stryker, `src/lib`) | Tests that execute code but don't assert behavior   | 55%                                       |
| Cyclomatic complexity               | Functions that have grown too many branches         | max 10                                    |
| Module size                         | Files and functions that should have been split     | 300 / 120 lines                           |
| Dependency structure                | Cycles, layer violations (`app → components → lib`) | 0                                         |
| iOS JS bundle bytes                 | Surprise dependency or bundle bloat                 | 2% ratchet                                |

Run the same checks locally before handing work back:

```bash
bun run quality
```

Individual collectors:

```bash
bun run typecheck
bun run lint
bun run test:coverage
bun run deps          # dependency-cruiser
bun run mutate        # Stryker (src/lib only)
bun run export:size   # expo export --platform ios
bun run metrics:collect && bun run metrics:check
```

After a legitimate improvement, promote the new numbers:

```bash
bun run metrics:accept
```

`metrics/baseline.json` is committed; `git log -p metrics/baseline.json` is the
trend chart.

### Required status check

Make the `gate` job required in GitHub branch protection (`Settings → Branches
→ main → Require status checks → gate`). Until that is set, the workflow is
advisory.

## Get started

1. Install dependencies

   ```bash
   bun install
   ```

2. Start the app

   ```bash
   bun start
   ```

In the output, you'll find options to open the app in a
[development build](https://docs.expo.dev/develop/development-builds/introduction/),
[Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/),
[iOS simulator](https://docs.expo.dev/workflow/ios-simulator/), or
[Expo Go](https://expo.dev/go).

This project uses [file-based routing](https://docs.expo.dev/router/introduction).
Edit files under `src/app`.
