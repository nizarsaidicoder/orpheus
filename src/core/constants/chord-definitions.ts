import type { ChordDefinition, ChordType } from '../types'
import { INTERVALS } from './intervals'

export const CHORD_DEFINITIONS: Record<ChordType, ChordDefinition> = {
  // --- MAJOR FAMILY ---
  MAJOR: {
    name: 'Major',
    symbol: '',
    family: 'MAJOR',
    intervals: [INTERVALS.M3, INTERVALS.P5],
  },
  MAJOR_6: {
    name: 'Major 6',
    symbol: '6',
    family: 'MAJOR',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.M6],
  },
  MAJOR_7: {
    name: 'Major 7',
    symbol: 'maj7',
    family: 'MAJOR',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.M7],
  },
  MAJOR_ADD9: {
    name: 'Major Add 9',
    symbol: 'add9',
    family: 'MAJOR',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.M9],
  },
  MAJOR_9: {
    name: 'Major 9',
    symbol: 'maj9',
    family: 'MAJOR',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.M7, INTERVALS.M9],
  },
  MAJOR_6_9: {
    name: 'Major 6/9',
    symbol: '6/9',
    family: 'MAJOR',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.M6, INTERVALS.M9],
  },
  MAJOR_11: {
    name: 'Major 11',
    symbol: 'maj11',
    family: 'MAJOR',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.M7, INTERVALS.M9, INTERVALS.P11],
  },
  MAJOR_13: {
    name: 'Major 13',
    symbol: 'maj13',
    family: 'MAJOR',
    intervals: [
      INTERVALS.M3,
      INTERVALS.P5,
      INTERVALS.M7,
      INTERVALS.M9,
      INTERVALS.P11,
      INTERVALS.M13,
    ],
  },

  // --- MINOR FAMILY ---
  MINOR: {
    name: 'Minor',
    symbol: 'm',
    family: 'MINOR',
    intervals: [INTERVALS.m3, INTERVALS.P5],
  },
  MINOR_6: {
    name: 'Minor 6',
    symbol: 'm6',
    family: 'MINOR',
    intervals: [INTERVALS.m3, INTERVALS.P5, INTERVALS.M6],
  },
  MINOR_7: {
    name: 'Minor 7',
    symbol: 'm7',
    family: 'MINOR',
    intervals: [INTERVALS.m3, INTERVALS.P5, INTERVALS.m7],
  },
  MINOR_MAJOR_7: {
    name: 'Minor Major 7',
    symbol: 'm(maj7)',
    family: 'MINOR',
    intervals: [INTERVALS.m3, INTERVALS.P5, INTERVALS.M7],
  },
  MINOR_ADD9: {
    name: 'Minor Add 9',
    symbol: 'm(add9)',
    family: 'MINOR',
    intervals: [INTERVALS.m3, INTERVALS.P5, INTERVALS.M9],
  },
  MINOR_9: {
    name: 'Minor 9',
    symbol: 'm9',
    family: 'MINOR',
    intervals: [INTERVALS.m3, INTERVALS.P5, INTERVALS.m7, INTERVALS.M9],
  },
  MINOR_11: {
    name: 'Minor 11',
    symbol: 'm11',
    family: 'MINOR',
    intervals: [INTERVALS.m3, INTERVALS.P5, INTERVALS.m7, INTERVALS.M9, INTERVALS.P11],
  },
  MINOR_13: {
    name: 'Minor 13',
    symbol: 'm13',
    family: 'MINOR',
    intervals: [
      INTERVALS.m3,
      INTERVALS.P5,
      INTERVALS.m7,
      INTERVALS.M9,
      INTERVALS.P11,
      INTERVALS.M13,
    ],
  },

  // --- DOMINANT FAMILY ---
  DOMINANT_7: {
    name: 'Dominant 7',
    symbol: '7',
    family: 'DOMINANT',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.m7],
  },
  DOMINANT_9: {
    name: 'Dominant 9',
    symbol: '9',
    family: 'DOMINANT',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.m7, INTERVALS.M9],
  },
  DOMINANT_11: {
    name: 'Dominant 11',
    symbol: '11',
    family: 'DOMINANT',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.m7, INTERVALS.M9, INTERVALS.P11],
  },
  DOMINANT_13: {
    name: 'Dominant 13',
    symbol: '13',
    family: 'DOMINANT',
    intervals: [
      INTERVALS.M3,
      INTERVALS.P5,
      INTERVALS.m7,
      INTERVALS.M9,
      INTERVALS.P11,
      INTERVALS.M13,
    ],
  },
  DOMINANT_7SUS4: {
    name: 'Dominant 7 Sus 4',
    symbol: '7sus4',
    family: 'DOMINANT',
    intervals: [INTERVALS.P4, INTERVALS.P5, INTERVALS.m7],
  },

  // --- SUSPENDED FAMILY ---
  SUS2: {
    name: 'Suspended 2',
    symbol: 'sus2',
    family: 'SUSPENDED',
    intervals: [INTERVALS.M2, INTERVALS.P5],
  },
  SUS4: {
    name: 'Suspended 4',
    symbol: 'sus4',
    family: 'SUSPENDED',
    intervals: [INTERVALS.P4, INTERVALS.P5],
  },

  // --- DIMINISHED FAMILY ---
  DIMINISHED: {
    name: 'Diminished',
    symbol: 'dim',
    family: 'DIMINISHED',
    intervals: [INTERVALS.m3, INTERVALS.d5],
  },
  DIMINISHED_7: {
    name: 'Diminished 7',
    symbol: 'dim7',
    family: 'DIMINISHED',
    intervals: [INTERVALS.m3, INTERVALS.d5, INTERVALS.d7],
  },
  HALF_DIMINISHED_7: {
    name: 'Half Diminished 7',
    symbol: 'm7b5',
    family: 'DIMINISHED',
    intervals: [INTERVALS.m3, INTERVALS.d5, INTERVALS.m7],
  },

  // --- AUGMENTED FAMILY ---
  AUGMENTED: {
    name: 'Augmented',
    symbol: 'aug',
    family: 'AUGMENTED',
    intervals: [INTERVALS.M3, INTERVALS.A5],
  },
  AUGMENTED_7: {
    name: 'Augmented 7',
    symbol: 'aug7',
    family: 'AUGMENTED',
    intervals: [INTERVALS.M3, INTERVALS.A5, INTERVALS.m7],
  },

  // --- ALTERED DOMINANTS ---
  DOMINANT_7_FLAT_5: {
    name: 'Dominant 7 Flat 5',
    symbol: '7b5',
    family: 'DOMINANT',
    intervals: [INTERVALS.M3, INTERVALS.d5, INTERVALS.m7],
  },
  DOMINANT_7_SHARP_5: {
    name: 'Dominant 7 Sharp 5',
    symbol: '7#5',
    family: 'DOMINANT',
    intervals: [INTERVALS.M3, INTERVALS.A5, INTERVALS.m7],
  },
  DOMINANT_7_FLAT_9: {
    name: 'Dominant 7 Flat 9',
    symbol: '7b9',
    family: 'DOMINANT',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.m7, INTERVALS.m9],
  },
  DOMINANT_7_SHARP_9: {
    name: 'Dominant 7 Sharp 9',
    symbol: '7#9',
    family: 'DOMINANT',
    intervals: [INTERVALS.M3, INTERVALS.P5, INTERVALS.m7, INTERVALS.A9],
  },
} as const
