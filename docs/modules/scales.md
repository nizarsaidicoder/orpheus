# Scales

**Source:** `src/scales/`

---

## Core types (`scale.ts`)

### `SemitonePattern`

```typescript
type SemitonePattern = ReadonlyArray<number>;
```

An ordered array of semitone offsets from the root. Always starts with `0`. Length equals the number of distinct pitches in the scale.

```
Major scale:      [0, 2, 4, 5, 7, 9, 11]
Natural minor:    [0, 2, 3, 5, 7, 8, 10]
Whole-tone:       [0, 2, 4, 6, 8, 10]
Diminished (HW):  [0, 1, 3, 4, 6, 7, 9, 10]
```

### `ScalePattern`

```typescript
interface ScalePattern {
  readonly name:      string;
  readonly category:  ScaleCategory;
  readonly intervals: SemitonePattern;
  readonly modes?:    ReadonlyArray<string>;
}
```

The key design choice: `ScalePattern` is a plain data object with no behavior. It is the "recipe." The `Scale` class is the "materialized" result. This separation allows the `ScaleRegistry` to store and look up patterns without any pitch dependency.

### `ScaleCategory`

| Value | Description |
|---|---|
| `"diatonic"` | Major and minor variants |
| `"mode"` | Church modes (Ionian–Locrian) |
| `"symmetric"` | Whole-tone, diminished, augmented |
| `"harmonic"` | Harmonic major/minor |
| `"melodic"` | Melodic minor and its modes |
| `"pentatonic"` | 5-note scales |
| `"blues"` | Blues scales |
| `"synthetic"` | User-defined or non-standard |

### `Scale` abstract class

```typescript
abstract class Scale {
  abstract readonly root:    Pitch;
  abstract readonly pattern: ScalePattern;
  abstract readonly pitches: ReadonlyArray<Pitch>;

  abstract degree(n: number): Pitch;
  abstract intervalToDegree(n: number): Interval;
  abstract transpose(semitones: number): Scale;
  abstract mode(degree: number): Scale;
  abstract contains(pitch: Pitch): boolean;
}
```

`Scale` is an abstract class (not interface) because concrete subclasses share algorithmic behavior: degree wrapping, contains-check logic, and default octave adjustment when degrees exceed the scale length.

**`degree(n)`** — 1-based. Supports `n > scale length` by wrapping with octave offset. `degree(8)` on a 7-note scale returns the root one octave up.

**`mode(degree)`** — Returns a new `Scale` rooted on the given scale degree, with a new `ScalePattern` derived from rotating the interval array. `CMajor.mode(2)` returns D Dorian.

**`contains(pitch)`** — Compares by pitch class only (ignores octave). Uses enharmonic equivalence.

---

## Diatonic patterns (`diatonic.ts`)

| Export | Name | Intervals | Category |
|---|---|---|---|
| `MAJOR_PATTERN` | `"major"` | `[0,2,4,5,7,9,11]` | diatonic |
| `NATURAL_MINOR_PATTERN` | `"natural-minor"` | `[0,2,3,5,7,8,10]` | diatonic |
| `HARMONIC_MINOR_PATTERN` | `"harmonic-minor"` | `[0,2,3,5,7,8,11]` | harmonic |
| `MELODIC_MINOR_PATTERN` | `"melodic-minor"` | `[0,2,3,5,7,9,11]` | melodic |
| `HARMONIC_MAJOR_PATTERN` | `"harmonic-major"` | `[0,2,4,5,7,8,11]` | harmonic |

**Harmonic minor** — raised 7th creates a leading tone. Produces an augmented 2nd (A2) between ♭6 and ♮7. The V7 chord in a minor key uses this scale.

**Melodic minor** — both 6th and 7th raised (ascending form). In classical practice, descending reverts to natural minor; in jazz, the ascending form is used bidirectionally. All melodic minor modes (Lydian dominant, Altered scale, etc.) derive from this pattern.

---

## Church modes (`modes.ts`)

All seven modes exported individually and as `ALL_CHURCH_MODES` array.

