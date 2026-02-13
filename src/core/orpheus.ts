import { ALPHABET, NATURAL_NOTES, NOTES, NOTES_PITCH } from './constants'

export class Orpheus {
  static next_enharominc_equivalence(origin: string, pitch: number) {
    const equivalences: string[] = NOTES[pitch]!
    const possible_letters = []
    const startIndex = ALPHABET.indexOf(origin[0]!)
    for (let i = 1; i <= 6; i++) {
      possible_letters.push(ALPHABET[(startIndex + i) % 7])
    }
    for (const letter of possible_letters) {
      const match = equivalences.find((e) => e?.[0] === letter)
      if (match) return match
    }
  }

  static ntop(note: string): number | undefined {
    return NOTES_PITCH.get(note)
  }

  static generate_scale(key: string, scale: number[]) {
    const pitch = this.ntop(key)
    const numeric_scale = [pitch]
    const alphabet = [key]
    for (let i = 0; i < scale.length; i++) {
      const next_note = (numeric_scale[i]! + scale[i]!) % 12
      numeric_scale.push(next_note)
      alphabet.push(this.next_enharominc_equivalence(alphabet[i]!, next_note)!)
    }

    return {
      numeric_scale,
      alphabet,
    }
  }
}
