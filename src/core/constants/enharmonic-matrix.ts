import type { Key, Letter } from '../types'

export const ENHARMONIC_MATRIX: Record<number, Partial<Record<Letter, Key>>> = {
  0: { C: 'C', B: 'B#', D: 'Dbb' },
  1: { C: 'C#', D: 'Db', B: 'B##' },
  2: { D: 'D', C: 'C##', E: 'Ebb' },
  3: { D: 'D#', E: 'Eb', F: 'Fbb' },
  4: { E: 'E', D: 'D##', F: 'Fb' },
  5: { F: 'F', E: 'E#', G: 'Gbb' },
  6: { F: 'F#', G: 'Gb', E: 'E##' },
  7: { G: 'G', F: 'F##', A: 'Abb' },
  8: { G: 'G#', A: 'Ab' },
  9: { A: 'A', G: 'G##', B: 'Bbb' },
  10: { A: 'A#', B: 'Bb', C: 'Cbb' },
  11: { B: 'B', A: 'A##', C: 'Cb' },
} as const