| Mode | Intervals | Character |
|---|---|---|
| Ionian | `[0,2,4,5,7,9,11]` | Major (same as major scale) |
| Dorian | `[0,2,3,5,7,9,10]` | Minor with raised 6th |
| Phrygian | `[0,1,3,5,7,8,10]` | Minor with ♭2 |
| Lydian | `[0,2,4,6,7,9,11]` | Major with ♯4 |
| Mixolydian | `[0,2,4,5,7,9,10]` | Major with ♭7 (dominant scale) |
| Aeolian | `[0,2,3,5,7,8,10]` | Natural minor (same as natural minor scale) |
| Locrian | `[0,1,3,5,6,8,10]` | Diminished; ♭2 and ♭5 |

The church modes are rotations of the major scale. `Scale.mode(n)` produces the same result as using the standalone mode patterns, but `Scale.mode(2)` on a C major scale automatically handles root and pitch calculation.

---

## Symmetric scales (`symmetric.ts`)

Symmetric scales are defined by a repeating interval cell. Transposing by the cell interval yields the same pitch-class set, which means fewer distinct transpositions exist.

| Export | Intervals | Pitches | Symmetry cell | Distinct transpositions |
|---|---|---|---|---|
| `WHOLE_TONE_PATTERN` | `[0,2,4,6,8,10]` | 6 | M2 | 2 |
| `DIMINISHED_HW_PATTERN` | `[0,1,3,4,6,7,9,10]` | 8 | m3 | 3 |
| `DIMINISHED_WH_PATTERN` | `[0,2,3,5,6,8,9,11]` | 8 | m3 | 3 |
| `AUGMENTED_PATTERN` | `[0,3,4,7,8,11]` | 6 | M3 | 4 |

**Diminished HW** (half-whole) — used over dominant 7♭9 chords. Alternates half-step then whole-step.

**Diminished WH** (whole-half) — used over fully diminished 7th chords. Alternates whole-step then half-step.

---

## Exotic and synthetic patterns (`exotic.ts`)

| Export | Intervals | Notes |
|---|---|---|
| `MAJOR_PENTATONIC_PATTERN` | `[0,2,4,7,9]` | No semitones |
| `MINOR_PENTATONIC_PATTERN` | `[0,3,5,7,10]` | Relative minor of major pentatonic |
| `BLUES_PATTERN` | `[0,3,5,6,7,10]` | Minor pentatonic + ♭5 "blue note" |
| `PHRYGIAN_DOMINANT_PATTERN` | `[0,1,4,5,7,8,10]` | Mode 5 of harmonic minor |
| `DOUBLE_HARMONIC_PATTERN` | `[0,1,4,5,7,8,11]` | Byzantine; two A2 intervals |
| `HUNGARIAN_MINOR_PATTERN` | `[0,2,3,6,7,8,11]` | Harmonic minor with ♯4 |
| `LYDIAN_DOMINANT_PATTERN` | `[0,2,4,6,7,9,10]` | Mode 4 of melodic minor; overtone scale |
| `ALTERED_PATTERN` | `[0,1,3,4,6,8,10]` | Mode 7 of melodic minor; super Locrian |

---

## Scale Registry (`scale-registry.ts`)

```typescript
interface ScaleRegistry {
  get(name: string): ScalePattern | undefined;  // case-insensitive
  readonly names: ReadonlyArray<string>;
  byCategory(category: ScaleCategory): ReadonlyArray<ScalePattern>;
  register(pattern: ScalePattern): ScaleRegistry;  // returns new registry
}
```

`register()` returns a new `ScaleRegistry` containing all existing patterns plus the new one. The original registry is not modified.

```typescript
import { defaultScaleRegistry } from "@orpheus/engine";

defaultScaleRegistry.get("major");           // MAJOR_PATTERN
defaultScaleRegistry.get("DORIAN");          // DORIAN_PATTERN (case-insensitive)
defaultScaleRegistry.byCategory("symmetric"); // 4 patterns

const extended = defaultScaleRegistry.register({
  name: "my-scale",
  category: "synthetic",
  intervals: [0, 1, 5, 7, 11],
});
extended.get("my-scale"); // ScalePattern
defaultScaleRegistry.get("my-scale"); // undefined — original unchanged
```
