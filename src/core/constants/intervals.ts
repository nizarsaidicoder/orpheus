import type { Interval, IntervalKey } from '../types'

export const INTERVALS: Record<IntervalKey, Interval> = {
  P1: { pitch_step: 0, letter_step: 0, name: 'Perfect Unison' },
  A1: { pitch_step: 1, letter_step: 0, name: 'Augmented Unison' },
  m2: { pitch_step: 1, letter_step: 1, name: 'Minor Second' },
  M2: { pitch_step: 2, letter_step: 1, name: 'Major Second' },
  A2: { pitch_step: 3, letter_step: 1, name: 'Augmented Second' },
  m3: { pitch_step: 3, letter_step: 2, name: 'Minor Third' },
  M3: { pitch_step: 4, letter_step: 2, name: 'Major Third' },
  P4: { pitch_step: 5, letter_step: 3, name: 'Perfect Fourth' },
  A4: { pitch_step: 6, letter_step: 3, name: 'Augmented Fourth' },
  d5: { pitch_step: 6, letter_step: 4, name: 'Diminished Fifth' },
  P5: { pitch_step: 7, letter_step: 4, name: 'Perfect Fifth' },
  A5: { pitch_step: 8, letter_step: 4, name: 'Augmented Fifth' },
  m6: { pitch_step: 8, letter_step: 5, name: 'Minor Sixth' },
  M6: { pitch_step: 9, letter_step: 5, name: 'Major Sixth' },
  d7: { pitch_step: 9, letter_step: 6, name: 'Diminished Seventh' },
  m7: { pitch_step: 10, letter_step: 6, name: 'Minor Seventh' },
  M7: { pitch_step: 11, letter_step: 6, name: 'Major Seventh' },
  P8: { pitch_step: 12, letter_step: 7, name: 'Perfect Octave' },
} as const
