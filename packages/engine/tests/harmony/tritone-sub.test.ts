import { describe, it, expect } from "vitest";
import { tritoneSubstitution } from "../../src/harmony/tritone-sub.ts";
import { keyFactory } from "../../src/harmony/key.ts";
import { chordFactory } from "../../src/chords/chord-factory.ts";
import { pitchFactory } from "../../src/primitives/pitch.ts";

const CMajor = keyFactory.major(0);

const G4 = pitchFactory.fromMidi(67);
const C4 = pitchFactory.fromMidi(60);

const g7 = chordFactory.seventh(G4, "dominant7"); // G B D F
const c7 = chordFactory.seventh(C4, "dominant7"); // C E G Bb

describe("TritoneSubstitution.substitute()", () => {
  it("G7 → Db7 (tritone above G is Db)", () => {
    const sub = tritoneSubstitution.substitute(g7);
    expect(sub.quality.kind).toBe("dominant7");
    expect(sub.root.pitchClass).toBe(1); // Db/C# = PC 1
  });

  it("C7 → F#7 / Gb7", () => {
    const sub = tritoneSubstitution.substitute(c7);
    expect(sub.quality.kind).toBe("dominant7");
    expect(sub.root.pitchClass).toBe(6); // F#/Gb = PC 6
  });

  it("substitute root is exactly 6 semitones above original root", () => {
    const sub = tritoneSubstitution.substitute(g7);
    expect(sub.root.midi).toBe(g7.root.midi + 6);
  });

  it("throws TypeError if input is not a dominant 7th chord", () => {
    const cMaj = chordFactory.triad(C4, "major");
    expect(() => tritoneSubstitution.substitute(cMaj)).toThrow(TypeError);
  });
});

describe("TritoneSubstitution.forKey()", () => {
  it("C major → { original: G7, substitute: Db7 }", () => {
    const pair = tritoneSubstitution.forKey(CMajor);
    expect(pair.original.root.pitchClass).toBe(7);   // G
    expect(pair.original.quality.kind).toBe("dominant7");
    expect(pair.substitute.root.pitchClass).toBe(1); // Db = PC 1
    expect(pair.substitute.quality.kind).toBe("dominant7");
  });

  it("guide tones: 3rd of G7 (B) = 7th of Db7 (Cb = B)", () => {
    const pair = tritoneSubstitution.forKey(CMajor);
    // guideTone1 = 3rd of original (major 3rd = 4 semitones above G4=67) = B4 = 71
    expect(pair.sharedGuideTones[0].pitchClass).toBe(11); // B
  });

  it("guide tones: 7th of G7 (F) = 3rd of Db7 (F = E#)", () => {
    const pair = tritoneSubstitution.forKey(CMajor);
    // guideTone2 = 7th of original (minor 7th = 10 semitones above G4=67) = F5 = 77
    expect(pair.sharedGuideTones[1].pitchClass).toBe(5); // F
  });
});

describe("TritoneSubstitution.isTritoneSub()", () => {
  it("Db7 is tritone sub of V7 in C major → true", () => {
    const db4 = pitchFactory.fromMidi(73); // Db5/C#5 = PC 1
    const db7 = chordFactory.seventh(db4, "dominant7");
    expect(tritoneSubstitution.isTritoneSub(db7, CMajor)).toBe(true);
  });

  it("G7 is NOT tritone sub of V7 in C major (it IS the V7) → false", () => {
    expect(tritoneSubstitution.isTritoneSub(g7, CMajor)).toBe(false);
  });

  it("F7 in C major → false", () => {
    const F4 = pitchFactory.fromMidi(65);
    const f7 = chordFactory.seventh(F4, "dominant7");
    expect(tritoneSubstitution.isTritoneSub(f7, CMajor)).toBe(false);
  });
});
