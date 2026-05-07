# Harmony

**Source:** `src/harmony/`

---

## Key (`key.ts`)

```typescript
type Modality = "major" | "minor";

interface Key {
  readonly tonic:               Pitch;
  readonly modality:            Modality;
  readonly signature:           number;      // sharps (+) or flats (−)
  readonly naturalScale:        Scale;
  readonly relative:            Key;
  readonly parallel:            Key;
  readonly enharmonicEquivalent: Key;
  spellPitchClass(pitchClass: number): SpelledNoteName;
}
```

### Key signatures

| Signature | Major key | Minor key |
|---|---|---|
| +7 | C# | A# |
| +6 | F# | D# |
| +5 | B | G# |
| +4 | E | C# |
| +3 | A | F# |
| +2 | D | B |
| +1 | G | E |
| 0 | C | A |
| −1 | F | D |
| −2 | Bb | G |
| −3 | Eb | C |
| −4 | Ab | F |
| −5 | Db | Bb |
| −6 | Gb | Eb |
| −7 | Cb | Ab |

### `spellPitchClass()`

This is the critical method for enharmonic disambiguation. Given any pitch class (0–11), it returns the correct `SpelledNoteName` for the key's diatonic context.

```
D major:  pitch class 6 → F#  (not Gb)
Gb major: pitch class 6 → Gb  (not F#)
F minor:  pitch class 8 → Ab  (not G#)
```

### Key relationships

```typescript
const cMajor: Key = keyFactory.build(C4, "major");
cMajor.relative;             // A minor (same signature)
cMajor.parallel;             // C minor (same tonic)
cMajor.enharmonicEquivalent; // C major (no enharmonic for C; returns self)

const fSharpMajor: Key = keyFactory.build(Fsharp4, "major");
fSharpMajor.enharmonicEquivalent; // Gb major (same pitch-class set)
```

---

## Roman Numeral Analysis (`roman-numeral.ts`)

### `RomanNumeralToken`

```typescript
interface RomanNumeralToken {
  readonly degree:       RomanDegree;      // "I" | "II" | … | "VII"
  readonly isUpperCase:  boolean;          // false → minor/dim root triad
  readonly quality:      string;           // matches ChordQuality.kind
  readonly modifiers:    ReadonlyArray<RomanNumeralModifier>;
  readonly secondaryOf?: RomanDegree;      // set for V/x, VII/x
}
```

### `RomanNumeralAnalyzer`

Bidirectional: analysis direction (chord → token) and realization direction (token → chord).

```typescript
// Analysis: chord → Roman numeral
const token = analyzer.analyze(g7Chord, cMajorKey);
// → { degree: "V", isUpperCase: true, quality: "dominant7", modifiers: [] }

// String parsing
const parsed = analyzer.parse("V7/ii");
// → { degree: "V", quality: "dominant7", modifiers: ["secondary"], secondaryOf: "II" }

// Rendering
analyzer.render(parsed); // → "V7/ii"

// Realization: token → chord
const chord = analyzer.realize(analyzer.parse("IV"), dMajorKey);
// → G major triad
```

### Supported notation

| Notation | Meaning |
|---|---|
| `I` | Major tonic |
| `ii` | Minor supertonic |
| `V7` | Dominant seventh |
| `viø7` | Half-diminished leading-tone seventh |
| `vii°7` | Fully diminished seventh |
| `V7/V` | Secondary dominant of the dominant |
| `V7/ii` | Secondary dominant of the supertonic |
| `bII` | Neapolitan sixth |
| `bVII` | Borrowed subtonic (modal mixture) |

---

## Circle of Fifths (`circle-of-fifths.ts`)

A doubly-linked ring of 12 major nodes and 12 minor nodes, pre-computed at initialization.

```typescript
interface CircleNode {
  readonly key:                 Key;
  readonly dominantNeighbor:    CircleNode;    // +P5, clockwise, +1 sharp
  readonly subdominantNeighbor: CircleNode;   // −P5, counter-clockwise, +1 flat
  readonly relativeKey:         Key;
  readonly fifthsFromC:         number;        // [−6, +6]
}

interface CircleOfFifths {
  nodeFor(key: Key): CircleNode;
  readonly majorKeys: ReadonlyArray<CircleNode>;   // 12 nodes, C first
  readonly minorKeys: ReadonlyArray<CircleNode>;   // 12 nodes, Am first
  pathBetween(from: Key, to: Key): ReadonlyArray<CircleNode>;
  distance(a: Key, b: Key): number;               // 0–6
}
```

### Navigation example

