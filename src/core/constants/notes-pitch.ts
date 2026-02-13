import type { Key } from '../types'
import { ENHARMONIC_MATRIX } from './enharmonic-matrix'

export const NOTES_PITCH = new Map<Key, number>(
  Object.entries(ENHARMONIC_MATRIX).flatMap(([pitch, names]) =>
    Object.values(names).map((name) => [name as Key, Number(pitch)]),
  ),
)
