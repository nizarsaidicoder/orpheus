# Architecture

## Module layers

Orpheus is organized into six layers. Dependencies flow strictly downward — no layer imports from a layer above it, and no circular dependencies exist anywhere in the graph.

```
┌─────────────────────────────────────────────────────────────┐
│                         analysis/                           │
│      ChordAnalyzer · KeyDetector · FunctionalAnalyzer       │
├─────────────────────────────────────────────────────────────┤
│                          harmony/                           │
│  Key · RomanNumeral · CircleOfFifths · SecondaryDominant    │
│            TritoneSubstitution · ModulationFinder           │
├─────────────────────────────────────────────────────────────┤
│                          chords/                            │
│    Chord · ChordFactory · Inversion · Voicing · Harmonizer  │
├─────────────────────────────────────────────────────────────┤
│                          scales/                            │
│     Scale · ScalePattern · ScaleRegistry · all patterns     │
├─────────────────────────────────────────────────────────────┤
│                        primitives/                          │
│       Pitch · Interval · NoteName · FrequencyConverter      │
├─────────────────────────────────────────────────────────────┤
│                           utils/                            │
│           PitchMath · Validation · EnharmonicTable          │
└─────────────────────────────────────────────────────────────┘
```

## Layer responsibilities

### `utils/`
Stateless mathematical helpers with no music-domain types as dependencies.

| File | Responsibility |
|---|---|
| `math.ts` | Modular arithmetic (`mod`, `toPitchClass`, `pitchClassDistance`) |
| `validation.ts` | Input guard functions (`isMidiNumber`, `assertMidi`, etc.) |
| `enharmonic.ts` | Static enharmonic lookup table; pitch class → spellings |

### `primitives/`
The foundational value types. All higher layers depend on these.

| File | Responsibility |
|---|---|
| `note-name.ts` | `NoteLetter` enum, `Accidental` enum, `SpelledNoteName` interface |
| `pitch.ts` | `Pitch` interface; branded `MidiNumber`, `PitchClass`, `FrequencyHz` types |
| `interval.ts` | `Interval` interface; `ValidInterval` discriminated union; `SEMITONES` constants |
| `frequency.ts` | Equal-temperament Hz ↔ MIDI conversion; A4 = 440 Hz reference |

### `scales/`
Scale patterns (recipes) and the abstract `Scale` class.

| File | Responsibility |
|---|---|
| `scale.ts` | `ScalePattern`, `SemitonePattern`, `ScaleCategory`; `Scale` abstract class |
| `diatonic.ts` | Major, natural minor, harmonic minor, melodic minor, harmonic major patterns |
| `modes.ts` | All seven church modes (Ionian through Locrian) |
| `symmetric.ts` | Whole-tone, diminished (HW and WH), augmented patterns |
| `exotic.ts` | Pentatonic, blues, Phrygian dominant, Hungarian minor, altered, Lydian dominant |
| `scale-registry.ts` | `ScaleRegistry` interface; `defaultScaleRegistry` with all built-ins |

### `chords/`
Chord value types and construction logic.

| File | Responsibility |
|---|---|
| `chord.ts` | `Chord` interface; `ChordQuality` discriminated union; `ChordAlteration`; `InversionPosition` |
| `chord-factory.ts` | `ChordFactory` — builds triads, sevenths, extensions, slash chords |
| `inversion.ts` | `InversionAnalyzer`; `rotatePitchesToBass` pure helper |
| `voicing.ts` | `VoicingGenerator` — close, drop-2, drop-3, open voicings |
| `harmonizer.ts` | `Harmonizer` — diatonic harmonization of a scale up to 13ths |

### `harmony/`
Key-aware harmonic structures and navigation.

| File | Responsibility |
|---|---|
| `key.ts` | `Key` interface with `spellPitchClass()` for enharmonic disambiguation |
| `roman-numeral.ts` | `RomanNumeralToken`; bidirectional analysis ↔ realization |
| `circle-of-fifths.ts` | `CircleOfFifths` doubly-linked ring; `pathBetween`, `distance` |
| `secondary-dominant.ts` | Applied-chord tonicizations; `allIn()`, `of()`, `identify()` |
| `tritone-sub.ts` | Tritone substitute pairs; guide-tone verification |
| `modulation.ts` | `ModulationFinder` — Dijkstra-style graph search over harmonic space |

### `analysis/`
Inference from observed pitch data.

| File | Responsibility |
|---|---|
| `chord-analyzer.ts` | `ChordAnalyzer` — confidence-ranked chord interpretation of pitch sets |
| `key-detector.ts` | `KeyDetector` — probabilistic key estimation from pitch collection |
| `functional-analyzer.ts` | `FunctionalAnalyzer` — tonic / predominant / dominant / borrowed classification |

## Full import dependency graph

```
utils/math.ts             ← (no internal deps)
utils/validation.ts       ← (no internal deps)
utils/enharmonic.ts       ← primitives/note-name

primitives/note-name.ts   ← (no internal deps)
primitives/frequency.ts   ← primitives/pitch (type only)
primitives/pitch.ts       ← primitives/note-name
primitives/interval.ts    ← (no internal deps)

scales/scale.ts           ← primitives/pitch, primitives/interval
scales/diatonic.ts        ← scales/scale
scales/modes.ts           ← scales/scale
scales/symmetric.ts       ← scales/scale
scales/exotic.ts          ← scales/scale
scales/scale-registry.ts  ← scales/scale, scales/diatonic, scales/modes,
                             scales/symmetric, scales/exotic

chords/chord.ts           ← primitives/pitch, primitives/interval
chords/chord-factory.ts   ← chords/chord, primitives/pitch
chords/inversion.ts       ← chords/chord, primitives/pitch
chords/voicing.ts         ← chords/chord, primitives/pitch
chords/harmonizer.ts      ← chords/chord, chords/chord-factory, scales/scale

harmony/key.ts            ← primitives/pitch, primitives/note-name, scales/scale
harmony/roman-numeral.ts  ← chords/chord, harmony/key
harmony/circle-of-fifths  ← harmony/key
harmony/secondary-dom.ts  ← chords/chord, harmony/key, harmony/roman-numeral
harmony/tritone-sub.ts    ← chords/chord, harmony/key
harmony/modulation.ts     ← chords/chord, harmony/key, harmony/circle-of-fifths

analysis/chord-analyzer   ← primitives/pitch, chords/chord
analysis/key-detector     ← primitives/pitch, harmony/key
analysis/functional-anal  ← chords/chord, harmony/key
```

## Key structural invariants

1. **No upward imports** — a layer never imports from a layer above it.
2. **No circular imports** — verified by module topology.
3. **Interfaces over classes** — most types are interfaces; `Scale` is the only abstract class. This minimizes inheritance hierarchies.
4. **Patterns are pure data** — `ScalePattern` objects are frozen plain objects with no methods. Behavior lives in the `Scale` class, not the pattern.
5. **Factories are injected, not global** — `PitchFactory`, `ChordFactory`, etc. are interfaces that can be swapped for testing.
