export const NATURAL_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
export const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
export const NOTES = [
  ['B#', 'C', 'Dbb'],
  ['B##', 'C#', 'Db'],
  ['C##', 'D', 'Ebb'],
  ['D#', 'Eb', 'Fbb'],
  ['D##', 'E', 'Fb'],
  ['E#', 'F', 'Gbb'],
  ['E##', 'F#', 'Gb'],
  ['F##', 'G', 'Abb'],
  ['G#', 'Ab'],
  ['G##', 'A', 'Bbb'],
  ['A#', 'Bb', 'Cbb'],
  ['A##', 'B', 'Cb'],
]
export const NOTES_PITCH = new Map<string, number>(
  NOTES.flatMap((group, i) => group?.map((n) => [n, i]) ?? []),
)
