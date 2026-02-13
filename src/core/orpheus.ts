import { CHORD_DEFINITIONS, ENHARMONIC_MATRIX, INTERVALS, NOTES_PITCH } from './constants'
import type { PitchSpelling, Letter, Interval, ChordType, Chord, ChordNote } from './types'
import type { ChordDegree } from './types/chords/chord-degree'

const ALPHABET: readonly Letter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const

export class Orpheus {
  private static normalizePitch(pitch: number): number {
    return ((pitch % 12) + 12) % 12
  }

  private static getNextLetter(current: PitchSpelling, step: number): Letter {
    const baseLetter = current[0]?.toUpperCase() as Letter | undefined
    if (!baseLetter) {
      throw new Error(`Invalid key format: ${current}`)
    }

    const startIndex = ALPHABET.indexOf(baseLetter)
    if (startIndex === -1) {
      throw new Error(`Invalid base spelling: ${baseLetter}`)
    }

    return ALPHABET[(startIndex + step) % 7]!
  }

  private static resolveEnharmonic(targetPitch: number, targetLetter: Letter): PitchSpelling {
    const naturalPitch = NOTES_PITCH.get(targetLetter)!

    // Calculate raw distance in semitones
    let semitoneOffset = targetPitch - naturalPitch

    // Correct for octave wrapping (ensure offset is within -6 to +6 range)
    if (semitoneOffset > 6) semitoneOffset -= 12
    if (semitoneOffset < -6) semitoneOffset += 12

    const accidental = this.getAccidentalString(semitoneOffset)
    return `${targetLetter}${accidental}` as PitchSpelling
  }
  private static getAccidentalString(offset: number): string {
    if (offset === 0) return ''

    if (offset > 0) {
      return '#'.repeat(offset)
    }

    return 'b'.repeat(Math.abs(offset))
  }

  static nextNote(
    currentPitch: number,
    currentSpelling: PitchSpelling,
    interval: Interval,
  ): { pitch: number; spelling: PitchSpelling } {
    const pitch = this.normalizePitch(currentPitch + interval.pitch_step)
    const targetLetter = this.getNextLetter(currentSpelling, interval.letter_step)
    const spelling = this.resolveEnharmonic(pitch, targetLetter)

    return { pitch, spelling }
  }

  static generateScale(root: PitchSpelling, intervals: Interval[]) {
    const spellings: PitchSpelling[] = [root]
    const pitches: number[] = [NOTES_PITCH.get(root)!]

    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i]!
      const prevPitch = pitches[i]!
      const prevSpelling = spellings[i]!

      const { pitch, spelling } = this.nextNote(prevPitch, prevSpelling, interval)

      pitches.push(pitch)
      spellings.push(spelling)
    }

    return { pitches, spellings }
  }

  static generateChord(root: PitchSpelling, chordType: ChordType): Chord {
    const definition = CHORD_DEFINITIONS[chordType]
    const intervals = definition.intervals

    const rootNote: ChordNote = {
      degree: '1',
      interval: 'P1',
      spelling: root,
      pitch: NOTES_PITCH.get(root)!,
    }

    const rootVoicing: ChordNote[] = [rootNote]

    for (const interval of intervals) {
      const { pitch, spelling } = this.nextNote(rootNote.pitch, rootNote.spelling, interval)

      rootVoicing.push({
        degree: (interval.letter_step + 1).toString() as ChordDegree,
        interval: interval.symbol,
        spelling,
        pitch,
      })
    }

    const voicings: ChordNote[][] = [rootVoicing]

    for (let i = 1; i < rootVoicing.length; i++) {
      const inversion = [...rootVoicing.slice(i), ...rootVoicing.slice(0, i)]
      voicings.push(inversion)
    }

    return { root, definition, voicings }
  }
}
