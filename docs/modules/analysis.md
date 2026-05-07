# Analysis

**Source:** `src/analysis/`

Analysis modules work in the inference direction: given observed pitch data (or chords in context), they identify what is likely happening harmonically. All analysis is probabilistic or rule-based — results include confidence scores or ranked alternatives.

---

## Chord Analyzer (`chord-analyzer.ts`)

Identifies the most likely chord(s) from an unordered set of pitches.

```typescript
interface ChordInterpretation {
  readonly chord:      Chord;
  readonly confidence: number;   // [0.0, 1.0]
  readonly rationale:  string;   // human-readable explanation
}

interface ChordAnalyzer {
  analyze(pitches: ReadonlyArray<Pitch>): ReadonlyArray<ChordInterpretation>;
  bestFit(pitches: ReadonlyArray<Pitch>): ChordInterpretation | undefined;
}
```

### Algorithm

1. **Enumerate rotations** — try each pitch as a potential root.
2. **Score candidates** — compare the interval set against all known chord templates.
3. **Rank by confidence** — complete chords score 1.0; incomplete chords (missing 5th, etc.) score lower.

### Confidence scoring factors

| Factor | Effect on confidence |
|---|---|
| All chord tones present | +high |
| Missing fifth (common jazz omission) | −small |
| Missing third (ambiguous triad type) | −large |
| Extra non-chord tones | −small (may indicate extension) |
| Only 2 pitches | ≤ 0.6 |
| 1 pitch | ≤ 0.3 |
| 0 pitches | empty array |

### Examples

```typescript
analyzer.analyze([C4, E4, G4])
// → [{ chord: C major, confidence: 1.0, rationale: "Complete major triad" }]

analyzer.analyze([G4, B4, D5, F5])
// → [{ chord: G dominant 7th, confidence: 1.0, rationale: "Complete dominant 7th" }]

analyzer.analyze([C4, E4])
// → [
//     { chord: C major, confidence: 0.65, rationale: "Root and M3 present, 5th absent" },
//     { chord: C augmented, confidence: 0.5, rationale: "Root and M3 present" },
//   ]

analyzer.analyze([E4, G4, C5])
// → [{ chord: C major (first inversion), confidence: 1.0 }]
```

---

## Key Detector (`key-detector.ts`)

Estimates the most likely key from a collection of pitches.

```typescript
interface KeyDetectionResult {
  readonly key:        Key;
  readonly confidence: number;  // [0.0, 1.0]
}

interface KeyDetector {
  detect(pitches: ReadonlyArray<Pitch>): ReadonlyArray<KeyDetectionResult>;
  bestGuess(pitches: ReadonlyArray<Pitch>): KeyDetectionResult | undefined;
}
```

### Algorithm

Uses pitch-class frequency distribution matched against key profiles (based on the Krumhansl-Schmuckler algorithm). Each of the 24 major/minor keys receives a correlation score against the observed pitch-class histogram.

**Steps:**
1. Build a pitch-class frequency histogram from the input pitches.
2. Correlate the histogram against each of the 24 key profiles.
3. Normalize correlation scores to [0.0, 1.0].
4. Return all 24 results sorted by confidence, highest first.

### Confidence characteristics

| Input | Expected result |
|---|---|
| C major scale pitches (7 notes) | C major ~0.95 |
| C major chord + G major chord | C major ~0.85, G major ~0.7 |
| All 12 chromatic pitches | All keys ~0.08 (uniform) |
| Single pitch | Low confidence, multiple candidates |
| Empty set | Returns `undefined` from `bestGuess()` |

---

## Functional Analyzer (`functional-analyzer.ts`)

Classifies a chord's tonal function within a key.

```typescript
type TonalFunction = "tonic" | "predominant" | "dominant" | "ambiguous";

interface FunctionalAnalysis {
  readonly chord:      Chord;
  readonly key:        Key;
  readonly function:   TonalFunction;
  readonly role?:      string;        // specific role within the function
  readonly isBorrowed: boolean;       // borrowed from parallel key (modal mixture)
}
```

### Diatonic function assignments (major key)

| Degree | Function | Role |
|---|---|---|
| I | tonic | tonic |
| ii | predominant | supertonic |
| iii | tonic | tonic-substitute |
| IV | predominant | subdominant |
| V | dominant | dominant |
| vi | tonic | tonic-substitute |
| vii° | dominant | leading-tone |

### Borrowed chords (modal mixture)

Common borrowings from parallel minor in a major key:

| Chord | Function | `isBorrowed` |
|---|---|---|
| ♭VII | ambiguous | true |
| iv | predominant | true |
| ♭VI | tonic | true |
| ♭III | tonic | true |
| ii° | predominant | true |
| vii°7 | dominant | true |

```typescript
const analysis = functionalAnalyzer.analyze(bFlatMajorChord, cMajorKey);
// → { function: "ambiguous", isBorrowed: true, role: undefined }

const analysis2 = functionalAnalyzer.analyze(fMinorChord, cMajorKey);
// → { function: "predominant", isBorrowed: true, role: "subdominant" }
```

### Secondary functions

Secondary dominants are identified as `dominant` function with the relevant secondary context noted in `role`:

```typescript
const analysis = functionalAnalyzer.analyze(a7Chord, cMajorKey);
// → { function: "dominant", role: "secondary-dominant/ii", isBorrowed: false }
```
