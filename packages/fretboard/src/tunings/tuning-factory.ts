import { pitchFactory } from "@orpheus/engine";
import type { SpelledNoteName } from "@orpheus/engine";
import type { Tuning, GuitarString } from "../types/tuning.ts";

// midis[0] = lowest string (e.g. low E for guitar)
// string numbers: 1 = highest pitch, N = lowest pitch
export const tuningFactory = {
  fromMidiArray(name: string, midis: ReadonlyArray<number>): Tuning {
    const n = midis.length;
    const strings: GuitarString[] = midis.map((midi, i) => ({
      number: n - i,
      openPitch: pitchFactory.fromMidi(midi),
    }));
    // sort ascending by number → strings[0]=string 1 (highest), strings[n-1]=string N (lowest)
    strings.sort((a, b) => a.number - b.number);
    return { name, strings };
  },

  fromSpellings(name: string, spellings: ReadonlyArray<SpelledNoteName>, octaves: ReadonlyArray<number>): Tuning {
    const midis = spellings.map((s, i) => pitchFactory.fromSpelling(s, octaves[i]!).midi as number);
    return tuningFactory.fromMidiArray(name, midis);
  },
};

const _registry = new Map<string, Tuning>();

export const tuningRegistry = {
  register(tuning: Tuning): void {
    _registry.set(tuning.name.toLowerCase(), tuning);
  },

  get(name: string): Tuning | undefined {
    return _registry.get(name.toLowerCase());
  },

  all(): ReadonlyArray<Tuning> {
    return Array.from(_registry.values());
  },
};
