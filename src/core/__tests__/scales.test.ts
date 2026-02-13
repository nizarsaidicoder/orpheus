import { Orpheus } from './../orpheus'
import { describe, it, expect } from 'vitest'

const MAJOR = [2, 2, 1, 2, 2, 2, 1]
const MINOR = [2, 1, 2, 2, 1, 2, 2]

describe('Scale Generation and Spelling', () => {
  it('should correctly spell C Major (No accidentals)', () => {
    const result = Orpheus.generate_scale('C', MAJOR)
    expect(result.alphabet).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'])
  })

  it('should correctly spell G Major (Uses F# instead of Gb)', () => {
    const result = Orpheus.generate_scale('G', MAJOR)
    expect(result.alphabet).toContain('F#')
    expect(result.alphabet).not.toContain('Gb')
    expect(result.alphabet).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#', 'G'])
  })

  it('should correctly spell F Major (Uses Bb instead of A#)', () => {
    const result = Orpheus.generate_scale('F', MAJOR)
    expect(result.alphabet).toContain('Bb')
    expect(result.alphabet).not.toContain('A#')
    expect(result.alphabet).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E', 'F'])
  })

  it('should handle complex "Sharp" keys like F# Major', () => {
    const result = Orpheus.generate_scale('F#', MAJOR)
    expect(result.alphabet).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#', 'F#'])
  })

  it('should handle complex "Flat" keys like Gb Major', () => {
    const result = Orpheus.generate_scale('Gb', MAJOR)
    expect(result.alphabet).toEqual(['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F', 'Gb'])
  })

  it('should correctly spell C# Minor', () => {
    const result = Orpheus.generate_scale('C#', MINOR)
    expect(result.alphabet).toEqual(['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B', 'C#'])
  })

  it('should handle C# Major (The maximum sharp key)', () => {
    const result = Orpheus.generate_scale('C#', MAJOR)
    expect(result.alphabet).toEqual(['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#', 'C#'])
  })

  it('should handle Cb Major (The maximum flat key)', () => {
    const result = Orpheus.generate_scale('Cb', MAJOR)
    expect(result.alphabet).toEqual(['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb', 'Cb'])
  })

  it('should correctly spell the Harmonic Minor (Augmented Second gap)', () => {
    const HARMONIC_MINOR = [2, 1, 2, 2, 1, 3, 1]
    const result = Orpheus.generate_scale('A', HARMONIC_MINOR)
    expect(result.alphabet).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#', 'A'])
  })

  it('should handle the "Dark" spelling of B Locrian', () => {
    const LOCRIAN = [1, 2, 2, 1, 2, 2, 2]
    const result = Orpheus.generate_scale('B', LOCRIAN)
    expect(result.alphabet).toEqual(['B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('should handle the Lydian #4 accidental', () => {
    const LYDIAN = [2, 2, 2, 1, 2, 2, 1]
    const result = Orpheus.generate_scale('D', LYDIAN)
    expect(result.alphabet).toEqual(['D', 'E', 'F#', 'G#', 'A', 'B', 'C#', 'D'])
  })

  it('should handle G# Major (Theoretical key with F##)', () => {
    const result = Orpheus.generate_scale('G#', MAJOR)
    expect(result.alphabet).toEqual(['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F##', 'G#'])
  })

  it('should handle Fb Major (Theoretical key with Bbb)', () => {
    const result = Orpheus.generate_scale('Fb', MAJOR)
    expect(result.alphabet).toEqual(['Fb', 'Gb', 'Ab', 'Bbb', 'Cb', 'Db', 'Eb', 'Fb'])
  })

  it('should throw an error or handle undefined if a letter/pitch combo is impossible', () => {
    expect(() => Orpheus.generate_scale('G#', MAJOR)).not.toThrow()
  })
})

describe('Pentatonic Scale Logic', () => {
  it('should correctly spell C Major Pentatonic without skipping to F##', () => {
    // Formula for Major Pentatonic: [2, 2, 3, 2, 3]
    const MAJOR_PENTATONIC = [2, 2, 3, 2, 3]
    const result = Orpheus.generate_scale('C', MAJOR_PENTATONIC)

    // The scale should be C, D, E, G, A, C
    // Your current loop will likely produce ['C', 'D', 'E', 'F##', 'G##', 'B#']
    // because it picks the first letter-match it finds (F comes after E).

    expect(result.alphabet).toEqual(['C', 'D', 'E', 'G', 'A', 'C'])
  })
})
