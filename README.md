# Orpheus

A pure-logic music theory engine written in TypeScript, with guitar fretboard theory built on top.

No DOM. No Audio API. No UI framework. Just music mathematics.

## What it does

**`@orpheus/engine`** models the mathematical foundations of Western tonal music: pitch, intervals, scales, chords, harmonic progressions, and key relationships.

**`@orpheus/fretboard`** builds on the engine to model guitar/string-instrument theory: fret positions, tunings, chord voicings, scale maps, hand ergonomics, and the CAGED system.

Every operation is a pure function returning an immutable value — deterministic, thread-safe, and trivially testable.

## Quick examples

```typescript
// --- @orpheus/engine ---
import { pitchFactory, scaleFactory, chordFactory, harmonizer, MAJOR_PATTERN } from "@orpheus/engine";

const cMajorScale = scaleFactory.build(MAJOR_PATTERN, pitchFactory.fromMidi(60));
const diatonic7ths = harmonizer.harmonize(cMajorScale, "seventh");
// → [Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bø7]

const g7 = chordFactory.seventh(pitchFactory.fromMidi(67), "dominant7");
```

```typescript
// --- @orpheus/fretboard ---
import { fretboardFactory, scaleMapFactory, shapeFinder, handOptimizer, STANDARD_TUNING } from "@orpheus/fretboard";
import { chordFactory, scaleFactory, MAJOR_PATTERN, pitchFactory, keyFactory } from "@orpheus/engine";

const fb = fretboardFactory.build(STANDARD_TUNING);

// All C major scale positions on the neck
const cMajor = scaleFactory.build(MAJOR_PATTERN, pitchFactory.fromMidi(60));
const scaleMap = scaleMapFactory.build(cMajor, fb);
const boxes = scaleMap.scalePositions(); // → 5 CAGED-tagged position windows

// Best fingering for a chord progression
const cMaj = chordFactory.triad(pitchFactory.fromMidi(60), "major");
const gMaj = chordFactory.triad(pitchFactory.fromMidi(55), "major");
const path = handOptimizer.optimalPath([cMaj, gMaj], fb);
// → [{voicing, assignments, difficulty}, ...] — minimizes hand shift
```

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | Module hierarchy, dependency graph, layer responsibilities |
| [Type System](docs/type-system.md) | Branded types, discriminated unions, compile-time validity enforcement |
| [Primitives](docs/modules/primitives.md) | Pitch, Interval, NoteName, Frequency |
| [Scales](docs/modules/scales.md) | Scale patterns, modes, registry |
| [Chords](docs/modules/chords.md) | Chord construction, inversions, harmonization |
| [Harmony](docs/modules/harmony.md) | Keys, Roman numerals, circle of fifths, modulation |
| [Analysis](docs/modules/analysis.md) | Chord recognition, key detection, functional analysis |
| [Fretboard](docs/modules/fretboard.md) | Tunings, fret positions, chord shapes, fingering, CAGED system |
| [Development](docs/development.md) | Setup, testing, contributing |

## Monorepo structure

```
orpheus/
├── packages/
│   ├── engine/      @orpheus/engine    — core music theory (pitch, intervals, scales, chords, harmony, analysis)
│   └── fretboard/   @orpheus/fretboard — guitar/string-instrument theory (tunings, shapes, fingering, CAGED)
├── tsconfig.base.json
└── package.json     (private workspace root)
```

Each package is independently buildable and testable. Add a new domain by creating `packages/<name>/`.

## Installation & commands

```sh
npm install          # install all workspace deps (hoisted to root node_modules)

# From repo root — runs across all packages:
npm run typecheck
npm test
npm run build

# From a specific package:
cd packages/fretboard
npx vitest run
npx tsc --noEmit
```

## Design principles

- **Immutable by default** — every operation returns a new instance
- **Type-safe music** — invalid intervals and chord qualities are rejected at compile time
- **Zero dependencies** — no runtime dependencies; devDependencies only
- **Pure functions** — all logic is deterministic and side-effect free
- **Layer isolation** — engine: `utils → primitives → scales → chords → harmony → analysis`; fretboard depends only on engine primitives
