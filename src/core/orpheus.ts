import { ENHARMONIC_MATRIX, NOTES_PITCH } from './constants'
import type { Key, Letter, Interval } from './types'

export class Orpheus {
  static next_note(
    current_pitch: number,
    current_letter: Key,
    interval: Interval,
  ): {
    pitch: number
    letter: Key
  } {
    const pitch = (current_pitch + interval.pitch_step) % 12

    const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const baseLetter = current_letter[0]!.toUpperCase()
    const startIndex = ALPHABET.indexOf(baseLetter)

    if (startIndex === -1) throw new Error(`Invalid base letter: ${baseLetter}`)

    const targetLetter = ALPHABET[(startIndex + interval.letter_step) % 7] as Letter

    const possibleSpellings = ENHARMONIC_MATRIX[pitch]
    if (!possibleSpellings) throw new Error(`Invalid pitch: ${pitch}`)

    const letter = possibleSpellings[targetLetter]

    if (!letter) {
      throw new Error(
        `Enharmonic gap: Pitch ${pitch} cannot be represented by letter ${targetLetter}`,
      )
    }

    return { pitch, letter }
  }
  static generate_scale(key: Key, intervals: Interval[]) {
    const pitch = NOTES_PITCH.get(key)
    if (!pitch && pitch !== 0) throw new Error(`Invalid key: ${key}`)
    const pitches: number[] = [pitch]
    const letters: Key[] = [key]
    for (let i = 0; i < intervals.length; i++) {
      const { pitch, letter } = this.next_note(pitches[i]!, letters[i]!, intervals[i]!)
      pitches.push(pitch)
      letters.push(letter)
    }
    return {
      pitches,
      letters,
    }
  }
}
