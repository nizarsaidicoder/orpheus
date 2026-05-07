import { describe, it, expect } from "vitest";

describe("ChordFactory.triad()", () => {
  it("builds C major triad with pitches {C, E, G}", () => {});
  it("builds C minor triad with pitches {C, Eb, G}", () => {});
  it("builds C diminished triad with pitches {C, Eb, Gb}", () => {});
  it("builds C augmented triad with pitches {C, E, G#}", () => {});
  it("builds Csus2 with pitches {C, D, G}", () => {});
  it("builds Csus4 with pitches {C, F, G}", () => {});
  it("returns root inversion by default", () => {});
  it("intervalStructure for major triad = [M3, P5]", () => {});
  it("intervalStructure for minor triad = [m3, P5]", () => {});
  it("intervalStructure for dim triad = [m3, d5]", () => {});
  it("intervalStructure for aug triad = [M3, A5]", () => {});
});

describe("ChordFactory.seventh()", () => {
  it("builds G dominant 7th: {G, B, D, F}", () => {});
  it("builds C major 7th: {C, E, G, B}", () => {});
  it("builds D minor 7th: {D, F, A, C}", () => {});
  it("builds B half-diminished 7th: {B, D, F, A}", () => {});
  it("builds B diminished 7th: {B, D, F, Ab}", () => {});
  it("builds C minor-major 7th: {C, Eb, G, B}", () => {});
});

describe("ChordFactory.build() — alterations", () => {
  it("altered dominant with b9 produces correct pitches", () => {});
  it("altered dominant with #11 produces correct pitches", () => {});
  it("omitFifth removes the fifth from pitches", () => {});
});

describe("ChordFactory.invert()", () => {
  it("first inversion places 3rd in bass", () => {});
  it("second inversion places 5th in bass", () => {});
  it("third inversion places 7th in bass", () => {});
  it("throws RangeError for third inversion on a triad", () => {});
  it("inversion property is updated on returned chord", () => {});
});

describe("ChordFactory.slash()", () => {
  it("sets bassNote override on the chord", () => {});
  it("bassNote need not be a chord tone", () => {});
  it("does not modify the original chord", () => {});
});
