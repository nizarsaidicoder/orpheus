# Fretboard — `@orpheus/fretboard`

Guitar and string-instrument theory built on `@orpheus/engine`.

**Source:** `packages/fretboard/src/`

---

## Types

### `Tuning`

```typescript
interface GuitarString {
  readonly number: number;      // 1 = highest pitch (high e), N = lowest pitch (low E)
  readonly openPitch: Pitch;    // pitch when played open (fret 0)
}

interface Tuning {
  readonly name: string;
  readonly strings: ReadonlyArray<GuitarString>;  // ordered high→low (string 1 first)
}
```

### `FretPosition`

```typescript
interface FretPosition {
  readonly string: number;   // 1-indexed; 1 = highest pitch string
  readonly fret: number;     // 0 = open string
  readonly pitch: Pitch;     // computed pitch at this position
}
```

### `ChordVoicing`

```typescript
interface ChordVoicing {
  readonly slots: ReadonlyArray<FretPosition | null>;  // null = muted string; index i → string i+1
  readonly barre?: BarreSegment;
}
```

### `Fingering`

```typescript
type Finger = 0 | 1 | 2 | 3 | 4;  // 0 = open/muted; 1 = index; 2 = middle; 3 = ring; 4 = pinky

interface FingerAssignment {
  readonly position: FretPosition;
  readonly finger: Finger;
  readonly isBarre: boolean;
}

interface BarreSegment {
  readonly fret: number;
  readonly fromString: number;   // highest string number in barre (lowest pitch end)
  readonly toString: number;     // lowest string number in barre (highest pitch end)
  readonly finger: 1;
}

interface Fingering {
  readonly voicing: ChordVoicing;
  readonly assignments: ReadonlyArray<FingerAssignment>;
  readonly difficulty: number;   // ergonomic score; 0 = easiest
}
```

### `FretboardConstraints`

```typescript
interface FretboardConstraints {
  readonly maxFretSpan?: number;        // default 4 — max span of active (non-open) frets
  readonly allowOpenStrings?: boolean;  // default true
  readonly requireRootInBass?: boolean; // default false — lowest played string must be root
  readonly minStrings?: number;         // default 3 — minimum strings played
  readonly maxStrings?: number;         // default string count
  readonly fromFret?: number;           // search window start (default 0)
  readonly toFret?: number;             // search window end (default 12)
}
```

---

## Tunings

### Constants

| Export | Strings (low→high) | Name |
|---|---|---|
| `STANDARD_TUNING` | E A D G B e | Standard |
| `DROP_D` | D A D G B e | Drop D |
| `OPEN_G` | D G D G B D | Open G |
| `OPEN_E` | E B E G# B E | Open E |
| `DADGAD` | D A D G A D | DADGAD |
| `HALF_STEP_DOWN` | Eb Ab Db Gb Bb eb | Half Step Down |
| `WHOLE_STEP_DOWN` | D G C F A d | Whole Step Down |

### `tuningFactory`

| Method | Signature | Description |
|---|---|---|
| `fromMidiArray` | `(name, midis[])` → `Tuning` | `midis[0]` = lowest string (e.g. low E). String numbers assigned automatically. |
| `fromSpellings` | `(name, spellings[], octaves[])` → `Tuning` | Build from `SpelledNoteName` + octave per string. |

### `tuningRegistry`

| Method | Signature | Description |
|---|---|---|
| `register` | `(tuning)` → `void` | Register a named tuning. |
| `get` | `(name)` → `Tuning \| undefined` | Case-insensitive lookup. |
| `all` | `()` → `Tuning[]` | All registered tunings. |

All 7 standard tunings are pre-registered at import time.

---

## Fretboard

### `fretboardFactory`

```typescript
fretboardFactory.build(tuning: Tuning, fretCount = 24): Fretboard
```

### `Fretboard`

| Method / Property | Description |
|---|---|
| `pitchAt(string, fret)` | `Pitch` at the given string/fret position. O(1). Throws `RangeError` for out-of-range inputs. |
| `positionsForString(n)` | All `FretPosition[]` on string `n` (frets 0…fretCount). |
| `positionsForPitch(pitch)` | All positions with `midi === pitch.midi`. |
| `positionsForPitchClass(pc)` | All positions with `pitchClass === pc`. |
| `positionsInRange(from, to)` | All positions with `fret` in `[from, to]`. |
| `stringCount` | Number of strings in the tuning. |
| `fretCount` | Number of frets (default 24). |

---

## Scale Map

Maps a materialized `Scale` onto the fretboard.

### `scaleMapFactory`

```typescript
scaleMapFactory.build(scale: Scale, fretboard: Fretboard): ScaleMap
```

### `ScaleMap`

| Method / Property | Description |
|---|---|
| `positions` | All fretboard positions whose pitch class is in the scale. |
| `positionsForString(n)` | Scale positions on string `n` only. |
| `positionsInFretRange(from, to)` | Scale positions in fret window. |
| `positionsForDegree(n)` | Positions whose pitch class matches scale degree `n` (1-based). |
| `scalePositions(fretSpan = 4)` | Sliding-window groups — each `ScalePosition` covers `fretSpan` frets. Tagged with CAGED shape when detectable. |

```typescript
interface ScalePosition {
  readonly positions: ReadonlyArray<FretPosition>;
  readonly fretRange: readonly [number, number];
  readonly cagedShape?: "C" | "A" | "G" | "E" | "D";
}
```

