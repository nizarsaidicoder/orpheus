import type { IntervalKey } from './interval-key'

export interface Interval {
  pitch_step: number
  letter_step: number
  name: string
  symbol: IntervalKey
}
