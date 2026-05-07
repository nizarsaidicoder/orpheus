# Orpheus

A pure-logic music theory engine written in TypeScript.

No DOM. No Audio API. No UI framework. Just music mathematics.

## What it does

Orpheus models the mathematical foundations of Western tonal music: pitch, intervals, scales, chords, harmonic progressions, and key relationships. Every operation is a pure function returning an immutable value — deterministic, thread-safe, and trivially testable.

## Quick example

```typescript
// (Requires concrete implementations — see docs/development.md)
import { pitchFactory, chordFactory, harmonizer } from "@orpheus/engine";

const cMajorScale = scaleFactory.build(MAJOR_PATTERN, pitchFactory.fromMidi(60));
const diatonic7ths = harmonizer.harmonize(cMajorScale, "seventh");
// → [Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bø7]

const g7 = chordFactory.seventh(pitchFactory.fromMidi(67), "dominant7");
const tritoneSub = tritoneSubstitution.substitute(g7);
// → Db7 (same guide tones B↔Cb and F↔E#)
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
| [Development](docs/development.md) | Setup, testing, contributing, implementation roadmap |

## Installation

```sh
pnpm install
pnpm typecheck   # verify types
pnpm test        # run test suite
pnpm build       # compile to dist/
```

## Design principles

- **Immutable by default** — every operation returns a new instance
- **Type-safe music** — invalid intervals and chord qualities are rejected at compile time
- **Zero dependencies** — no runtime dependencies; devDependencies only
- **Pure functions** — all logic is deterministic and side-effect free
- **Layer isolation** — strict dependency order: `utils → primitives → scales → chords → harmony → analysis`
