import type { IntervalKey } from '../interval-key'
import type { PitchSpelling } from '../pitch-spelling'
import type { ChordDefinition } from './chord-definition'
import type { ChordDegree } from './chord-degree'

export interface Chord {
  root: PitchSpelling
  definition: ChordDefinition
  voicings: ChordNote[][]
}
export interface ChordNote {
  degree: ChordDegree // The functional identity
  interval: IntervalKey // Distance from the root
  spelling: PitchSpelling
  pitch: number
}
