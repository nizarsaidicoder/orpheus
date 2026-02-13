import { describe, it, expect } from 'vitest'
import { Orpheus } from '../orpheus'

describe('Orpheus Chord Engine: Exhaustive Validation', () => {
  describe('Major Family', () => {
    it('generates Major 6 (1-3-5-6)', () => {
      const chord = Orpheus.generateChord('C', 'MAJOR_6')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['C', 'E', 'G', 'A'])
      expect(chord.voicings[0]!.map((n) => n.degree)).toEqual(['1', '3', '5', '6'])
    })

    it('generates Major 7 (1-3-5-7)', () => {
      const chord = Orpheus.generateChord('Ab', 'MAJOR_7')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['Ab', 'C', 'Eb', 'G'])
    })

    it('generates Major 6/9 (1-3-5-6-9)', () => {
      const chord = Orpheus.generateChord('F', 'MAJOR_6_9')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['F', 'A', 'C', 'D', 'G'])
      expect(chord.voicings[0]!.map((n) => n.degree)).toEqual(['1', '3', '5', '6', '9'])
    })

    it('generates Major 13 through the full stack', () => {
      const chord = Orpheus.generateChord('C', 'MAJOR_13')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['C', 'E', 'G', 'B', 'D', 'F', 'A'])
    })
  })

  describe('Minor Family', () => {
    it('generates Minor 6 (1-b3-5-6)', () => {
      const chord = Orpheus.generateChord('D', 'MINOR_6')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['D', 'F', 'A', 'B'])
    })

    it('generates Minor Major 7 (1-b3-5-7)', () => {
      const chord = Orpheus.generateChord('A', 'MINOR_MAJOR_7')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['A', 'C', 'E', 'G#'])
    })

    it('generates Minor 11', () => {
      const chord = Orpheus.generateChord('E', 'MINOR_11')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['E', 'G', 'B', 'D', 'F#', 'A'])
    })
  })

  describe('Dominant & Altered Family', () => {
    it('generates Dominant 7 Sus 4 (1-4-5-b7)', () => {
      const chord = Orpheus.generateChord('G', 'DOMINANT_7SUS4')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['G', 'C', 'D', 'F'])
      expect(chord.voicings[0]!.map((n) => n.degree)).toEqual(['1', '4', '5', '7'])
    })

    it('generates Dominant 7b5', () => {
      const chord = Orpheus.generateChord('C', 'DOMINANT_7_FLAT_5')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['C', 'E', 'Gb', 'Bb'])
    })

    it('generates Dominant 7b9', () => {
      const chord = Orpheus.generateChord('G', 'DOMINANT_7_FLAT_9')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['G', 'B', 'D', 'F', 'Ab'])
    })

    it('generates the Hendrix Chord (7#9) with correct enharmonics', () => {
      const chord = Orpheus.generateChord('E', 'DOMINANT_7_SHARP_9')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['E', 'G#', 'B', 'D', 'F##'])
    })
  })

  describe('Suspended, Diminished, & Augmented', () => {
    it('generates Sus2 (1-2-5)', () => {
      const chord = Orpheus.generateChord('B', 'SUS2')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['B', 'C#', 'F#'])
    })

    it('generates Diminished 7 (1-b3-b5-bb7)', () => {
      const chord = Orpheus.generateChord('B', 'DIMINISHED_7')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['B', 'D', 'F', 'Ab'])
    })

    it('generates Half-Diminished 7 (1-b3-b5-b7)', () => {
      const chord = Orpheus.generateChord('F#', 'HALF_DIMINISHED_7')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['F#', 'A', 'C', 'E'])
    })

    it('generates Augmented 7 (1-3-#5-b7)', () => {
      const chord = Orpheus.generateChord('G', 'AUGMENTED_7')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['G', 'B', 'D#', 'F'])
    })
  })

  describe('Theoretical & Edge Cases', () => {
    it('spells D# Major correctly (Double Sharp)', () => {
      const chord = Orpheus.generateChord('D#', 'MAJOR')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['D#', 'F##', 'A#'])
    })

    it('spells Gb Major correctly', () => {
      const chord = Orpheus.generateChord('Gb', 'MAJOR')
      expect(chord.voicings[0]!.map((n) => n.spelling)).toEqual(['Gb', 'Bb', 'Db'])
    })

    it('validates total number of inversions matches note count', () => {
      const major7 = Orpheus.generateChord('C', 'MAJOR_7')
      expect(major7.voicings).toHaveLength(4)

      const dominant13 = Orpheus.generateChord('C', 'DOMINANT_13')
      expect(dominant13.voicings).toHaveLength(7)
    })
  })
})
