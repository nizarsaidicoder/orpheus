import { describe, it, expect } from "vitest";
import { voicingGenerator } from "../../src/chords/voicing.js";
import { chordFactory } from "../../src/chords/chord-factory.js";
import { pitchFactory } from "../../src/primitives/pitch.js";

const C4 = pitchFactory.fromMidi(60);

const cMaj7  = chordFactory.seventh(C4, "major7");   // [C4(60), E4(64), G4(67), B4(71)]
const cMajor = chordFactory.triad(C4, "major");       // [C4(60), E4(64), G4(67)]

describe("VoicingGenerator.close()", () => {
  it("returns same pitches as chord", () => {
    const v = voicingGenerator.close(cMaj7);
    expect(v.pitches.map(p => p.midi)).toEqual([60, 64, 67, 71]);
  });

  it("style is 'close'", () => {
    expect(voicingGenerator.close(cMaj7).style).toBe("close");
  });

  it("source references original chord", () => {
    expect(voicingGenerator.close(cMaj7).source).toBe(cMaj7);
  });
});

describe("VoicingGenerator.drop2()", () => {
  it("Cmaj7 drop2: [G3, C4, E4, B4]", () => {
    // Close: [60, 64, 67, 71] → drop 2nd from top (G4=67) → G3=55
    // Result: [55, 60, 64, 71]
    const v = voicingGenerator.drop2(cMaj7);
    expect(v.pitches.map(p => p.midi)).toEqual([55, 60, 64, 71]);
  });

  it("style is 'drop2'", () => {
    expect(voicingGenerator.drop2(cMaj7).style).toBe("drop2");
  });

  it("throws RangeError for triad (< 4 voices)", () => {
    expect(() => voicingGenerator.drop2(cMajor)).toThrow(RangeError);
  });

  it("result has same number of pitches as source", () => {
    expect(voicingGenerator.drop2(cMaj7).pitches).toHaveLength(4);
  });

  it("pitches are in ascending order", () => {
    const v = voicingGenerator.drop2(cMaj7);
    for (let i = 1; i < v.pitches.length; i++) {
      expect(v.pitches[i]!.midi).toBeGreaterThan(v.pitches[i - 1]!.midi);
    }
  });
});

describe("VoicingGenerator.drop3()", () => {
  it("Cmaj7 drop3: [E3, C4, G4, B4]", () => {
    // Close: [60, 64, 67, 71] → drop 3rd from top (E4=64) → E3=52
    // Result: [52, 60, 67, 71]
    const v = voicingGenerator.drop3(cMaj7);
    expect(v.pitches.map(p => p.midi)).toEqual([52, 60, 67, 71]);
  });

  it("style is 'drop3'", () => {
    expect(voicingGenerator.drop3(cMaj7).style).toBe("drop3");
  });

  it("throws RangeError for triad (< 4 voices)", () => {
    expect(() => voicingGenerator.drop3(cMajor)).toThrow(RangeError);
  });

  it("pitches are in ascending order", () => {
    const v = voicingGenerator.drop3(cMaj7);
    for (let i = 1; i < v.pitches.length; i++) {
      expect(v.pitches[i]!.midi).toBeGreaterThan(v.pitches[i - 1]!.midi);
    }
  });
});

describe("VoicingGenerator.open()", () => {
  it("Cmaj7 open: raises E4→E5 and B4→B5, sorted [C4, G4, E5, B5]", () => {
    // indices 0,1,2,3 → raise odd (1,3): E4→76, B4→83; keep C4(60), G4(67)
    // sorted: [60, 67, 76, 83]
    const v = voicingGenerator.open(cMaj7);
    expect(v.pitches.map(p => p.midi)).toEqual([60, 67, 76, 83]);
  });

  it("style is 'open'", () => {
    expect(voicingGenerator.open(cMaj7).style).toBe("open");
  });

  it("spans more than one octave", () => {
    const v = voicingGenerator.open(cMaj7);
    const span = v.pitches[v.pitches.length - 1]!.midi - v.pitches[0]!.midi;
    expect(span).toBeGreaterThan(12);
  });

  it("works on triads too", () => {
    // [60, 64, 67] → raise index 1 (E4→E5=76); keep 60, 67
    // sorted: [60, 67, 76]
    const v = voicingGenerator.open(cMajor);
    expect(v.pitches.map(p => p.midi)).toEqual([60, 67, 76]);
  });
});
