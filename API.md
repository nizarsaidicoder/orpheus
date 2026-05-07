# Orpheus Public API

This document covers the public API of both packages.

- [`@orpheus/engine`](#orpheusengine) — core music theory
- [`@orpheus/fretboard`](#orpheusfretboard) — guitar fretboard theory

---

# `@orpheus/engine`

**Source:** `packages/engine/src/`

All exports available from `"@orpheus/engine"` (root barrel) or subpath imports.

---

## Primitives

### `pitchFactory` — `PitchFactory`

Construct immutable `Pitch` instances.

| Method | Signature | Description |
|--------|-----------|-------------|
| `fromMidi` | `(midi: number) → Pitch` | Build from MIDI 0–127. Black keys use sharp spelling. |
| `fromMidiWithSpelling` | `(midi: number, spelling: SpelledNoteName) → Pitch` | Build from MIDI with explicit enharmonic spelling. |
| `fromSpelling` | `(spelling: SpelledNoteName, octave: number) → Pitch` | Build from diatonic spelling + scientific octave. Throws `RangeError` if MIDI out of range. |
| `fromFrequency` | `(hz: number) → Pitch` | Round Hz to nearest MIDI, use sharp spelling. |

**`Pitch` shape:**
```ts
{ midi: MidiNumber; spelling: SpelledNoteName; frequency: FrequencyHz; pitchClass: PitchClass; octave: number }
```

---

### `pitchArithmetic` — `PitchArithmetic`

Pure pitch arithmetic. Returns new `Pitch` instances; nothing mutated.

| Method | Signature | Description |
|--------|-----------|-------------|
| `transpose` | `(pitch, semitones: number) → Pitch` | Shift up/down; clamps to [0, 127]. Preserves sharp/flat direction. |
| `semitonesBetween` | `(a, b) → number` | Signed distance `b.midi − a.midi`. |
| `isEnharmonic` | `(a, b) → boolean` | Same MIDI number (G# and Ab → true; C4 and C5 → false). |
| `respell` | `(pitch) → Pitch` | Return the alternate enharmonic spelling (G# → Ab). |

---

### `intervalFactory` — `IntervalFactory`

Construct immutable `Interval` instances.

| Method | Signature | Description |
|--------|-----------|-------------|
| `fromNumberAndQuality` | `(number: IntervalNumber, quality: IntervalQuality) → ValidInterval` | Build from diatonic number + quality. Throws `TypeError` for invalid combos (perfect third, major fifth). |
| `fromSemitones` | `(semitones: number, preferFlat?: boolean) → Interval` | Build from raw semitone count. Default: major/perfect spelling. |

**`Interval` shape:**
```ts
{ number: IntervalNumber; quality: IntervalQuality; semitones: number; isCompound: boolean }
```

---

### `intervalArithmetic` — `IntervalArithmetic`

Pure interval arithmetic. Returns new `Interval` instances.

| Method | Signature | Description |
|--------|-----------|-------------|
| `add` | `(a, b) → Interval` | Stack intervals. P5 + P4 = P8. |
| `invert` | `(interval) → Interval` | Inversion within octave. M3 → m6, P5 → P4. |
| `complement` | `(interval) → Interval` | Interval to complete an octave. Equivalent to invert for simple intervals. |
| `simplify` | `(interval) → Interval` | Reduce compound to simple. M9 → M2. |
| `compound` | `(interval, octaves?: number) → Interval` | Add octaves. M3 → M10. |
| `compare` | `(a, b) → number` | Chromatic comparison: negative / 0 / positive. |

---

### `frequencyConverter` — `FrequencyConverter`

Equal-temperament MIDI ↔ Hz conversion. A4 = 440 Hz.

| Method | Signature | Description |
|--------|-----------|-------------|
| `midiToHz` | `(midi: MidiNumber) → FrequencyHz` | |
| `hzToMidi` | `(hz: FrequencyHz) → MidiNumber` | Rounds to nearest integer. |
| `hzToMidiExact` | `(hz: FrequencyHz) → number` | Fractional MIDI (microtonal). |

---

### `spelledNoteNameToString` — free function

```ts
spelledNoteNameToString(name: SpelledNoteName): string
// { letter: G, accidental: Sharp } → "G#"
```

### `spelledNoteNamesEqual` — free function

```ts
spelledNoteNamesEqual(a: SpelledNoteName, b: SpelledNoteName): boolean
```

---

### Enums and branded types

| Export | Values |
|--------|--------|
| `NoteLetter` | `C=0 D=1 E=2 F=3 G=4 A=5 B=6` |
| `Accidental` | `DoubleFlat=−2 Flat=−1 Natural=0 Sharp=1 DoubleSharp=2` |
| `SEMITONES` | Named semitone constants: `UNISON=0 … MAJOR_THIRTEENTH=21` |
| `MidiNumber` | Branded `number`, range [0, 127] |
| `PitchClass` | Branded `number`, range [0, 11] |
| `FrequencyHz` | Branded `number`, always positive |

---

## Scales

### `scaleFactory` — `ScaleFactory`

| Method | Signature | Description |
|--------|-----------|-------------|
| `build` | `(pattern: ScalePattern, root: Pitch) → Scale` | Materialize a scale from a pattern + root. |

**`Scale` instance methods (abstract base class):**

| Method | Signature | Description |
|--------|-----------|-------------|
| `degree` | `(n: number) → Pitch` | 1-based degree. O(1) for n ≤ scale length (returns from precomputed `pitches`); computes on demand for octave-wrapped degrees. Throws `RangeError` if n < 1. |
| `intervalToDegree` | `(n: number) → Interval` | Interval from root to degree n. |
| `transpose` | `(semitones: number) → Scale` | New Scale transposed by semitones. |
| `mode` | `(degree: number) → Scale` | New Scale rooted on the given degree (same pitch set, rotated pattern). |
| `contains` | `(pitch: Pitch) → boolean` | O(1) pitch-class membership check (precomputed `Set`). |

**`Scale` properties:** `root`, `pattern`, `pitches`

---

### `defaultScaleRegistry` — `ScaleRegistry`

Pre-populated registry of all built-in scale patterns.

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `(name: string) → ScalePattern \| undefined` | Case-insensitive lookup. |
| `byCategory` | `(category: ScaleCategory) → ReadonlyArray<ScalePattern>` | Filter by category. |
| `register` | `(pattern: ScalePattern) → ScaleRegistry` | Returns a new registry with the added pattern. Throws if name already exists. |
| `names` | `ReadonlyArray<string>` | All registered scale names. |

**Built-in scale names (27 total):**

| Category | Names |
|----------|-------|
| `diatonic` | major, natural minor, harmonic minor, melodic minor, harmonic major |
| `mode` | ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian |
| `symmetric` | whole tone, diminished (half-whole), diminished (whole-half), augmented |
| `pentatonic` | major pentatonic, minor pentatonic |
| `blues` | blues |
| `synthetic` | phrygian dominant, double harmonic, hungarian minor, lydian dominant, altered |

### `createScaleRegistry` — free function

```ts
createScaleRegistry(patterns: ReadonlyArray<ScalePattern>): ScaleRegistry
```

Build a custom registry from scratch.

---

## Chords

### `chordFactory` — `ChordFactory`

| Method | Signature | Description |
|--------|-----------|-------------|
| `triad` | `(root: Pitch, quality: TriadKind) → Chord` | Build root-position triad. |
| `seventh` | `(root: Pitch, quality: SeventhKind) → Chord` | Build root-position seventh chord. |
| `build` | `(options: ChordBuildOptions) → Chord` | Full control: quality, alterations, omitFifth. |
| `invert` | `(chord, position: "first"\|"second"\|"third") → Chord` | Rotate bass to target chord tone. Throws `RangeError` if chord too small. |
| `slash` | `(chord, bassNote: Pitch) → Chord` | Explicit bass override (C/E). Bass need not be a chord tone. |
| `fromName` | `(name: string, root: Pitch) → Chord` | Build from short name (see table below). Throws `RangeError` if unknown. |

**Triad qualities:** `"major" "minor" "diminished" "augmented" "sus2" "sus4"`

**Seventh qualities:** `"major7" "dominant7" "minor7" "half-diminished7" "diminished7" "minor-major7" "augmented-major7"`

**`fromName` short names (56 entries):**

| Name | Quality | Name | Quality |
|------|---------|------|---------|
| `"7"` | dominant7 | `"min7"` | minor7 |
| `"maj7"` | major7 | `"dim"` | diminished |
| `"aug"` | augmented | `"min"` | minor |
| `"9"` | dominant9 | `"maj9"` | major9 |
| `"min9"` | minor9 | `"11"` | dominant11 |
| `"maj11"` | major11 | `"min11"` | minor11 |
| `"13"` | dominant13 | `"maj13"` | major13 |
| `"min13"` | minor13 | `"dim7"` | half-diminished7 |
| `"dimb7"` | diminished7 | `"augmaj7"` | augmented-major7 |
| `"minmaj7"` | minor-major7 | `"sus4"` | sus4 |
| `"sus2"` | sus2 | `"7sus4"` | dominant7sus4 |
| `"7sus2"` | dominant7sus2 | `"maj7sus4"` | major7sus4 |
| `"maj7sus2"` | major7sus2 | `"maj9sus4"` | major9sus4 |
| `"add9"` | add9 | `"add11"` | add11 |
| `"add13"` | add13 | `"minadd9"` | minor-add9 |
| `"minadd11"` | minor-add11 | `"minadd13"` | minor-add13 |
| `"augmaj9"` | augmented-major9 | `"augmaj11"` | augmented-major11 |
| `"minmaj9"` | minor-major9 | `"minmaj11"` | minor-major11 |
| `"minmaj13"` | minor-major13 | `"no3d"` | no-third |
| `"dim9"` | half-diminished9 | `"dim11"` | half-diminished11 |
| `"dimadd11"` | diminished-add11 | `"dimadd13"` | diminished-add13 |
| `"7b9"` | altered b9 | `"majs9"` | altered #9 |
| `"11s"` | altered #11 | `"11b9"` | altered b9 #11 |
| `"13b9"` | altered b9 13 | `"13b"` | altered b13 |
| `"majs911s"` | altered #9 #11 | `"maj911s"` | major9 #11 |
| `"maj1311s"` | major13 #11 | `"minb9"` | minor7 b9 |
| `"min1113b"` | minor11 b13 | `"dimb9"` | half-dim b9 |
| `"dim11b9"` | half-dim 11 b9 | `"dim13b9"` | half-dim 13 b9 |

**`Chord` shape:**
```ts
{
  root: Pitch;
  quality: ChordQuality;
  pitches: ReadonlyArray<Pitch>;          // ascending from bass
  inversion: InversionPosition;
  bassNote?: Pitch;                        // slash chord override
  intervalStructure: ReadonlyArray<Interval>;
}
```

---

### `harmonizer` — `Harmonizer`

Stack thirds on every scale degree. Results are memoized per `(Scale instance, extension)` pair — repeated calls with the same scale reference return the identical cached array. `degreeChord` shares that cache.

| Method | Signature | Description |
|--------|-----------|-------------|
| `harmonize` | `(scale: Scale, extension?: HarmonizationExtension) → ReadonlyArray<HarmonizedDegree>` | All diatonic chords. Memoized. Default extension: `"triad"`. |
| `degreeChord` | `(scale: Scale, degree: number, extension?) → Chord` | Single degree chord (uses `harmonize` cache). Throws `RangeError` if degree out of range. |

**`HarmonizationExtension`:** `"triad" "seventh" "ninth" "eleventh" "thirteenth"`

**`HarmonizedDegree` shape:** `{ scaleDegree: number; romanNumeral: string; chord: Chord }`

---

### `inversionAnalyzer` — `InversionAnalyzer`

| Method | Signature | Description |
|--------|-----------|-------------|
| `analyze` | `(chord) → InversionPosition \| undefined` | Detect bass position. `undefined` = non-chord-tone bass. |
| `bassIndex` | `(chord) → number` | 0-based index of bass pitch in `chord.pitches`. |
| `isRootPosition` | `(chord) → boolean` | True if root is in the bass. |

**`InversionPosition`:** `"root" "first" "second" "third"`

---

### `voicingGenerator` — `VoicingGenerator`

| Method | Signature | Description |
|--------|-----------|-------------|
| `close` | `(chord) → VoicedChord` | All pitches within one octave above bass. |
| `drop2` | `(chord) → VoicedChord` | Second voice from top drops one octave. Throws if < 4 pitches. |
| `drop3` | `(chord) → VoicedChord` | Third voice from top drops one octave. Throws if < 4 pitches. |
| `open` | `(chord) → VoicedChord` | Alternating voices raised by octave. |

**`VoicedChord` shape:** `{ source: Chord; style: VoicingStyle; pitches: ReadonlyArray<Pitch> }`

---

## Harmony

### `keyFactory` — `KeyFactory`

| Method | Signature | Description |
|--------|-----------|-------------|
| `build` | `(tonic: Pitch, modality: Modality) → Key` | Build from explicit tonic + modality. |
| `major` | `(signature: number) → Key` | By key signature (−7 to +7). 0 = C major. Throws if out of range. |
| `minor` | `(signature: number) → Key` | By key signature (−7 to +7). 0 = A minor. Throws if out of range. |
| `allMajor` | `ReadonlyArray<Key>` | All 15 major keys in circle order. |
| `allMinor` | `ReadonlyArray<Key>` | All 15 minor keys in circle order. |

**`Key` shape:**
```ts
{
  tonic: Pitch;
  modality: "major" | "minor";
  signature: number;           // + = sharps, − = flats
  naturalScale: Scale;
  relative: Key;               // same signature, opposite modality
  parallel: Key;               // same tonic, opposite modality
  enharmonicEquivalent: Key;   // F# ↔ Gb
  spellPitchClass(pc: number): SpelledNoteName;
}
```

---

### `circleOfFifths` — `CircleOfFifths`

| Method | Signature | Description |
|--------|-----------|-------------|
| `nodeFor` | `(key: Key) → CircleNode` | Lookup node for a key. Throws if not found. |
| `majorKeys` | `ReadonlyArray<CircleNode>` | 12 major nodes, C first, clockwise. |
| `minorKeys` | `ReadonlyArray<CircleNode>` | 12 minor nodes, A first, clockwise. |
| `pathBetween` | `(from: Key, to: Key) → ReadonlyArray<CircleNode>` | Shortest circle path, inclusive endpoints. Length = distance + 1. |
| `distance` | `(a: Key, b: Key) → number` | Fifth-distance 0–6. |

**`CircleNode` shape:**
```ts
{
  key: Key;
  dominantNeighbor: CircleNode;     // +1 sharp clockwise
  subdominantNeighbor: CircleNode;  // +1 flat counter-clockwise
  relativeKey: Key;
  fifthsFromC: number;              // −6 to +6
}
```

---

### `romanNumeralAnalyzer` — `RomanNumeralAnalyzer`

| Method | Signature | Description |
|--------|-----------|-------------|
| `parse` | `(notation: string) → RomanNumeralToken` | String → structured token. Supports: case, quality suffixes, secondary function (`V7/ii`), Neapolitan (`bII`). Throws `SyntaxError` if invalid. |
| `render` | `(token: RomanNumeralToken) → string` | Token → canonical string. |
| `analyze` | `(chord: Chord, key: Key) → RomanNumeralToken` | Chord + key → token. Throws if root not diatonic. |
| `realize` | `(token: RomanNumeralToken, key: Key) → Chord` | Token + key → concrete chord. |

**`RomanNumeralToken` shape:**
```ts
{
  degree: RomanDegree;            // "I"–"VII"
  isUpperCase: boolean;
  quality: string;                // ChordQuality.kind
  modifiers: RomanNumeralModifier[];
  secondaryOf?: RomanDegree;
}
```

---

### `secondaryDominantAnalyzer` — `SecondaryDominantAnalyzer`

| Method | Signature | Description |
|--------|-----------|-------------|
| `allIn` | `(key: Key) → ReadonlyArray<SecondaryDominant>` | All 5 secondary dominants: V7/ii, V7/iii, V7/IV, V7/V, V7/vi. |
| `of` | `(degree: RomanDegree, key: Key) → SecondaryDominant \| undefined` | Secondary dominant for a specific target degree. `undefined` for I or VII. |
| `identify` | `(chord: Chord, key: Key) → SecondaryDominant \| undefined` | Check if a chord functions as any secondary dominant in the key. |

**`SecondaryDominant` shape:** `{ chord: Chord; tonicizes: RomanDegree; resolvesTo: Chord; label: string }`

---

### `tritoneSubstitution` — `TritoneSubstitution`

| Method | Signature | Description |
|--------|-----------|-------------|
| `substitute` | `(chord: Chord) → Chord` | Return tritone sub (root + 6 semitones). Throws `TypeError` if not dominant7. |
| `forKey` | `(key: Key) → TritoneSubPair` | Sub pair for the primary dominant (V7) of the key. |
| `isTritoneSub` | `(chord: Chord, key: Key) → boolean` | True if chord is the tritone sub of V7 in the key. |

**`TritoneSubPair` shape:** `{ original: Chord; substitute: Chord; sharedGuideTones: [Pitch, Pitch] }`

---

### `modulationFinder` — `ModulationFinder`

| Method | Signature | Description |
|--------|-----------|-------------|
| `findPath` | `(from: Key, to: Key) → ModulationPath` | Lowest-cost single path. Prefers pivot-chord over direct. |
| `findAllPaths` | `(from: Key, to: Key, maxSteps?: number) → ReadonlyArray<ModulationPath>` | All paths up to maxSteps (default 3), sorted by cost ascending. |
| `pivotChords` | `(from: Key, to: Key) → ReadonlyArray<Chord>` | Chords diatonic in both keys (same root PC + same quality). |

**`ModulationPath` shape:** `{ from: Key; to: Key; steps: ReadonlyArray<ModulationStep>; cost: number }`

**`ModulationStep` shape:** `{ targetKey: Key; mechanism: ModulationMechanism; pivotChord?: Chord; description: string }`

**`ModulationMechanism`:** `"pivot-chord" "direct" "secondary-dominant" "chromatic-mediant" "enharmonic" "common-tone"`

---

## Analysis

### `chordAnalyzer` — `ChordAnalyzer`

| Method | Signature | Description |
|--------|-----------|-------------|
| `analyze` | `(pitches: ReadonlyArray<Pitch>) → ReadonlyArray<ChordInterpretation>` | All plausible interpretations, ranked by confidence desc. Empty array for empty input. |
| `bestFit` | `(pitches: ReadonlyArray<Pitch>) → ChordInterpretation \| undefined` | Top-ranked interpretation only. |

**`ChordInterpretation` shape:**
```ts
{ chord: Chord; confidence: number; rationale: string }
// confidence: 1.0 = complete unambiguous chord; < 1.0 = partial/ambiguous
```

Identifies inversion: `{E4, G4, C5}` → C major, `chord.inversion === "first"`.

---

### `keyDetector` — `KeyDetector`

Probabilistic key detection using Krumhansl-Schmuckler profiles (Pearson correlation).

| Method | Signature | Description |
|--------|-----------|-------------|
| `detect` | `(pitches: ReadonlyArray<Pitch>) → ReadonlyArray<KeyDetectionResult>` | All 24 keys ranked by confidence desc. Empty array for empty input. |
| `bestGuess` | `(pitches: ReadonlyArray<Pitch>) → KeyDetectionResult \| undefined` | Top-ranked key only. |

**`KeyDetectionResult` shape:** `{ key: Key; confidence: number }` — confidence in [0, 1].

---

### `functionalAnalyzer` — `FunctionalAnalyzer`

Classical tonal function analysis.

| Method | Signature | Description |
|--------|-----------|-------------|
| `analyze` | `(chord: Chord, key: Key) → FunctionalAnalysis` | Determine tonal function within key. |

**`FunctionalAnalysis` shape:**
```ts
{
  chord: Chord;
  key: Key;
  function: "tonic" | "predominant" | "dominant" | "ambiguous";
  role?: string;       // "tonic-substitute" | "subdominant" | "supertonic" | "leading-tone"
  isBorrowed: boolean; // true = borrowed from parallel key (modal mixture)
}
```

**Diatonic assignments (major key):**

| Degree | Function | Role |
|--------|----------|------|
| I | tonic | — |
| ii | predominant | supertonic |
| iii | tonic | tonic-substitute |
| IV | predominant | subdominant |
| V | dominant | — |
| vi | tonic | tonic-substitute |
| vii° | dominant | leading-tone |

---

## Type reference

### Key types

| Type | Description |
|------|-------------|
| `Pitch` | Immutable pitch: midi, spelling, frequency, pitchClass, octave |
| `SpelledNoteName` | `{ letter: NoteLetter; accidental: Accidental }` |
| `Interval` | `{ number, quality, semitones, isCompound }` |
| `ValidInterval` | Compile-time validated interval (perfect numbers ↔ perfect quality) |
| `Scale` | Abstract: root, pattern, pitches + degree/transpose/mode/contains |
| `ScalePattern` | Recipe: `{ name, category, intervals: SemitonePattern, modes? }` |
| `Chord` | root, quality, pitches, inversion, bassNote?, intervalStructure |
| `ChordQuality` | Discriminated union on `kind` (56 variants including `altered`) |
| `Key` | tonic, modality, signature, naturalScale, relative, parallel, enharmonicEquivalent |
| `CircleNode` | key, dominantNeighbor, subdominantNeighbor, relativeKey, fifthsFromC |
| `RomanNumeralToken` | degree, isUpperCase, quality, modifiers, secondaryOf? |
| `SecondaryDominant` | chord, tonicizes, resolvesTo, label |
| `TritoneSubPair` | original, substitute, sharedGuideTones |
| `ModulationPath` | from, to, steps, cost |
| `FunctionalAnalysis` | chord, key, function, role?, isBorrowed |
| `ChordInterpretation` | chord, confidence, rationale |
| `KeyDetectionResult` | key, confidence |

### Literal / union types

| Type | Values |
|------|--------|
| `Modality` | `"major" \| "minor"` |
| `ScaleCategory` | `"diatonic" "mode" "symmetric" "harmonic" "melodic" "pentatonic" "blues" "synthetic"` |
| `HarmonizationExtension` | `"triad" "seventh" "ninth" "eleventh" "thirteenth"` |
| `InversionPosition` | `"root" "first" "second" "third"` |
| `VoicingStyle` | `"close" "drop2" "drop3" "open"` |
| `IntervalNumber` | `1 \| 2 \| … \| 13` |
| `IntervalQuality` | `"doubly-diminished" "diminished" "minor" "perfect" "major" "augmented" "doubly-augmented"` |
| `TonalFunction` | `"tonic" "predominant" "dominant" "ambiguous"` |
| `RomanDegree` | `"I" "II" "III" "IV" "V" "VI" "VII"` |
| `ModulationMechanism` | `"pivot-chord" "direct" "secondary-dominant" "chromatic-mediant" "enharmonic" "common-tone"` |

---

---

# `@orpheus/fretboard`

**Source:** `packages/fretboard/src/`

All exports available from `"@orpheus/fretboard"`.

---

## Tunings

### Standard tuning constants

| Export | Open strings (low→high) |
|---|---|
| `STANDARD_TUNING` | E A D G B e |
| `DROP_D` | D A D G B e |
| `OPEN_G` | D G D G B D |
| `OPEN_E` | E B E G# B E |
| `DADGAD` | D A D G A D |
| `HALF_STEP_DOWN` | Eb Ab Db Gb Bb eb |
| `WHOLE_STEP_DOWN` | D G C F A d |

### `tuningFactory`

| Method | Signature | Description |
|---|---|---|
| `fromMidiArray` | `(name, midis[]) → Tuning` | `midis[0]` = lowest string. String numbers assigned high-to-low. |
| `fromSpellings` | `(name, spellings[], octaves[]) → Tuning` | Build from `SpelledNoteName` + octave per string. |

### `tuningRegistry`

| Method | Signature | Description |
|---|---|---|
| `register` | `(tuning) → void` | Register a named tuning. |
| `get` | `(name) → Tuning \| undefined` | Case-insensitive lookup. |
| `all` | `() → Tuning[]` | All registered tunings. |

---

## `fretboardFactory`

```typescript
fretboardFactory.build(tuning: Tuning, fretCount = 24): Fretboard
```

### `Fretboard` methods

| Method | Signature | Description |
|---|---|---|
| `pitchAt` | `(string, fret) → Pitch` | O(1) — `pitchArithmetic.transpose(openPitch, fret)`. |
| `positionsForString` | `(n) → FretPosition[]` | All frets 0…fretCount on string `n`. |
| `positionsForPitch` | `(pitch) → FretPosition[]` | All positions with same MIDI number. |
| `positionsForPitchClass` | `(pc) → FretPosition[]` | All positions with same pitch class. |
| `positionsInRange` | `(from, to) → FretPosition[]` | All positions in fret window. |
| `stringCount` | `number` | — |

---

## `scaleMapFactory`

```typescript
scaleMapFactory.build(scale: Scale, fretboard: Fretboard): ScaleMap
```

### `ScaleMap` methods

| Method | Signature | Description |
|---|---|---|
| `positions` | `FretPosition[]` | All fretboard positions in scale (uses `scale.contains()` — O(1) per position). |
| `positionsForString` | `(n) → FretPosition[]` | Scale positions on one string. |
| `positionsInFretRange` | `(from, to) → FretPosition[]` | Scale positions in fret window. |
| `positionsForDegree` | `(n) → FretPosition[]` | Positions matching pitch class of scale degree `n` (1-based). |
| `scalePositions` | `(fretSpan = 4) → ScalePosition[]` | Sliding 4-fret boxes; each tagged with CAGED shape when detectable. |

---

## `shapeFinder`

| Method | Signature | Description |
|---|---|---|
| `find` | `(chord, fretboard, constraints?) → ChordVoicing[]` | All valid voicings sorted by ergonomic score ascending. |
| `findWithFingering` | `(chord, fretboard, constraints?) → Fingering[]` | Same, with finger assignments. Voicings requiring > 4 fingers are skipped. |

**Ergonomic score factors:** fret span × 10 · string skips × 8 · barre +15 · open string −8 · root-not-in-bass +12.

---

## `fingeringAnalyzer`

```typescript
fingeringAnalyzer.assign(voicing: ChordVoicing): Fingering
```

Assigns finger 0 to open strings, detects barres (≥2 notes at same fret on contiguous strings → finger 1), then assigns fingers 2→4 greedily. Throws `RangeError` if > 4 simultaneous fingers required.

---

## `handOptimizer`

| Method | Signature | Description |
|---|---|---|
| `best` | `(chord, fretboard, constraints?) → Fingering` | Lowest-difficulty fingering. |
| `optimalPath` | `(chords[], fretboard, constraints?) → Fingering[]` | One fingering per chord; greedy nearest-neighbor minimizes `|prevMinFret − nextMinFret|`. |

---

## `cagedSystem`

| Method | Signature | Description |
|---|---|---|
| `shapeOf` | `(voicing, root) → CAGEDShape \| null` | Match voicing intervals against C/A/G/E/D templates. |
| `shapesForKey` | `(key, fretboard) → CAGEDPosition[]` | 5 CAGED positions with scale notes for a key. |
| `nextShape` | `(shape) → CAGEDShape` | Next shape up the neck (C→A→G→E→D→C). |
| `prevShape` | `(shape) → CAGEDShape` | Previous shape. |

---

## `positionAnalyzer`

| Method | Signature | Description |
|---|---|---|
| `identifyChord` | `(positions[]) → Chord \| null` | Extracts pitches → `chordAnalyzer.bestFit()`. |
| `identifyScale` | `(positions[], hint?: Key) → Scale \| null` | Matches pitch-class set against `defaultScaleRegistry`. Requires ≥ 60% coverage. |

---

## Fretboard type reference

| Type | Description |
|---|---|
| `GuitarString` | `{ number: number; openPitch: Pitch }` |
| `Tuning` | `{ name: string; strings: GuitarString[] }` (ordered high→low) |
| `FretPosition` | `{ string, fret, pitch }` |
| `ChordVoicing` | `{ slots: (FretPosition \| null)[]; barre?: BarreSegment }` |
| `ScalePosition` | `{ positions, fretRange, cagedShape? }` |
| `Fingering` | `{ voicing, assignments, difficulty }` |
| `FingerAssignment` | `{ position, finger: Finger, isBarre }` |
| `BarreSegment` | `{ fret, fromString, toString, finger: 1 }` |
| `FretboardConstraints` | `{ maxFretSpan?, allowOpenStrings?, requireRootInBass?, minStrings?, maxStrings?, fromFret?, toFret? }` |
| `CAGEDShape` | `"C" \| "A" \| "G" \| "E" \| "D"` |
| `CAGEDPosition` | `{ shape, rootFret, positions }` |
| `Finger` | `0 \| 1 \| 2 \| 3 \| 4` |
