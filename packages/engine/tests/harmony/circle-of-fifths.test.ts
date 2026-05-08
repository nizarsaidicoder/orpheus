import { describe, it, expect } from "vitest";
import { circleOfFifths } from "../../src/harmony/circle-of-fifths.ts";
import { keyFactory } from "../../src/harmony/key.ts";

const CMajor = keyFactory.major(0);
const GMajor = keyFactory.major(1);
const FMajor = keyFactory.major(-1);
const FSharpMajor = keyFactory.major(6);
const DMajor = keyFactory.major(2);
const AMinor = keyFactory.minor(0);

describe("CircleOfFifths structure", () => {
  it("majorKeys contains exactly 12 nodes", () => {
    expect(circleOfFifths.majorKeys).toHaveLength(12);
  });

  it("minorKeys contains exactly 12 nodes", () => {
    expect(circleOfFifths.minorKeys).toHaveLength(12);
  });

  it("C major dominantNeighbor is G major", () => {
    const node = circleOfFifths.nodeFor(CMajor);
    expect(node.dominantNeighbor.key.tonic.pitchClass).toBe(7); // G
    expect(node.dominantNeighbor.key.modality).toBe("major");
  });

  it("C major subdominantNeighbor is F major", () => {
    const node = circleOfFifths.nodeFor(CMajor);
    expect(node.subdominantNeighbor.key.tonic.pitchClass).toBe(5); // F
    expect(node.subdominantNeighbor.key.modality).toBe("major");
  });

  it("G major dominantNeighbor is D major", () => {
    const node = circleOfFifths.nodeFor(GMajor);
    expect(node.dominantNeighbor.key.tonic.pitchClass).toBe(2); // D
  });

  it("relativeKey of C major node is A minor", () => {
    const node = circleOfFifths.nodeFor(CMajor);
    expect(node.relativeKey.tonic.pitchClass).toBe(9); // A
    expect(node.relativeKey.modality).toBe("minor");
  });

  it("relativeKey of A minor node is C major", () => {
    const node = circleOfFifths.nodeFor(AMinor);
    expect(node.relativeKey.tonic.pitchClass).toBe(0); // C
    expect(node.relativeKey.modality).toBe("major");
  });

  it("fifthsFromC of C major = 0", () => {
    expect(circleOfFifths.nodeFor(CMajor).fifthsFromC).toBe(0);
  });

  it("fifthsFromC of G major = 1", () => {
    expect(circleOfFifths.nodeFor(GMajor).fifthsFromC).toBe(1);
  });

  it("fifthsFromC of F major = -1", () => {
    expect(circleOfFifths.nodeFor(FMajor).fifthsFromC).toBe(-1);
  });

  it("fifthsFromC of F# major = 6", () => {
    expect(circleOfFifths.nodeFor(FSharpMajor).fifthsFromC).toBe(6);
  });
});

describe("CircleOfFifths.distance()", () => {
  it("distance(C, G) = 1", () => {
    expect(circleOfFifths.distance(CMajor, GMajor)).toBe(1);
  });

  it("distance(C, F) = 1", () => {
    expect(circleOfFifths.distance(CMajor, FMajor)).toBe(1);
  });

  it("distance(C, F#) = 6 (maximum)", () => {
    expect(circleOfFifths.distance(CMajor, FSharpMajor)).toBe(6);
  });

  it("distance(C, C) = 0", () => {
    expect(circleOfFifths.distance(CMajor, CMajor)).toBe(0);
  });

  it("is symmetric: distance(a, b) === distance(b, a)", () => {
    expect(circleOfFifths.distance(CMajor, DMajor)).toBe(circleOfFifths.distance(DMajor, CMajor));
    expect(circleOfFifths.distance(FMajor, FSharpMajor)).toBe(circleOfFifths.distance(FSharpMajor, FMajor));
  });
});

describe("CircleOfFifths.pathBetween()", () => {
  it("C to G returns [C, G]", () => {
    const path = circleOfFifths.pathBetween(CMajor, GMajor);
    expect(path).toHaveLength(2);
    expect(path[0]!.key.tonic.pitchClass).toBe(0); // C
    expect(path[1]!.key.tonic.pitchClass).toBe(7); // G
  });

  it("C to D returns [C, G, D]", () => {
    const path = circleOfFifths.pathBetween(CMajor, DMajor);
    expect(path).toHaveLength(3);
    expect(path[0]!.key.tonic.pitchClass).toBe(0);  // C
    expect(path[1]!.key.tonic.pitchClass).toBe(7);  // G
    expect(path[2]!.key.tonic.pitchClass).toBe(2);  // D
  });

  it("path length = distance + 1", () => {
    const dist = circleOfFifths.distance(CMajor, FSharpMajor);
    const path = circleOfFifths.pathBetween(CMajor, FSharpMajor);
    expect(path).toHaveLength(dist + 1);
  });

  it("first node in path is 'from' key", () => {
    const path = circleOfFifths.pathBetween(GMajor, DMajor);
    expect(path[0]!.key.tonic.pitchClass).toBe(7); // G
  });

  it("last node in path is 'to' key", () => {
    const path = circleOfFifths.pathBetween(CMajor, DMajor);
    expect(path[path.length - 1]!.key.tonic.pitchClass).toBe(2); // D
  });

  it("C to F takes CCW path and returns [C, F]", () => {
    // F major is 1 step CCW from C major (subdominant direction)
    const path = circleOfFifths.pathBetween(CMajor, FMajor);
    expect(path).toHaveLength(2);
    expect(path[0]!.key.tonic.pitchClass).toBe(0); // C
    expect(path[1]!.key.tonic.pitchClass).toBe(5); // F
  });
});
