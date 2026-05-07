# Development

## Setup

Requires: Node.js ≥ 18, pnpm ≥ 9.

```sh
cd C:\src\projects\orpheus
pnpm install
pnpm typecheck   # verify all types compile
pnpm test        # run test suite
pnpm build       # compile to dist/
```

## Scripts

| Script | Description |
|---|---|
| `pnpm build` | Compile `src/` → `dist/` via `tsc -p tsconfig.build.json` |
| `pnpm test` | Run all tests once with Vitest |
| `pnpm test:watch` | Watch mode — reruns on file change |
| `pnpm test:coverage` | Run with V8 coverage; enforces 100% thresholds |
| `pnpm typecheck` | `tsc --noEmit` — type-checks without emitting |
| `pnpm lint` | ESLint over `src/` and `tests/` |

## Project structure

```
src/
  primitives/     Pitch, Interval, NoteName, Frequency — no internal deps
  scales/         ScalePattern, Scale, registry
  chords/         Chord, ChordFactory, Voicing, Harmonizer
  harmony/        Key, RomanNumeral, CircleOfFifths, Modulation
  analysis/       ChordAnalyzer, KeyDetector, FunctionalAnalyzer
  utils/          Math, Validation, EnharmonicTable
  index.ts        Public barrel

tests/            Mirrors src/ structure, one *.test.ts per source file
docs/             This documentation
dist/             Compiled output (git-ignored)
```

## Implementation status

The current codebase contains **interfaces, abstract classes, and pure-data implementations**. Concrete method bodies are not yet written for most classes. The implementation order below respects the dependency layers.

### Phase 1 — Utils and primitives (no dependencies)

- [x] `utils/math.ts` — `pitchMath` object (implemented)
- [x] `utils/validation.ts` — guard functions (implemented)
- [x] `utils/enharmonic.ts` — lookup table + helpers (implemented)
- [x] `primitives/frequency.ts` — `frequencyConverter` (implemented)
- [ ] `primitives/pitch.ts` — implement `PitchFactory` and `PitchArithmetic`
- [ ] `primitives/interval.ts` — implement `IntervalFactory` and `IntervalArithmetic`

### Phase 2 — Scales

- [x] All scale patterns in `diatonic.ts`, `modes.ts`, `symmetric.ts`, `exotic.ts` — pure data, done
- [x] `scale-registry.ts` — `createScaleRegistry` + `defaultScaleRegistry` (implemented)
- [ ] `scale.ts` — implement the `Scale` abstract class with a concrete subclass (e.g. `DiatonicScale`)

### Phase 3 — Chords

- [ ] `chord-factory.ts` — implement `ChordFactory` (depends on pitch + interval impls)
- [ ] `inversion.ts` — implement `InversionAnalyzer`
- [ ] `voicing.ts` — implement `VoicingGenerator`
- [ ] `harmonizer.ts` — implement `Harmonizer`

### Phase 4 — Harmony

- [ ] `key.ts` — implement `KeyFactory` (pre-compute all 30 standard keys)
- [ ] `roman-numeral.ts` — implement `RomanNumeralAnalyzer` (parse + render + analyze + realize)
- [ ] `circle-of-fifths.ts` — implement the linked-ring structure
- [ ] `secondary-dominant.ts` — implement `SecondaryDominantAnalyzer`
- [ ] `tritone-sub.ts` — implement `TritoneSubstitution`
- [ ] `modulation.ts` — implement `ModulationFinder` (graph search)

### Phase 5 — Analysis

- [ ] `chord-analyzer.ts` — implement `ChordAnalyzer` (rotation + scoring algorithm)
- [ ] `key-detector.ts` — implement `KeyDetector` (Krumhansl-Schmuckler correlation)
- [ ] `functional-analyzer.ts` — implement `FunctionalAnalyzer` (rule-based classification)

## Testing

Tests live in `tests/` and mirror the `src/` structure. Each test file has spec-level stubs (`it(description, () => {})`) covering the critical assertions from the test coverage map in [Architecture](architecture.md).

**Running a single test file:**
```sh
pnpm vitest run tests/primitives/pitch.test.ts
```

**Running a specific test by name:**
```sh
pnpm vitest run --reporter=verbose -t "A4"
```

**Coverage report:**
```sh
pnpm test:coverage
# opens coverage/index.html after run
```

Coverage thresholds are configured in `vitest.config.ts` at 100% for all metrics. Barrel files (`index.ts`) are excluded.

## TypeScript configuration notes

The `tsconfig.json` uses several strict options worth knowing:

**`noUncheckedIndexedAccess: true`** — array subscripts return `T | undefined`. Always check bounds or use optional chaining:
```typescript
const first = pitches[0]; // type: Pitch | undefined
if (first !== undefined) { /* use first */ }
// or
const first = pitches.at(0); // still Pitch | undefined, but idiomatic
```

**`exactOptionalPropertyTypes: true`** — optional properties cannot be explicitly set to `undefined`. Use `delete` or simply omit the property:
```typescript
// Error: Type 'undefined' is not assignable to 'Pitch'
const chord: Chord = { ..., bassNote: undefined };

// Correct: omit the property
const chord: Chord = { ... }; // bassNote absent
```

**`isolatedModules: true`** — every file must be a module (`import`/`export`). Use `import type` for type-only imports to avoid issues with `isolatedModules`.

## Module imports in source files

All internal imports use `.js` extensions (NodeNext module resolution requires this even for `.ts` source files):

```typescript
import type { Pitch } from "../primitives/pitch.js";  // correct
import type { Pitch } from "../primitives/pitch";      // incorrect for NodeNext
```

This is a TypeScript + NodeNext requirement: the `.js` extension in the import maps to the `.ts` source during compilation and the compiled `.js` file at runtime.
