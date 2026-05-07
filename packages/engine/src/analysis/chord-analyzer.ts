import type { Pitch } from "../primitives/pitch.ts";
import type { Chord } from "../chords/chord.ts";
import type { ChordQuality } from "../chords/chord.ts";
import { chordFactory } from "../chords/chord-factory.ts";
import { pitchFactory } from "../primitives/pitch.ts";

// ---------------------------------------------------------------------------
// Chord templates — interval sets from root (root excluded)
// ---------------------------------------------------------------------------

type TriadQuality   = Parameters<typeof chordFactory.triad>[1];
type SeventhQuality = Parameters<typeof chordFactory.seventh>[1];

interface TriadTemplate {
  readonly kind:       "triad";
  readonly intervals:  ReadonlySet<number>;
  readonly quality:    TriadQuality;
  readonly qualityObj: ChordQuality;
}
interface SeventhTemplate {
  readonly kind:       "seventh";
  readonly intervals:  ReadonlySet<number>;
  readonly quality:    SeventhQuality;
  readonly qualityObj: ChordQuality;
}
type ChordTemplate = TriadTemplate | SeventhTemplate;

const TEMPLATES: ReadonlyArray<ChordTemplate> = [
  { kind: "triad",   intervals: new Set([4, 7]),      quality: "major",            qualityObj: { kind: "major" } },
  { kind: "triad",   intervals: new Set([3, 7]),      quality: "minor",            qualityObj: { kind: "minor" } },
  { kind: "triad",   intervals: new Set([3, 6]),      quality: "diminished",       qualityObj: { kind: "diminished" } },
  { kind: "triad",   intervals: new Set([4, 8]),      quality: "augmented",        qualityObj: { kind: "augmented" } },
  { kind: "seventh", intervals: new Set([4, 7, 11]),  quality: "major7",           qualityObj: { kind: "major7" } },
  { kind: "seventh", intervals: new Set([4, 7, 10]),  quality: "dominant7",        qualityObj: { kind: "dominant7" } },
  { kind: "seventh", intervals: new Set([3, 7, 10]),  quality: "minor7",           qualityObj: { kind: "minor7" } },
  { kind: "seventh", intervals: new Set([3, 6, 10]),  quality: "half-diminished7", qualityObj: { kind: "half-diminished7" } },
  { kind: "seventh", intervals: new Set([3, 6, 9]),   quality: "diminished7",      qualityObj: { kind: "diminished7" } },
  { kind: "seventh", intervals: new Set([3, 7, 11]),  quality: "minor-major7",     qualityObj: { kind: "minor-major7" } },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUniqueInputPCs(pitches: ReadonlyArray<Pitch>): Set<number> {
  return new Set(pitches.map(p => p.pitchClass));
}

function scoreCandidate(inputPCs: Set<number>, rootPC: number, template: ChordTemplate): number {
  const rootPresent = inputPCs.has(rootPC) ? 1 : 0;
  let matched = 0;
  for (const iv of template.intervals) {
    if (inputPCs.has((rootPC + iv) % 12)) matched++;
  }
  const totalMatched = rootPresent + matched;
  const templateSize = 1 + template.intervals.size;
  return totalMatched / Math.max(templateSize, inputPCs.size);
}

function getRootPitch(rootPC: number, sorted: ReadonlyArray<Pitch>): Pitch {
  const found = sorted.find(p => p.pitchClass === rootPC);
  if (found !== undefined) return found;
  // Create root below the bass pitch
  const bass = sorted[0]!;
  const offset = ((rootPC - bass.pitchClass) + 12) % 12;
  const rootMidi = offset > 0 ? bass.midi + offset - 12 : bass.midi;
  return pitchFactory.fromMidi(Math.max(0, Math.min(127, rootMidi)));
}

function getInversionPos(rootPC: number, template: ChordTemplate, bassPC: number): "first" | "second" | "third" | "root" {
  if (bassPC === rootPC) return "root";
  const sortedIvs = [...template.intervals].sort((a, b) => a - b);
  for (let i = 0; i < sortedIvs.length; i++) {
    if ((rootPC + sortedIvs[i]!) % 12 === bassPC) {
      if (i === 0) return "first";
      if (i === 1) return "second";
      return "third";
    }
  }
  return "root";
}

const MIN_CONFIDENCE = 0.3;

// ---------------------------------------------------------------------------
// Concrete implementation
// ---------------------------------------------------------------------------

export const chordAnalyzer: ChordAnalyzer = {
  analyze(pitches: ReadonlyArray<Pitch>): ReadonlyArray<ChordInterpretation> {
    if (pitches.length === 0) return [];
    const sorted = [...pitches].sort((a, b) => a.midi - b.midi);
    const inputPCs = getUniqueInputPCs(sorted);
    const bassPC = sorted[0]!.pitchClass;
    const seen = new Set<string>();
    const results: ChordInterpretation[] = [];

    for (let rootPC = 0; rootPC < 12; rootPC++) {
      for (const template of TEMPLATES) {
        const score = scoreCandidate(inputPCs, rootPC, template);
        if (score < MIN_CONFIDENCE) continue;
        const key = `${rootPC}-${template.quality}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const rootPitch = getRootPitch(rootPC, sorted);
        let chord: Chord;
        if (template.kind === "triad") {
          chord = chordFactory.triad(rootPitch, template.quality);
        } else {
          chord = chordFactory.seventh(rootPitch, template.quality);
        }

        const invPos = getInversionPos(rootPC, template, bassPC);
        if ((invPos === "first" || invPos === "second") && chord.pitches.length > (invPos === "first" ? 1 : 2)) {
          chord = chordFactory.invert(chord, invPos);
        } else if (invPos === "third" && template.kind === "seventh" && chord.pitches.length > 3) {
          chord = chordFactory.invert(chord, "third");
        }

        const pct = Math.round(score * 100);
        const rationale = score >= 1.0
          ? `Complete ${template.quality} chord`
          : `Partial ${template.quality} chord (${pct}% match)`;

        results.push({ chord, confidence: score, rationale });
      }
    }

    results.sort((a, b) => b.confidence - a.confidence);
    return results;
  },

  bestFit(pitches: ReadonlyArray<Pitch>): ChordInterpretation | undefined {
    return chordAnalyzer.analyze(pitches)[0];
  },
};

/**
 * A confidence-ranked interpretation of an unordered pitch set as a chord.
 */
export interface ChordInterpretation {
  readonly chord: Chord;

  /**
   * Confidence score in [0.0, 1.0].
   * 1.0 = complete, unambiguous chord.
   * Lower values indicate incomplete or ambiguous pitch sets.
   */
  readonly confidence: number;

  /** Human-readable rationale for this interpretation. */
  readonly rationale: string;
}

/**
 * Identifies the most likely chord(s) from an arbitrary set of pitches.
 *
 * The analyzer:
 * 1. Enumerates all rotations of the pitch set (testing each as a potential root).
 * 2. Scores each candidate against known chord templates.
 * 3. Returns results ranked by confidence, highest first.
 *
 * Pure function — stateless and deterministic.
 */
export interface ChordAnalyzer {
  /**
   * Return all plausible chord interpretations for the given pitches, ranked by confidence.
   * The pitch set may be incomplete (e.g. missing the fifth).
   * Returns an empty array if no conventional chord matches any rotation.
   *
   * @example analyze([C4, E4, G4])       → [{ chord: C major, confidence: 1.0 }]
   * @example analyze([C4, E4])            → [{ chord: C major, confidence: 0.6 }, …]
   * @example analyze([C4, F#4, A4])       → [{ chord: D7, confidence: 0.7 }, …]
   */
  analyze(pitches: ReadonlyArray<Pitch>): ReadonlyArray<ChordInterpretation>;

  /**
   * Return only the top-ranked interpretation.
   * Returns undefined if no conventional chord fits the pitch set.
   */
  bestFit(pitches: ReadonlyArray<Pitch>): ChordInterpretation | undefined;
}
