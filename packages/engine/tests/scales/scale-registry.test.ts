import { describe, it, expect } from "vitest";
import { defaultScaleRegistry, createScaleRegistry } from "../../src/scales/scale-registry.js";

describe("defaultScaleRegistry", () => {
  it("contains 'major' pattern", () => {
    expect(defaultScaleRegistry.get("major")).toBeDefined();
  });

  it("lookup is case-insensitive", () => {
    expect(defaultScaleRegistry.get("MAJOR")).toEqual(defaultScaleRegistry.get("major"));
  });

  it("returns undefined for unknown scale", () => {
    expect(defaultScaleRegistry.get("not-a-scale")).toBeUndefined();
  });

  it("byCategory('diatonic') returns at least 2 patterns", () => {
    expect(defaultScaleRegistry.byCategory("diatonic").length).toBeGreaterThanOrEqual(2);
  });

  it("byCategory('symmetric') returns whole-tone, diminished, augmented", () => {
    const sym = defaultScaleRegistry.byCategory("symmetric");
    expect(sym.length).toBeGreaterThanOrEqual(3);
  });

  it("names array contains all registered scale names", () => {
    expect(defaultScaleRegistry.names.length).toBeGreaterThan(10);
  });
});

describe("ScaleRegistry.register()", () => {
  it("returns a new registry with the added pattern", () => {
    const custom = { name: "test-scale", category: "synthetic" as const, intervals: [0, 1, 2] };
    const extended = defaultScaleRegistry.register(custom);
    expect(extended.get("test-scale")).toEqual(custom);
  });

  it("does not mutate the original registry", () => {
    const custom = { name: "test-scale-2", category: "synthetic" as const, intervals: [0, 1] };
    defaultScaleRegistry.register(custom);
    expect(defaultScaleRegistry.get("test-scale-2")).toBeUndefined();
  });

  it("throws if name already exists", () => {
    const duplicate = { name: "major", category: "diatonic" as const, intervals: [0, 2, 4] };
    expect(() => defaultScaleRegistry.register(duplicate)).toThrow();
  });
});
