import type { Interval } from "../primitives/interval.ts";
import type { Pitch } from "../primitives/pitch.ts";

// ---------------------------------------------------------------------------
// Chord quality — discriminated union on `kind`
// ---------------------------------------------------------------------------

/**
 * An individual alteration applied to an extended chord tone.
 * Expressed relative to the "natural" chord tone for that scale degree.
 *
 * @example { degree: 9, direction: "flat" }   → b9
 * @example { degree: 11, direction: "sharp" }  → #11 (enharmonic b5 in altered context)
 * @example { degree: 5, direction: "flat" }    → b5
 */
export interface ChordAlteration {
  readonly degree:    5 | 9 | 11 | 13;
  readonly direction: "flat" | "sharp";
}

/**
 * Chord quality as a discriminated union.
 * The `kind` field is the discriminant; use exhaustive `switch (quality.kind)` to handle all cases.
 *
 * The `altered` variant carries an array of ChordAlteration payloads,
 * which is only meaningful for that specific variant.
 */
export type ChordQuality =
  // --------------- Triads ---------------
  | { readonly kind: "major" }
  | { readonly kind: "minor" }
  | { readonly kind: "diminished" }
  | { readonly kind: "augmented" }
  | { readonly kind: "sus2" }
  | { readonly kind: "sus4" }
  // --------------- Seventh chords ---------------
  | { readonly kind: "major7" }
  | { readonly kind: "dominant7" }
  | { readonly kind: "minor7" }
  | { readonly kind: "half-diminished7" }       // m7b5, ø7
  | { readonly kind: "diminished7" }            // fully diminished, °7
  | { readonly kind: "minor-major7" }           // mM7
  | { readonly kind: "augmented-major7" }       // +M7
  // --------------- Ninth chords ---------------
  | { readonly kind: "dominant9" }
  | { readonly kind: "major9" }
  | { readonly kind: "minor9" }
  // --------------- Eleventh chords ---------------
  | { readonly kind: "dominant11" }
  | { readonly kind: "major11" }
  | { readonly kind: "minor11" }
  // --------------- Thirteenth chords ---------------
  | { readonly kind: "dominant13" }
  | { readonly kind: "major13" }
  | { readonly kind: "minor13" }
  // --------------- Add-tone chords (no 7th) ---------------
  | { readonly kind: "add9" }
  | { readonly kind: "add11" }
  | { readonly kind: "add13" }                   // = add6 (close voicing)
  | { readonly kind: "minor-add9" }
  | { readonly kind: "minor-add11" }
  | { readonly kind: "minor-add13" }             // = min6 (close voicing)
  // --------------- Suspended + 7th ---------------
  | { readonly kind: "dominant7sus4" }
  | { readonly kind: "dominant7sus2" }
  | { readonly kind: "major7sus4" }
  | { readonly kind: "major7sus2" }
  | { readonly kind: "major9sus4" }
  // --------------- No-third ---------------
  | { readonly kind: "no-third" }
  // --------------- Augmented extended ---------------
  | { readonly kind: "augmented-major9" }
  | { readonly kind: "augmented-major11" }
  // --------------- Minor-major extended ---------------
  | { readonly kind: "minor-major9" }
  | { readonly kind: "minor-major11" }
  | { readonly kind: "minor-major13" }
  // --------------- Half-diminished extended ---------------
  | { readonly kind: "half-diminished9" }
  | { readonly kind: "half-diminished11" }
  // --------------- Diminished add-tone ---------------
  | { readonly kind: "diminished-add11" }
  | { readonly kind: "diminished-add13" }        // = dim6 (close voicing)
  // --------------- Altered dominant ---------------
  | { readonly kind: "altered"; readonly alterations: ReadonlyArray<ChordAlteration> };

// ---------------------------------------------------------------------------
// Inversion
// ---------------------------------------------------------------------------

/**
 * Inversion position of a chord.
 * - root:   root in the bass (root position)
 * - first:  3rd in the bass
 * - second: 5th in the bass
 * - third:  7th in the bass (only valid for seventh chords and above)
 */
export type InversionPosition = "root" | "first" | "second" | "third";

// ---------------------------------------------------------------------------
// Core Chord value object
// ---------------------------------------------------------------------------

/**
 * An immutable chord: root + quality + close-position voicing.
 *
 * `pitches` is always in ascending order from the bass note.
 * Two Chord values are considered equal if all fields match structurally
 * (use deep equality; no reference semantics).
 */
export interface Chord {
  readonly root:              Pitch;
  readonly quality:           ChordQuality;
  /**
   * Pitches in ascending order from bass.
   * Close-position root position unless `inversion` or `bassNote` is set.
   */
  readonly pitches:           ReadonlyArray<Pitch>;
  readonly inversion:         InversionPosition;
  /**
   * Optional explicit bass note for slash chords (C/E, G/B, etc.).
   * When set, this pitch is the lowest-sounding tone regardless of inversion.
   */
  readonly bassNote?:         Pitch;
  /**
   * Interval stack from root to each chord tone (root excluded).
   * @example C major triad → [M3, P5]
   * @example G7 → [M3, P5, m7]
   */
  readonly intervalStructure: ReadonlyArray<Interval>;
}
