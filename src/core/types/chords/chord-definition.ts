import type { Interval } from '../interval'
import type { ChordFamily } from './chord-family'

export interface ChordDefinition {
  name: string
  symbol: string
  family: ChordFamily
  intervals: Interval[]
}