```
C major ring (clockwise):
C → G → D → A → E → B → F#/Gb → Db → Ab → Eb → Bb → F → C

pathBetween(C, A):    [C, G, D, A]  (3 steps clockwise)
pathBetween(C, Bb):   [C, F, Bb]    (2 steps counter-clockwise)
distance(C, F#):      6             (maximum — the tritone key relationship)
```

### Harmonic relatedness

The `distance` function is a heuristic: keys that are fewer fifths apart share more pitch classes and modulate more smoothly. Adjacent keys (distance 1) share 6 of 7 scale pitches.

| Distance | Example | Shared pitches (major) |
|---|---|---|
| 0 | C ↔ C | 7/7 |
| 1 | C ↔ G | 6/7 |
| 2 | C ↔ D | 5/7 |
| 3 | C ↔ A | 4/7 |
| 6 | C ↔ F# | 1/7 |

---

## Secondary Dominants (`secondary-dominant.ts`)

```typescript
interface SecondaryDominant {
  readonly chord:      Chord;         // the applied V7
  readonly tonicizes:  RomanDegree;   // the degree being tonicized
  readonly resolvesTo: Chord;         // the "I" of the local tonicization
  readonly label:      string;        // "V7/ii"
}

interface SecondaryDominantAnalyzer {
  allIn(key: Key): ReadonlyArray<SecondaryDominant>;
  of(degree: RomanDegree, key: Key): SecondaryDominant | undefined;
  identify(chord: Chord, key: Key): SecondaryDominant | undefined;
}
```

**In C major, all secondary dominants:**

| Label | Chord | Resolves to |
|---|---|---|
| V7/ii | A7 | D minor |
| V7/iii | B7 | E minor |
| V7/IV | C7 | F major |
| V7/V | D7 | G major |
| V7/vi | E7 | A minor |

`VII°` is excluded as a conventional tonicization target (non-tonal).

---

## Tritone Substitution (`tritone-sub.ts`)

```typescript
interface TritoneSubPair {
  readonly original:         Chord;            // G7
  readonly substitute:       Chord;            // Db7
  readonly sharedGuideTones: readonly [Pitch, Pitch]; // B and F
}
```

The tritone substitute of a dominant seventh chord has its root exactly 6 semitones (augmented 4th) away. The two chords share the same guide tones — their thirds and sevenths swap roles:

```
G7:   Root=G, 3rd=B, 5th=D, 7th=F
Db7:  Root=Db, 3rd=F, 5th=Ab, 7th=Cb(=B)

Shared: B (=Cb) and F (=E#)
```

This is why the substitution works: the guide tones that define the dominant function (the tritone between 3rd and 7th) are preserved. The bass motion changes from a descending 5th (G→C) to a descending semitone (Db→C), a hallmark of jazz reharmonization.

```typescript
const pair = tritoneSubstitution.forKey(cMajorKey);
// pair.original   → G7
// pair.substitute → Db7
// pair.sharedGuideTones → [B4, F4]
```

---

## Modulation (`modulation.ts`)

```typescript
type ModulationMechanism =
  | "pivot-chord"         // diatonic in both keys
  | "direct"              // abrupt, no pivot
  | "secondary-dominant"  // applied chord
  | "chromatic-mediant"   // third relationship (C→E, C→Ab)
  | "enharmonic"          // respelling pivot (dim7, Ger+6)
  | "common-tone";        // single shared pitch

interface ModulationPath {
  readonly from:  Key;
  readonly to:    Key;
  readonly steps: ReadonlyArray<ModulationStep>;
  readonly cost:  number;  // lower = smoother
}
```

### Modulation cost model

| Mechanism | Relative cost | Smoothness |
|---|---|---|
| pivot-chord | lowest | Very smooth — shared harmonic context |
| secondary-dominant | low | Smooth — applied chord prepares the new key |
| common-tone | medium | Moderate |
| chromatic-mediant | medium-high | Abrupt but colorful |
| direct | high | Abrupt |
| enharmonic | high | Requires listener reinterpretation |

### Pivot chord modulation (C major → G major)

Chords diatonic in both C major and G major:
- **G major** (V in C, I in G)
- **E minor** (iii in C, vi in G)
- **D minor** (ii in C, v in G) — note: D minor is minor, but v is also minor in natural minor context
- **B diminished** (vii° in C, iii° in G)

The `ModulationFinder.pivotChords()` method returns these automatically.

### Path finding

```typescript
const path = modulationFinder.findPath(cMajorKey, aMajorKey);
// → ModulationPath with 2 steps (C → E → A, or C → D → A etc.)
// → pivot-chord mechanisms at each step
// → total cost = sum of step costs
```
