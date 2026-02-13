import { INTERVALS, SCALES } from './../constants'
import { Orpheus } from './../orpheus'
import { describe, it, expect } from 'vitest'

describe('Universal Scale Generation', () => {
  it('should correctly spell C Major using Interval objects', () => {
    const result = Orpheus.generateScale('C', SCALES.MAJOR)
    expect(result.pitches).toEqual([0, 2, 4, 5, 7, 9, 11, 0])
    expect(result.spellings).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'])
  })

  it('should distinguish F# Major from Gb Major through explicit intervals', () => {
    const fSharp = Orpheus.generateScale('F#', SCALES.MAJOR)
    const gFlat = Orpheus.generateScale('Gb', SCALES.MAJOR)

    expect(fSharp.pitches).toEqual([6, 8, 10, 11, 1, 3, 5, 6])
    expect(gFlat.pitches).toEqual([6, 8, 10, 11, 1, 3, 5, 6])

    expect(fSharp.spellings).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#', 'F#'])
    expect(gFlat.spellings).toEqual(['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F', 'Gb'])
  })

  it('should enforce the Augmented Second in Harmonic Minor', () => {
    const result = Orpheus.generateScale('A', SCALES.HARMONIC_MINOR)

    expect(result.pitches).toEqual([9, 11, 0, 2, 4, 5, 8, 9])
    expect(result.spellings).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#', 'A'])
  })

  it('should correctly skip spellings in Pentatonic scales', () => {
    const result = Orpheus.generateScale('C', SCALES.MAJOR_PENTATONIC)

    expect(result.pitches).toEqual([0, 2, 4, 7, 9, 0])
    expect(result.spellings).toEqual(['C', 'D', 'E', 'G', 'A', 'C'])
  })

  it('should handle extreme theoretical keys like G# Major', () => {
    const result = Orpheus.generateScale('G#', SCALES.MAJOR)
    expect(result.pitches).toEqual([8, 10, 0, 1, 3, 5, 7, 8])
    expect(result.spellings).toEqual(['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F##', 'G#'])
  })

  it('should handle the "Dark" Locrian mode with a Diminished Fifth', () => {
    const LOCRIAN = [
      INTERVALS.m2,
      INTERVALS.M2,
      INTERVALS.M2,
      INTERVALS.m2,
      INTERVALS.M2,
      INTERVALS.M2,
      INTERVALS.M2,
    ]
    const result = Orpheus.generateScale('B', LOCRIAN)
    expect(result.pitches).toEqual([11, 0, 2, 4, 5, 7, 9, 11])
    expect(result.spellings).toEqual(['B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })
})

describe('Advanced Scale Validation', () => {
  it('should generate the Lydian mode with an Augmented Fourth', () => {
    const result = Orpheus.generateScale('C', SCALES.LYDIAN)
    // 1-2-3-#4-5-6-7
    expect(result.spellings).toEqual(['C', 'D', 'E', 'F#', 'G', 'A', 'B', 'C'])
    expect(result.pitches).toEqual([0, 2, 4, 6, 7, 9, 11, 0])
  })

  it('should generate the Phrygian mode with a Minor Second', () => {
    const result = Orpheus.generateScale('E', SCALES.PHRYGIAN)
    // 1-b2-b3-4-5-b6-b7
    expect(result.spellings).toEqual(['E', 'F', 'G', 'A', 'B', 'C', 'D', 'E'])
  })

  it('should handle the Blues scale with a Chromatic "Blue Note" (d5)', () => {
    const result = Orpheus.generateScale('A', SCALES.BLUES)
    // 1-b3-4-b5-5-b7
    // A to b3 (C), A to 4 (D), A to b5 (Eb), A to 5 (E), A to b7 (G)
    expect(result.spellings).toEqual(['A', 'C', 'D', 'Eb', 'E', 'G', 'A'])
    expect(result.pitches).toEqual([9, 0, 2, 3, 4, 7, 9])
  })

  it('should generate a Whole Tone scale with Augmented intervals', () => {
    const result = Orpheus.generateScale('C', SCALES.WHOLE_TONE)
    // 1-2-3-#4-#5-b7
    // C-D-E-F#-G#-Bb-C
    expect(result.spellings).toEqual(['C', 'D', 'E', 'F#', 'G#', 'Bb', 'C'])
  })

  it('should correctly spell the Melodic Minor (Ascending)', () => {
    const result = Orpheus.generateScale('A', SCALES.MELODIC_MINOR)
    // 1-2-b3-4-5-6-7
    expect(result.spellings).toEqual(['A', 'B', 'C', 'D', 'E', 'F#', 'G#', 'A'])
  })

  it('should handle the "Nightmare" key of D# Major', () => {
    const result = Orpheus.generateScale('D#', SCALES.MAJOR)
    // D#-E#-F##-G#-A#-B#-C##-D#
    expect(result.spellings).toEqual(['D#', 'E#', 'F##', 'G#', 'A#', 'B#', 'C##', 'D#'])
  })

  it('should generate Minor Pentatonic and skip degrees correctly', () => {
    const result = Orpheus.generateScale('E', SCALES.MINOR_PENTATONIC)
    // 1-b3-4-5-b7 (E-G-A-B-D)
    expect(result.spellings).toEqual(['E', 'G', 'A', 'B', 'D', 'E'])
    expect(result.pitches).toEqual([4, 7, 9, 11, 2, 4])
  })

  it('should generate a full Chromatic scale without duplicate letters', () => {
    const result = Orpheus.generateScale('C', SCALES.CHROMATIC)
    // This is a stress test for the resolveEnharmonic logic
    // Expect: C, C#, D, D#, E, F, F#, G, G#, A, A#, B, C
    expect(result.spellings).toEqual([
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
      'C',
    ])
  })
})
