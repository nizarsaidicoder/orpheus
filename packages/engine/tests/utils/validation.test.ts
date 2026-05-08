import { describe, it, expect } from "vitest";
import { isMidiNumber, isPitchClass, isFrequencyHz, assertMidi, assertScaleDegree } from "../../src/utils/validation.ts";

describe("isMidiNumber()", () => {
  it("0 → true (minimum)", () => { expect(isMidiNumber(0)).toBe(true); });
  it("60 → true (middle C)", () => { expect(isMidiNumber(60)).toBe(true); });
  it("127 → true (maximum)", () => { expect(isMidiNumber(127)).toBe(true); });
  it("-1 → false", () => { expect(isMidiNumber(-1)).toBe(false); });
  it("128 → false", () => { expect(isMidiNumber(128)).toBe(false); });
  it("60.5 → false (non-integer)", () => { expect(isMidiNumber(60.5)).toBe(false); });
  it("'60' → false (string)", () => { expect(isMidiNumber("60")).toBe(false); });
  it("null → false", () => { expect(isMidiNumber(null)).toBe(false); });
});

describe("isPitchClass()", () => {
  it("0 → true", () => { expect(isPitchClass(0)).toBe(true); });
  it("11 → true", () => { expect(isPitchClass(11)).toBe(true); });
  it("12 → false", () => { expect(isPitchClass(12)).toBe(false); });
  it("-1 → false", () => { expect(isPitchClass(-1)).toBe(false); });
  it("6.5 → false (non-integer)", () => { expect(isPitchClass(6.5)).toBe(false); });
  it("'0' → false", () => { expect(isPitchClass("0")).toBe(false); });
});

describe("isFrequencyHz()", () => {
  it("440 → true", () => { expect(isFrequencyHz(440)).toBe(true); });
  it("0.1 → true", () => { expect(isFrequencyHz(0.1)).toBe(true); });
  it("0 → false (must be positive)", () => { expect(isFrequencyHz(0)).toBe(false); });
  it("-1 → false", () => { expect(isFrequencyHz(-1)).toBe(false); });
  it("Infinity → false", () => { expect(isFrequencyHz(Infinity)).toBe(false); });
  it("NaN → false", () => { expect(isFrequencyHz(NaN)).toBe(false); });
  it("'440' → false", () => { expect(isFrequencyHz("440")).toBe(false); });
});

describe("assertMidi()", () => {
  it("valid MIDI 60 does not throw", () => {
    expect(() => assertMidi(60)).not.toThrow();
  });

  it("throws RangeError for -1", () => {
    expect(() => assertMidi(-1)).toThrow(RangeError);
  });

  it("throws RangeError for 128", () => {
    expect(() => assertMidi(128)).toThrow(RangeError);
  });

  it("error message mentions valid range", () => {
    expect(() => assertMidi(200)).toThrow(/\[0, 127\]/);
  });
});

describe("assertScaleDegree()", () => {
  it("degree 1, max 7 does not throw", () => {
    expect(() => assertScaleDegree(1, 7)).not.toThrow();
  });

  it("degree 7, max 7 does not throw", () => {
    expect(() => assertScaleDegree(7, 7)).not.toThrow();
  });

  it("throws RangeError for degree 0", () => {
    expect(() => assertScaleDegree(0, 7)).toThrow(RangeError);
  });

  it("throws RangeError for negative degree", () => {
    expect(() => assertScaleDegree(-1, 7)).toThrow(RangeError);
  });

  it("throws RangeError for non-integer", () => {
    expect(() => assertScaleDegree(1.5, 7)).toThrow(RangeError);
  });
});
