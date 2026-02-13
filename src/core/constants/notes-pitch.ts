import type { PitchSpelling } from '../types'
import { ENHARMONIC_MATRIX } from './enharmonic-matrix'

export const NOTES_PITCH = new Map<PitchSpelling, number>(
  Object.entries(ENHARMONIC_MATRIX).flatMap(([pitch, names]) =>
    Object.values(names).map((name) => [name as PitchSpelling, Number(pitch)]),
  ),
)
