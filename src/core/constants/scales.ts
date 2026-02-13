import type { Interval, Scale } from '../types'
import { INTERVALS } from './intervals'

export const SCALES: Record<Scale, Interval[]> = {
  MAJOR: [
    INTERVALS.M2,
    INTERVALS.M2,
    INTERVALS.m2,
    INTERVALS.M2,
    INTERVALS.M2,
    INTERVALS.M2,
    INTERVALS.m2,
  ],
  MINOR: [
    INTERVALS.M2,
    INTERVALS.m2,
    INTERVALS.M2,
    INTERVALS.M2,
    INTERVALS.m2,
    INTERVALS.M2,
    INTERVALS.M2,
  ],
  MAJOR_PENTATONIC: [INTERVALS.M2, INTERVALS.M2, INTERVALS.m3, INTERVALS.M2, INTERVALS.m3],
  HARMONIC_MINOR: [
    INTERVALS.M2,
    INTERVALS.m2,
    INTERVALS.M2,
    INTERVALS.M2,
    INTERVALS.m2,
    INTERVALS.A2,
    INTERVALS.m2,
  ],
} as const
