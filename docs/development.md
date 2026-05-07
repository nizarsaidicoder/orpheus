# Development

## Setup

Requires: Node.js ≥ 18, npm ≥ 10.

```sh
cd C:\src\projects\orpheus
npm install
npm run typecheck   # verify all types compile
npm test            # run test suite
npm run build       # compile to dist/
```

## Scripts

Run from the repo root (applies to all packages via workspaces) or from inside a specific package.

| Script | Description |
|---|---|
| `npm run build` | Compile `src/` → `dist/` via `tsc -p tsconfig.build.json` |
| `npm test` | Run all tests once with Vitest |
| `npm run test:coverage` | Run with V8 coverage |
| `npm run typecheck` | `tsc --noEmit` — type-checks without emitting |
| `npm run lint` | ESLint over `src/` and `tests/` |

**Per-package (from inside `packages/engine/` or `packages/fretboard/`):**
```sh
npx vitest run                          # tests only
npx vitest run tests/fretboard.test.ts  # single file
npx tsc --noEmit                        # typecheck only
```

## Project structure

```
orpheus/
├── tsconfig.base.json       Shared TS compiler options (strict, NodeNext, exactOptionalPropertyTypes)
├── package.json             Workspace root (private, devDeps hoisted here)
├── API.md                   Full public API reference
│
├── packages/
│   ├── engine/              @orpheus/engine v0.1.0
│   │   ├── src/
│   │   │   ├── primitives/  Pitch, Interval, NoteName, Frequency
│   │   │   ├── scales/      ScalePattern, Scale, registry, all patterns
│   │   │   ├── chords/      Chord, ChordFactory, Voicing, Harmonizer
│   │   │   ├── harmony/     Key, RomanNumeral, CircleOfFifths, Modulation
│   │   │   ├── analysis/    ChordAnalyzer, KeyDetector, FunctionalAnalyzer
│   │   │   ├── utils/       Math, Validation, EnharmonicTable
│   │   │   └── index.ts     Public barrel
│   │   └── tests/           Mirrors src/ — 372 tests, 100% coverage
│   │
│   └── fretboard/           @orpheus/fretboard v0.1.0
│       ├── src/
│       │   ├── types/       GuitarString, Tuning, FretPosition, ChordVoicing, Fingering
│       │   ├── tunings/     Standard tuning constants + tuningFactory/registry
│       │   ├── fretboard/   Fretboard class + fretboardFactory
│       │   ├── scale-map/   ScaleMap class + scaleMapFactory
│       │   ├── chord-shapes/ shapeFinder + scoreVoicing
│       │   ├── fingering/   fingeringAnalyzer + handOptimizer
│       │   ├── caged/       cagedSystem (CAGED positions + shape detection)
│       │   ├── analysis/    positionAnalyzer (positions → chord/scale)
│       │   └── index.ts     Public barrel
│       └── tests/           47 tests
│
└── docs/
    ├── architecture.md
    ├── development.md       (this file)
    ├── type-system.md
    └── modules/
        ├── primitives.md
        ├── scales.md
        ├── chords.md
        ├── harmony.md
        ├── analysis.md
        └── fretboard.md
```

## Implementation status

All phases complete.

### `@orpheus/engine`

| Layer | Status |
|---|---|
| `utils/` — math, validation, enharmonic table | ✅ complete |
| `primitives/` — pitch, interval, frequency, note-name | ✅ complete |
| `scales/` — all patterns + registry + Scale class | ✅ complete |
| `chords/` — factory, inversion, voicing, harmonizer | ✅ complete |
| `harmony/` — key, roman numeral, circle of fifths, modulation | ✅ complete |
| `analysis/` — chord analyzer, key detector, functional analyzer | ✅ complete |

### `@orpheus/fretboard`

| Module | Status |
|---|---|
| `types/` — tuning, fret-position, fingering types | ✅ complete |
| `tunings/` — 7 standard tunings + factory/registry | ✅ complete |
| `fretboard/` — Fretboard class | ✅ complete |
| `scale-map/` — ScaleMap + CAGED position windows | ✅ complete |
| `chord-shapes/` — shape finder + ergonomic scorer | ✅ complete |
| `fingering/` — fingering analyzer + hand path optimizer | ✅ complete |
| `caged/` — CAGED shape detection + key positions | ✅ complete |
| `analysis/` — position → chord/scale identification | ✅ complete |

## Testing

Tests live in `tests/` inside each package and mirror the `src/` structure.

**Running a single test file:**
```sh
npx vitest run tests/fretboard.test.ts
```

**Running a specific test by name:**
```sh
npx vitest run --reporter=verbose -t "pitchAt"
```

**Coverage report:**
```sh
npm run test:coverage
```

Engine coverage thresholds are configured at 100% in `packages/engine/vitest.config.ts`. Barrel files (`index.ts`) are excluded from coverage.

## TypeScript configuration notes

Shared options live in `tsconfig.base.json` at the repo root. Each package extends it.

**`noUncheckedIndexedAccess: true`** — array subscripts return `T | undefined`. Always check bounds:
```typescript
const first = pitches[0]; // type: Pitch | undefined
if (first !== undefined) { /* use first */ }
```

**`exactOptionalPropertyTypes: true`** — optional properties cannot be explicitly set to `undefined`. Omit the property instead:
```typescript
// Error: Type 'undefined' is not assignable to 'Pitch'
const chord: Chord = { ..., bassNote: undefined };

// Correct: omit the property
const chord: Chord = { ... };
```

**`isolatedModules: true`** — use `import type` for type-only imports.

## Module imports in source files

All internal imports use `.js` extensions (NodeNext module resolution):

```typescript
import type { Pitch } from "../primitives/pitch.js";  // correct
import type { Pitch } from "../primitives/pitch";      // incorrect for NodeNext
```

Cross-package imports use the package name:
```typescript
import { pitchFactory, scaleFactory } from "@orpheus/engine";
```

## Adding a new package

1. Create `packages/<name>/` with `package.json`, `tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`, `src/index.ts`
2. Set `"extends": "../../tsconfig.base.json"` in both tsconfig files
3. Add `"@orpheus/engine": "*"` (or other workspace deps) to `dependencies`
4. Configure vitest alias so `@orpheus/engine` resolves to engine source during development:
   ```typescript
   resolve: { alias: { "@orpheus/engine": resolve(__dirname, "../engine/src/index.ts") } }
   ```
5. Run `npm install` from repo root to wire the workspace symlink
