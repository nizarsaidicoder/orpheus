import { describe, it, expect } from "vitest";
import { scaleDegreeName, chromaticDegreeName } from "../../src/scales/degree-names.ts";

describe("scaleDegreeName()", () => {
    describe("functional style (default)", () => {
        it("degree 1 = tonic", () => expect(scaleDegreeName(0, 0, 0)).toBe("tonic"));
        it("degree 2 = supertonic", () => expect(scaleDegreeName(1, 2, 0)).toBe("supertonic"));
        it("degree 3 = mediant", () => expect(scaleDegreeName(2, 4, 2)).toBe("mediant"));
        it("degree 4 = subdominant", () => expect(scaleDegreeName(3, 5, 4)).toBe("subdominant"));
        it("degree 5 = dominant", () => expect(scaleDegreeName(4, 7, 5)).toBe("dominant"));
        it("degree 6 = submediant", () => expect(scaleDegreeName(5, 9, 7)).toBe("submediant"));
        it("degree 7 = leading-tone", () => expect(scaleDegreeName(6, 11, 9)).toBe("leading-tone"));
    });

    describe("technical style", () => {
        it("natural 7 (11 semitones) = leading-tone", () => {
            expect(scaleDegreeName(6, 11, 9, { style: "technical" })).toBe("leading-tone");
        });
        it("flat 7 (10 semitones) = subtonic", () => {
            expect(scaleDegreeName(6, 10, 8, { style: "technical" })).toBe("subtonic");
        });
    });

    describe("diatonic style", () => {
        it("returns ordinals", () => {
            expect(scaleDegreeName(0, 0, 0, { style: "diatonic" })).toBe("1st");
            expect(scaleDegreeName(1, 2, 0, { style: "diatonic" })).toBe("2nd");
            expect(scaleDegreeName(2, 4, 2, { style: "diatonic" })).toBe("3rd");
            expect(scaleDegreeName(3, 5, 4, { style: "diatonic" })).toBe("4th");
            expect(scaleDegreeName(4, 7, 5, { style: "diatonic" })).toBe("5th");
            expect(scaleDegreeName(5, 9, 7, { style: "diatonic" })).toBe("6th");
            expect(scaleDegreeName(6, 11, 9, { style: "diatonic" })).toBe("7th");
        });
    });

    describe("solfege style", () => {
        it("returns movable-do solfege", () => {
            expect(scaleDegreeName(0, 0, 0, { style: "solfege" })).toBe("do");
            expect(scaleDegreeName(1, 2, 0, { style: "solfege" })).toBe("re");
            expect(scaleDegreeName(2, 4, 2, { style: "solfege" })).toBe("mi");
            expect(scaleDegreeName(3, 5, 4, { style: "solfege" })).toBe("fa");
            expect(scaleDegreeName(4, 7, 5, { style: "solfege" })).toBe("sol");
            expect(scaleDegreeName(5, 9, 7, { style: "solfege" })).toBe("la");
            expect(scaleDegreeName(6, 11, 9, { style: "solfege" })).toBe("ti");
        });
    });

    describe("solfege-fixed style", () => {
        it("uses si instead of ti", () => {
            expect(scaleDegreeName(6, 11, 9, { style: "solfege-fixed" })).toBe("si");
            expect(scaleDegreeName(0, 0, 0, { style: "solfege-fixed" })).toBe("do");
        });
    });

    describe("indian style", () => {
        it("returns sargam names", () => {
            expect(scaleDegreeName(0, 0, 0, { style: "indian" })).toBe("Sa");
            expect(scaleDegreeName(1, 2, 0, { style: "indian" })).toBe("Re");
            expect(scaleDegreeName(2, 4, 2, { style: "indian" })).toBe("Ga");
            expect(scaleDegreeName(3, 5, 4, { style: "indian" })).toBe("Ma");
            expect(scaleDegreeName(4, 7, 5, { style: "indian" })).toBe("Pa");
            expect(scaleDegreeName(5, 9, 7, { style: "indian" })).toBe("Dha");
            expect(scaleDegreeName(6, 11, 9, { style: "indian" })).toBe("Ni");
        });
    });

    describe("german style", () => {
        it("returns German names", () => {
            expect(scaleDegreeName(0, 0, 0, { style: "german" })).toBe("Grundton");
            expect(scaleDegreeName(2, 4, 2, { style: "german" })).toBe("Terz");
            expect(scaleDegreeName(4, 7, 5, { style: "german" })).toBe("Quinte");
        });
    });

    describe("wrapping past octave", () => {
        it("index 7 wraps to tonic", () => {
            expect(scaleDegreeName(7, 12, 11)).toBe("tonic");
        });
        it("index 8 wraps to supertonic", () => {
            expect(scaleDegreeName(8, 14, 12)).toBe("supertonic");
        });
    });
});

describe("chromaticDegreeName()", () => {
    it("unison = tonic", () => {
        expect(chromaticDegreeName(0, 0)).toBe("tonic");
    });

    it("half step up from tonic = flat-supertonic", () => {
        expect(chromaticDegreeName(1, 0)).toBe("flat-supertonic");
    });

    it("tritone = augmented-subdominant", () => {
        expect(chromaticDegreeName(6, 0)).toBe("augmented-subdominant");
    });

    it("diatonic style with chromatic degrees", () => {
        expect(chromaticDegreeName(1, 0, "diatonic")).toBe("♭2nd");
        expect(chromaticDegreeName(3, 0, "diatonic")).toBe("♭3rd");
        expect(chromaticDegreeName(6, 0, "diatonic")).toBe("♯4th");
        expect(chromaticDegreeName(8, 0, "diatonic")).toBe("♭6th");
        expect(chromaticDegreeName(10, 0, "diatonic")).toBe("♭7th");
    });
});