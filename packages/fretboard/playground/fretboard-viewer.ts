import { pitchFactory, chordFactory, spelledNoteNameToString } from "@orpheus/engine";
import { STANDARD_TUNING } from "../src/tunings/standard-tunings.ts";
import { Fretboard } from "../src/fretboard/fretboard.ts";
import { shapeFinder } from "../src/chord-shapes/shape-finder.ts";
import type { ChordVoicing } from "../src/types/fret-position.ts";

function sep(title: string) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`  ${title}`);
    console.log("─".repeat(60));
}

const guitar = new Fretboard(STANDARD_TUNING, 12);

function renderFretboard(voicing: ChordVoicing, label: string) {
    const strings = guitar.tuning.strings;
    const maxFret = 12;

    const markers = new Map<string, string>();
    for (const slot of voicing.slots) {
        if (slot === null) continue;
        markers.set(`${slot.string}:${slot.fret}`, "●");
    }

    // Header
    console.log("    " + Array.from({ length: maxFret + 1 }, (_, i) => String(i).padStart(2)).join(" "));

    // Strings high to low
    for (const str of [...strings].sort((a, b) => a.number - b.number)) {
        const openName = spelledNoteNameToString(str.openPitch.spelling);
        let row = `${openName.padEnd(3)}|`;
        for (let fret = 0; fret <= maxFret; fret++) {
            row += markers.has(`${str.number}:${fret}`) ? "-●-" : "---";
        }
        console.log(row);
    }

    console.log(`  ${label}\n`);
}

// ── All C Major Voicings ──────────────────────────────────────────────────────

const C4 = pitchFactory.fromMidi(60);
const cMajor = chordFactory.triad(C4, "major");

sep("C Major — All Voicings (frets 0–12)");

const allVoicings = shapeFinder.find(cMajor, guitar, {
    maxFretSpan: 4,
    fromFret: 0,
    toFret: 12,
    allowOpenStrings: true,
    minStrings: 3,
    maxStrings: 6,
    maxVoicings: 30,
    requireRootInBass: true,
});

allVoicings.forEach((v, i) => {
    const shapeLabel = v.shape ? ` [${v.shape} shape]` : "";
    renderFretboard(v, `#${i + 1}${shapeLabel}`);
});

console.log(`Total voicings found: ${allVoicings.length}`);