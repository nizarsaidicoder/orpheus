import { describe, it, expect } from "vitest";
import { pitchFactory, keyFactory } from "@orpheus/engine";
import { fretboardFactory } from "../src/fretboard/fretboard-factory.js";
import { cagedSystem } from "../src/caged/caged-system.js";
import { STANDARD_TUNING } from "../src/tunings/standard-tunings.js";

const fb = fretboardFactory.build(STANDARD_TUNING);

describe("cagedSystem", () => {
  describe("nextShape / prevShape", () => {
    it("C → A → G → E → D → C cycle", () => {
      expect(cagedSystem.nextShape("C")).toBe("A");
      expect(cagedSystem.nextShape("A")).toBe("G");
      expect(cagedSystem.nextShape("G")).toBe("E");
      expect(cagedSystem.nextShape("E")).toBe("D");
      expect(cagedSystem.nextShape("D")).toBe("C");
    });

    it("prevShape is inverse of nextShape", () => {
      for (const shape of ["C", "A", "G", "E", "D"] as const) {
        expect(cagedSystem.prevShape(cagedSystem.nextShape(shape))).toBe(shape);
      }
    });
  });

  describe("shapesForKey", () => {
    it("returns 5 CAGED positions for C major", () => {
      const cMajorKey = keyFactory.major(0); // 0 sharps = C major
      const shapes = cagedSystem.shapesForKey(cMajorKey, fb);
      expect(shapes.length).toBe(5);
    });

    it("each position has positions from the key's scale", () => {
      const cMajorKey = keyFactory.major(0);
      const scale = cMajorKey.naturalScale;
      const shapes = cagedSystem.shapesForKey(cMajorKey, fb);

      for (const cagedPos of shapes) {
        for (const pos of cagedPos.positions) {
          expect(scale.contains(pos.pitch)).toBe(true);
        }
      }
    });

    it("all 5 CAGED shapes are represented", () => {
      const cMajorKey = keyFactory.major(0);
      const shapes = cagedSystem.shapesForKey(cMajorKey, fb);
      const shapeSet = new Set(shapes.map(s => s.shape));
      expect(shapeSet.size).toBe(5);
    });
  });

  describe("shapeOf", () => {
    it("returns null for empty voicing", () => {
      const root = pitchFactory.fromMidi(60);
      const result = cagedSystem.shapeOf({ slots: [] }, root);
      expect(result).toBeNull();
    });

    it("returns a shape string or null for a real voicing", () => {
      const validShapes = new Set(["C", "A", "G", "E", "D", null]);
      const root = pitchFactory.fromMidi(60);
      // Build a mock voicing
      const pos = fb.positionsForString(1)[0]!;
      const voicing = { slots: [pos, null, null, null, null, null] };
      const shape = cagedSystem.shapeOf(voicing, root);
      expect(validShapes.has(shape)).toBe(true);
    });
  });
});
