# Type System

Orpheus uses several advanced TypeScript patterns to push musical validity into the type checker. Invalid musical constructs should produce compile errors, not runtime exceptions.

## Branded primitive types

Raw numbers are ambiguous. The same `number` could be a MIDI note, a semitone count, a frequency, or a pitch class. Branded types prevent accidental coercion:

```typescript
type MidiNumber  = number & { readonly __brand: "MidiNumber" };
type PitchClass  = number & { readonly __brand: "PitchClass" };
type FrequencyHz = number & { readonly __brand: "FrequencyHz" };
```

A `MidiNumber` cannot be passed where a `FrequencyHz` is expected, even though both are `number` at runtime. The brand is erased at compile time — zero runtime cost.

**Construction:** Brands are only applied inside factory functions after validation. Consumer code always receives typed values:

```typescript
// Internal (factory) — one cast at the validated boundary
return ((n % 12 + 12) % 12) as PitchClass;

// External (consumer) — fully typed, no cast needed
const pc: PitchClass = pitchMath.toPitchClass(60);
```

## `ValidInterval` — compile-time quality/number enforcement

A "perfect third" or "major fifth" is musically impossible. The type system rejects them:

```typescript
type PerfectIntervalConstraint = {
  readonly number:  1 | 4 | 5 | 8 | 11 | 12;
  readonly quality: "perfect" | "augmented" | "diminished" | ...;
};

type ImperfectIntervalConstraint = {
  readonly number:  2 | 3 | 6 | 7 | 9 | 10 | 13;
  readonly quality: "major" | "minor" | "augmented" | "diminished" | ...;
};

type ValidInterval = (PerfectIntervalConstraint | ImperfectIntervalConstraint) & Interval;
```

The intersection `& Interval` attaches all operational fields. The union provides the compile-time constraint. `IntervalFactory.fromNumberAndQuality()` returns a `ValidInterval`, not a plain `Interval`, so callers get the guarantee.

```typescript
// Compile error: "perfect" does not appear in ImperfectIntervalConstraint
// when number is 3
const x: ValidInterval = { number: 3, quality: "perfect", semitones: 4, isCompound: false };
```

## `ChordQuality` discriminated union

Chord qualities are not stringly-typed enums. They are a discriminated union on `kind`:

```typescript
type ChordQuality =
  | { readonly kind: "major" }
  | { readonly kind: "minor" }
  | { readonly kind: "dominant7" }
  | { readonly kind: "altered"; readonly alterations: ReadonlyArray<ChordAlteration> }
  // …20 more variants
```

**Why this matters:**

1. Exhaustive `switch` statements catch new variants at compile time:
   ```typescript
   switch (quality.kind) {
     case "major": ...
     case "minor": ...
     // TypeScript errors if a variant is missing when return type is required
     default: const _exhaustive: never = quality; throw new Error();
   }
   ```

2. The `altered` variant carries a typed payload (`alterations`) unavailable on other variants. Accessing `quality.alterations` outside the `altered` branch is a compile error.

3. Adding a new chord quality to the union forces all switch sites to update or fail to compile.

## `SpelledNoteName` co-presence on `Pitch`

```typescript
interface Pitch {
  readonly midi:     MidiNumber;    // identity (enharmonic equivalence)
  readonly spelling: SpelledNoteName; // context (G# vs Ab)
  // …
}
```

A `Pitch` carries both its chromatic identity (`midi`) and its diatonic spelling. This solves a core problem: `G#` and `Ab` are the same MIDI number but have completely different voice-leading implications.

- Arithmetic (transpose, semitonesBetween) operates on `midi`.
- Key-aware spelling uses `spelling`.
- `Key.spellPitchClass()` is the bridge: given any pitch class, it returns the correct `SpelledNoteName` for that key's context.

## `noUncheckedIndexedAccess`

The `tsconfig.json` enables `noUncheckedIndexedAccess: true`. This means:

```typescript
const pitches: ReadonlyArray<Pitch> = chord.pitches;
const bass = pitches[0]; // type: Pitch | undefined
```

Array subscript access returns `T | undefined`, forcing explicit null checks on every indexed access. This prevents runtime errors in `Scale.degree(n)`, `Chord.pitches[0]`, and similar array-dependent operations. The pain at authoring time prevents silent `undefined` bugs at runtime.

## `exactOptionalPropertyTypes`

```typescript
interface Chord {
  readonly bassNote?: Pitch; // means: Pitch | not present (NOT Pitch | undefined)
}
```

With `exactOptionalPropertyTypes: true`, optional properties cannot be explicitly set to `undefined`. They must either be present with a value or absent entirely. This prevents patterns like `{ bassNote: undefined }` which would otherwise be assignable but semantically wrong.

## Immutability enforcement

All interfaces use `readonly` on every property and `ReadonlyArray<T>` for collections. No setters exist anywhere in the public API surface.

```typescript
interface ScalePattern {
  readonly name:      string;
  readonly category:  ScaleCategory;
  readonly intervals: ReadonlyArray<number>; // SemitonePattern
}
```

This means:
- Vitest's `toEqual` performs correct deep structural comparison.
- Patterns can be safely shared across multiple scales without defensive copying.
- Pure-function semantics are enforced: functions that accept `Pitch` cannot mutate it.
