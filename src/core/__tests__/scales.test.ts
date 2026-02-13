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
