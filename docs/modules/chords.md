# Chords

**Source:** `src/chords/`

---

## Core types (`chord.ts`)

### `ChordQuality`

A discriminated union on `kind`. See [Type System](../type-system.md#chordquality-discriminated-union) for why this pattern is used instead of a string enum.

**Triads**
| Kind | Symbol | Interval structure |
|---|---|---|
| `"major"` | maj | M3 + P5 |
| `"minor"` | m | m3 + P5 |
| `"diminished"` | dim, ° | m3 + d5 |
| `"augmented"` | aug, + | M3 + A5 |
| `"sus2"` | sus2 | M2 + P5 |
| `"sus4"` | sus4 | P4 + P5 |

**Seventh chords**
| Kind | Symbol | Interval structure |
|---|---|---|
| `"major7"` | maj7, M7 | M3 + P5 + M7 |
| `"dominant7"` | 7 | M3 + P5 + m7 |
| `"minor7"` | m7 | m3 + P5 + m7 |
| `"half-diminished7"` | ø7, m7♭5 | m3 + d5 + m7 |
| `"diminished7"` | °7 | m3 + d5 + d7 |
| `"minor-major7"` | mM7 | m3 + P5 + M7 |
| `"augmented-major7"` | +M7 | M3 + A5 + M7 |

**Extended chords** — follow the pattern with 9th, 11th, 13th variants of dominant, major, and minor families.

**Altered dominant**
```typescript
{ kind: "altered"; alterations: ReadonlyArray<ChordAlteration> }
```
```typescript
interface ChordAlteration {
  degree:    5 | 9 | 11 | 13;
  direction: "flat" | "sharp";
}
// Example: G7(♭9, ♯11) →
// alterations: [{ degree: 9, direction: "flat" }, { degree: 11, direction: "sharp" }]
```

### `InversionPosition`

```typescript
type InversionPosition = "root" | "first" | "second" | "third";
```

| Position | Degree in bass | Valid for |
|---|---|---|
| `"root"` | Root (1) | All chords |
| `"first"` | 3rd | All chords |
| `"second"` | 5th | All chords |
| `"third"` | 7th | Seventh chords and above |

### `Chord`

```typescript
interface Chord {
  readonly root:              Pitch;
  readonly quality:           ChordQuality;
  readonly pitches:           ReadonlyArray<Pitch>;  // ascending from bass
  readonly inversion:         InversionPosition;
  readonly bassNote?:         Pitch;                 // slash chord override
  readonly intervalStructure: ReadonlyArray<Interval>; // from root, excl. root
}
```

**`pitches`** are always in ascending order from the bass note. For a root-position C major triad: `[C4, E4, G4]`. For first inversion: `[E4, G4, C5]`.

**`intervalStructure`** lists intervals from the root (not from the bass). A first-inversion chord still has `[M3, P5]` in `intervalStructure`; the inversion is captured in `inversion` and `pitches`.

**`bassNote`** overrides the lowest voice for slash chords. `C/E` is a C major chord with `bassNote = E4`. The bass note need not be a chord tone (e.g. `C/A` is unusual but representable).

---

## ChordFactory (`chord-factory.ts`)

```typescript
interface ChordFactory {
  triad(root: Pitch, quality: TriadQualityKind): Chord;
  seventh(root: Pitch, quality: SeventhQualityKind): Chord;
  build(options: ChordBuildOptions): Chord;
  invert(chord: Chord, position: "first" | "second" | "third"): Chord;
  slash(chord: Chord, bassNote: Pitch): Chord;
}
```

All methods are pure functions returning new `Chord` instances.

**`build()` options:**
```typescript
interface ChordBuildOptions {
  root:         Pitch;
  quality:      ChordQuality;
  alterations?: ReadonlyArray<ChordAlteration>;
  omitFifth?:   boolean;  // common in jazz voicing of extended chords
}
```

**Usage patterns:**
```typescript
// Simple triad
const c = chordFactory.triad(C4, "major");              // C major

// Seventh chord
const g7 = chordFactory.seventh(G4, "dominant7");       // G7

// Extended chord
const cMaj9 = chordFactory.build({
  root: C4,
  quality: { kind: "major9" },
});

// Altered dominant
const g7alt = chordFactory.build({
  root: G4,
  quality: { kind: "altered", alterations: [
    { degree: 9, direction: "flat" },
    { degree: 11, direction: "sharp" },
  ]},
});

// Inversion
const cFirst = chordFactory.invert(c, "first");         // C/E

// Slash chord
const cOverA = chordFactory.slash(c, A3);               // C/A
```

---

## Inversion (`inversion.ts`)

```typescript
interface InversionAnalyzer {
  analyze(chord: Chord): InversionPosition | undefined;
  bassIndex(chord: Chord): number;
  isRootPosition(chord: Chord): boolean;
}
```

`analyze` returns `undefined` when the bass note is not a chord tone (non-chord slash bass).

`rotatePitchesToBass(pitches, bassIndex)` is a pure helper function that rotates a pitch array so the pitch at `bassIndex` becomes the new bass, adjusting octaves to maintain ascending order.

---

## Voicing (`voicing.ts`)

```typescript
type VoicingStyle = "close" | "drop2" | "drop3" | "open";

interface VoicingGenerator {
  close(chord: Chord): VoicedChord;
  drop2(chord: Chord): VoicedChord;   // second from top drops one octave
  drop3(chord: Chord): VoicedChord;   // third from top drops one octave
  open(chord: Chord): VoicedChord;
}
```

**Drop-2 voicing** — the standard 4-voice jazz voicing for seventh chords. Expands close position to a more playable range on guitar and piano.

Example: G7 close = `[G3, B3, D4, F4]`. G7 drop-2 = `[G3, D4, F4, B4]` (second from top, B3, drops to B4).

`drop2` and `drop3` throw `RangeError` if the chord has fewer than 4 pitches.

---

## Harmonizer (`harmonizer.ts`)

```typescript
type HarmonizationExtension =
  | "triad" | "seventh" | "ninth" | "eleventh" | "thirteenth";

interface Harmonizer {
  harmonize(scale: Scale, extension?: HarmonizationExtension): ReadonlyArray<HarmonizedDegree>;
  degreeChord(scale: Scale, degree: number, extension?: HarmonizationExtension): Chord;
}

interface HarmonizedDegree {
  scaleDegree:  number;
  romanNumeral: string;
  chord:        Chord;
}
```

`harmonize` stacks thirds on each scale degree. The chord quality at each degree is determined by the intervals available within the scale.

**C major — triad harmonization:**

| Degree | Chord | Roman numeral |
|---|---|---|
| 1 | C major | I |
| 2 | D minor | ii |
| 3 | E minor | iii |
| 4 | F major | IV |
| 5 | G major | V |
| 6 | A minor | vi |
| 7 | B diminished | viidim |

**C major — seventh harmonization:**

| Degree | Chord | Roman numeral |
|---|---|---|
| 1 | Cmaj7 | Imaj7 |
| 2 | Dm7 | iim7 |
| 3 | Em7 | iiim7 |
| 4 | Fmaj7 | IVmaj7 |
| 5 | G7 | V7 |
| 6 | Am7 | vim7 |
| 7 | Bø7 | viiø7 |
