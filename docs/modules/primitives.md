# Primitives

The foundation of the engine. All other modules depend on these types.

**Source:** `src/primitives/`

---

## NoteName (`note-name.ts`)

### `NoteLetter`

```typescript
enum NoteLetter { C=0, D=1, E=2, F=3, G=4, A=5, B=6 }
```

The seven diatonic letter names, ordered `C=0` through `B=6`. The numeric value enables diatonic interval arithmetic (e.g. a third spans 2 letter steps: `E - C = 4 - 0... ` using diatonic counting).

### `Accidental`

```typescript
enum Accidental { DoubleFlat=-2, Flat=-1, Natural=0, Sharp=1, DoubleSharp=2 }
```

Expressed as a semitone offset from the natural note. Supports double-sharp and double-flat for correct enharmonic respelling in any key context.

### `SpelledNoteName`

```typescript
interface SpelledNoteName {
  readonly letter:     NoteLetter;
  readonly accidental: Accidental;
}
```

A fully qualified diatonic spelling. Immutable value object. Two `SpelledNoteName` values are equal when both fields match. Use `spelledNoteNamesEqual(a, b)` for comparison.

**Examples:**
```
{ letter: NoteLetter.G, accidental: Accidental.Sharp }  → G#
{ letter: NoteLetter.A, accidental: Accidental.Flat }   → Ab
{ letter: NoteLetter.F, accidental: Accidental.DoubleSharp } → F##
```

### Helper functions

```typescript
spelledNoteNameToString(name: SpelledNoteName): string
// { letter: G, accidental: Sharp } → "G#"

spelledNoteNamesEqual(a: SpelledNoteName, b: SpelledNoteName): boolean
// structural equality check
```

---

## Pitch (`pitch.ts`)

### Branded types

```typescript
type MidiNumber  = number & { readonly __brand: "MidiNumber" };   // [0, 127]
type PitchClass  = number & { readonly __brand: "PitchClass" };   // [0, 11]
type FrequencyHz = number & { readonly __brand: "FrequencyHz" };  // > 0
```

See [Type System](../type-system.md#branded-primitive-types) for rationale.

### `Pitch`

```typescript
interface Pitch {
  readonly midi:       MidiNumber;       // canonical identity
  readonly spelling:   SpelledNoteName;  // context-dependent diatonic name
  readonly frequency:  FrequencyHz;      // equal-temperament Hz (A4=440)
  readonly pitchClass: PitchClass;       // midi % 12, [0, 11]
  readonly octave:     number;           // scientific octave (C4=4, C5=5)
}
```

Two `Pitch` values are **enharmonically equivalent** iff `a.midi === b.midi`. They are **identically spelled** iff `spelledNoteNamesEqual(a.spelling, b.spelling)` is also true.

**Octave mapping:** C4 = MIDI 60 = octave 4. Each octave spans 12 MIDI numbers. B3 = MIDI 59 = octave 3.

### `PitchFactory`

```typescript
interface PitchFactory {
  fromMidi(midi: number): Pitch;
  fromMidiWithSpelling(midi: number, spelling: SpelledNoteName): Pitch;
  fromSpelling(spelling: SpelledNoteName, octave: number): Pitch;
  fromFrequency(hz: number): Pitch;
}
```

All factory methods validate input and throw `RangeError` if the resulting MIDI number would fall outside `[0, 127]`.

`fromMidi` uses sharp spelling for black keys (C# not Db). Use `fromMidiWithSpelling` or `Key.spellPitchClass()` to get key-appropriate spelling.

### `PitchArithmetic`

```typescript
interface PitchArithmetic {
  transpose(pitch: Pitch, semitones: number): Pitch;
  semitonesBetween(a: Pitch, b: Pitch): number;
  isEnharmonic(a: Pitch, b: Pitch): boolean;
  respell(pitch: Pitch): Pitch;
}
```

All methods return new `Pitch` instances. `transpose` clamps to `[0, 127]`.

`respell` switches between enharmonic equivalents (G# ↔ Ab). For notes with no standard enharmonic equivalent (C, D, E, F, G, A, B), it returns the same pitch unchanged.

---

## Interval (`interval.ts`)

### `IntervalNumber`

```typescript
type IntervalNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
```

1-based ordinal, matching music convention. Unison = 1, Octave = 8, Thirteenth = 13.

### `IntervalQuality`

```typescript
type IntervalQuality =
  | "doubly-diminished" | "diminished" | "minor"
  | "perfect"
  | "major" | "augmented" | "doubly-augmented";
```

Quality distribution:
- **Perfect family** (`perfect`, `augmented`, `diminished`, doubly variants): unisons (1), fourths (4), fifths (5), octaves (8), and their compounds (11, 12).
- **Imperfect family** (`major`, `minor`, `augmented`, `diminished`, doubly variants): seconds (2), thirds (3), sixths (6), sevenths (7), and their compounds (9, 10, 13).

### `Interval`

```typescript
interface Interval {
  readonly number:     IntervalNumber;
  readonly quality:    IntervalQuality;
  readonly semitones:  number;     // chromatic size
  readonly isCompound: boolean;    // true if number > 8
}
```

`semitones` is the canonical chromatic size. Two intervals with the same semitone count but different `number`/`quality` are **enharmonically equivalent** but **differently spelled** (e.g. minor third = 3 semitones, augmented second = 3 semitones).

### `ValidInterval`

Intersection type that enforces quality/number compatibility at compile time. See [Type System](../type-system.md#validinterval--compile-time-qualitynumber-enforcement).

### `IntervalFactory`

```typescript
interface IntervalFactory {
  fromNumberAndQuality(number: IntervalNumber, quality: IntervalQuality): ValidInterval;
  fromSemitones(semitones: number, preferFlat?: boolean): Interval;
}
```

`fromNumberAndQuality` throws `TypeError` for invalid combinations (perfect third, major fifth, etc.).

`fromSemitones` returns the most common interval for that semitone count. Pass `preferFlat: true` to prefer flat spellings (e.g. minor sixth rather than augmented fifth for 8 semitones).

### `IntervalArithmetic`

| Method | Example | Result |
|---|---|---|
| `add(a, b)` | P5 + P4 | P8 |
| `invert(i)` | M3 | m6 |
| `invert(i)` | P5 | P4 |
| `simplify(i)` | M9 | M2 |
| `compound(i, n)` | M3, 1 octave | M10 |
| `compare(a, b)` | M3 vs P5 | negative |

**Inversion rule:** number → `9 - number`; quality → major↔minor, augmented↔diminished, perfect↔perfect.

### `SEMITONES` constants

```typescript
SEMITONES.PERFECT_FIFTH    // 7
SEMITONES.MAJOR_THIRD      // 4
SEMITONES.TRITONE          // 6
SEMITONES.MAJOR_SEVENTH    // 11
// …and all others through MAJOR_THIRTEENTH (21)
```

---

## Frequency (`frequency.ts`)

```typescript
const A4_HZ   = 440 as FrequencyHz;  // concert A reference
const A4_MIDI = 69  as MidiNumber;   // MIDI number for A4

interface FrequencyConverter {
  midiToHz(midi: MidiNumber): FrequencyHz;
  hzToMidi(hz: FrequencyHz): MidiNumber;     // nearest integer
  hzToMidiExact(hz: FrequencyHz): number;    // fractional MIDI
}
```

**Formula:** `f = 440 × 2^((midi − 69) / 12)`

The concrete `frequencyConverter` object is exported directly — no instantiation needed:

```typescript
import { frequencyConverter } from "orpheus";
frequencyConverter.midiToHz(60 as MidiNumber); // → ~261.63 Hz
```
