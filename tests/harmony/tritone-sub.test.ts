import { describe, it, expect } from "vitest";

describe("TritoneSubstitution.substitute()", () => {
  it("G7 → Db7 (tritone above G is Db)", () => {});
  it("C7 → F#7 / Gb7", () => {});
  it("substitute root is exactly 6 semitones above original root", () => {});
  it("throws TypeError if input is not a dominant 7th chord", () => {});
});

describe("TritoneSubstitution.forKey()", () => {
  it("C major → { original: G7, substitute: Db7 }", () => {});
  it("guide tones: 3rd of G7 (B) = 7th of Db7 (Cb = B)", () => {});
  it("guide tones: 7th of G7 (F) = 3rd of Db7 (F = E#)", () => {});
});

describe("TritoneSubstitution.isTritoneSub()", () => {
  it("Db7 is tritone sub of V7 in C major → true", () => {});
  it("G7 is NOT tritone sub of V7 in C major (it IS the V7) → false", () => {});
  it("F7 in C major → false", () => {});
});