---

## Chord Shape Finder

Finds all valid voicings for a chord on the fretboard.

### `shapeFinder`

| Method | Signature | Description |
|---|---|---|
| `find` | `(chord, fretboard, constraints?)` → `ChordVoicing[]` | All valid voicings, sorted by ergonomic score ascending. |
| `findWithFingering` | `(chord, fretboard, constraints?)` → `Fingering[]` | Same, with finger assignments computed. Skips voicings requiring > 4 fingers. |

**Voicing validity rules:**
- All required pitch classes from `chord.pitches` must be present
- Active fret span ≤ `maxFretSpan` (open strings excluded from span calculation)
- At least `minStrings` strings played

**Ergonomic score factors:**

| Factor | Effect |
|---|---|
| Active fret span | `(span − 1) × 10` |
| String skips between played strings | `+8` per gap |
| Barre required | `+15` |
| Position above fret 12 | `+5` per fret above 12 |
| Open string | `−8` per open string |
| Root not in bass | `+12` |
| Only 3 strings played | `+5` |

---

## Fingering Engine

### `fingeringAnalyzer`

```typescript
fingeringAnalyzer.assign(voicing: ChordVoicing): Fingering
```

Assigns fingers to all played positions:
1. Detects barres (2+ positions at same fret on contiguous strings) → finger 1
2. Assigns finger 0 to open strings
3. Assigns fingers 2→4 greedily to remaining positions (lowest fret first)
4. Throws `RangeError` if more than 4 simultaneous fingers are required

### `handOptimizer`

| Method | Signature | Description |
|---|---|---|
| `best` | `(chord, fretboard, constraints?)` → `Fingering` | Single lowest-difficulty fingering. |
| `optimalPath` | `(chords[], fretboard, constraints?)` → `Fingering[]` | One fingering per chord in sequence; greedy nearest-neighbor minimizes total hand shift. |

**`optimalPath` algorithm:** for each chord, picks the fingering whose minimum active fret is closest to the previous chord's minimum active fret. Tie-breaks by difficulty score.

---

## CAGED System

The 5 movable major shapes that tile the neck: **C → A → G → E → D → C** (repeating cycle ascending).

### `cagedSystem`

| Method | Signature | Description |
|---|---|---|
| `shapeOf` | `(voicing, root)` → `CAGEDShape \| null` | Matches voicing interval structure against CAGED templates. Returns `null` if overlap < 2 notes. |
| `shapesForKey` | `(key, fretboard)` → `CAGEDPosition[]` | Returns all 5 CAGED positions for a key with their scale notes. |
| `nextShape` | `(shape)` → `CAGEDShape` | Next shape up the neck (C→A→G→E→D→C). |
| `prevShape` | `(shape)` → `CAGEDShape` | Previous shape (C→D→E→G→A→C). |

```typescript
interface CAGEDPosition {
  readonly shape: CAGEDShape;
  readonly rootFret: number;
  readonly positions: ReadonlyArray<FretPosition>;  // scale notes in this window
}
```

---

## Position Analyzer

Reverse-maps fret positions to musical identity.

### `positionAnalyzer`

| Method | Signature | Description |
|---|---|---|
| `identifyChord` | `(positions[])` → `Chord \| null` | Extracts pitches, delegates to `chordAnalyzer.bestFit()`. |
| `identifyScale` | `(positions[], hint?: Key)` → `Scale \| null` | Matches pitch class set against all patterns in `defaultScaleRegistry`. Requires ≥ 60% coverage. `hint.tonic` used as root if provided. |

---

## Usage example

```typescript
import {
  fretboardFactory, scaleMapFactory, shapeFinder, handOptimizer,
  fingeringAnalyzer, cagedSystem, positionAnalyzer,
  STANDARD_TUNING, DROP_D,
} from "@orpheus/fretboard";
import {
  pitchFactory, chordFactory, scaleFactory, keyFactory,
  MAJOR_PATTERN, MINOR_PENTATONIC_PATTERN,
} from "@orpheus/engine";

const fb = fretboardFactory.build(STANDARD_TUNING);

// Fret lookup
fb.pitchAt(6, 0);   // low E (MIDI 40)
fb.pitchAt(1, 12);  // high e octave (MIDI 76)

// Scale map — C major across the whole neck
const cMajor = scaleFactory.build(MAJOR_PATTERN, pitchFactory.fromMidi(60));
const map = scaleMapFactory.build(cMajor, fb);
map.scalePositions();               // 5 CAGED-tagged position windows
map.positionsForDegree(5);          // all G positions (pc = 7)

// Best voicing for C major
const cMaj = chordFactory.triad(pitchFactory.fromMidi(60), "major");
const best = handOptimizer.best(cMaj, fb);
console.log(best.difficulty);       // ergonomic score

// Chord progression — minimize hand movement
const gMaj = chordFactory.triad(pitchFactory.fromMidi(55), "major");
const dMaj = chordFactory.triad(pitchFactory.fromMidi(62), "major");
const path = handOptimizer.optimalPath([cMaj, gMaj, dMaj], fb);

// CAGED positions for G major key
const gMajorKey = keyFactory.major(1); // 1 sharp
const cagedPositions = cagedSystem.shapesForKey(gMajorKey, fb);

// Identify what's being played
const positions = fb.positionsForString(1).slice(0, 5);
positionAnalyzer.identifyChord(positions);
positionAnalyzer.identifyScale(positions);
```
