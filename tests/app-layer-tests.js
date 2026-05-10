const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = {
	console,
	window: {}
};
context.window.window = context.window;
vm.createContext(context);

function runScript(relativePath) {
	const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
	vm.runInContext(source, context, { filename: relativePath });
}

[
	'js/data/constants-data.js',
	'js/data/midi-data.js',
	'js/data/notes-data.js',
	'js/data/intervals-data.js',
	'js/data/scales-data.js',
	'js/data/chords-data.js',
	'js/data/guitar-tunings-data.js',
	'js/data/circle-of-fifths-data.js',
	'js/data/extended-harmony-data.js',
	'js/data.js',
	'js/services/data-index-service.js',
	'js/domain/music-utils.js',
	'js/domain/scale-domain.js',
	'js/domain/chord-domain.js',
	'js/domain/extended-harmony-domain.js',
	'js/domain/circle-of-fifths-domain.js',
	'js/domain/instrument-domain.js',
	'js/domain/progression-domain.js',
	'js/domain/music-domain.js',
	'js/application/scale-report-application.js',
	'js/application/chord-playback-application.js',
	'js/application/progression-application.js'
].forEach(runScript);

const app = context.window.CodaApplication;
const data = context.window.CodaData;
const domain = context.window.CodaDomain;

function noteIndex(name) {
	return data.notes.findIndex(function (note) {
		return note.nombre === name || note.enarmonica === name;
	});
}

const cMajorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 0,
	scaleName: 'Mayor',
	tonicIndex: noteIndex('C'),
	tonicName: 'C'
});

assert.equal(cMajorReport.scaleDefinition.nombre, 'Mayor');
assert.deepEqual(cMajorReport.scaleNotes.map(function (note) { return note.nombre; }), ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
assert.deepEqual(cMajorReport.scaleChords.map(function (chord) { return chord.nombre; }), ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5']);
assert.deepEqual(cMajorReport.parallelScaleChords.map(function (chord) { return chord.nombre; }), ['Cm7', 'Dm7♭5', 'D#maj7', 'Fm7', 'Gm7', 'G#maj7', 'A#7']);
assert.equal(cMajorReport.extendedHarmonyEnabled, true);
assert.equal(cMajorReport.mode, 'M');
assert.equal(cMajorReport.circleOfFifths.selectedKey, 'C');

const fSharpMajorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 0,
	scaleName: 'Mayor',
	tonicIndex: noteIndex('F#'),
	tonicName: 'F#'
});

assert.equal(fSharpMajorReport.circleOfFifths.selectedKey, 'F#');
assert.equal(fSharpMajorReport.circleOfFifths.orderedKeys[6].nombre, 'F#');
assert.equal(fSharpMajorReport.circleOfFifths.orderedKeys[6].enarmonica, 'D#m');

const gbMajorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: true,
	scaleIndex: 0,
	scaleName: 'Mayor',
	tonicIndex: noteIndex('Gb'),
	tonicName: 'Gb'
});

assert.equal(gbMajorReport.circleOfFifths.selectedKey, 'Gb');
assert.equal(gbMajorReport.circleOfFifths.orderedKeys[6].nombre, 'Gb');
assert.equal(gbMajorReport.circleOfFifths.orderedKeys[6].enarmonica, 'Ebm');

const cMajorProgression = app.buildProgressionFromDegrees({
	degrees: ['I', 'IV', 'V', 'I'],
	domain: domain,
	report: cMajorReport
});

assert.deepEqual(cMajorProgression.map(function (step) { return step.degree; }), ['I', 'IV', 'V', 'I']);
assert.deepEqual(cMajorProgression.map(function (step) { return step.chord.nombre; }), ['Cmaj7', 'Fmaj7', 'G7', 'Cmaj7']);

const cMajorGuitar = app.buildInstrumentView({
	data: data,
	domain: domain,
	instrument: '0',
	preferFlats: false,
	report: cMajorReport,
	tuningIndex: 0
});

assert.equal(cMajorGuitar.type, 'guitar');
assert.equal(cMajorGuitar.tuning.nombre, 'Estándar E');
assert.equal(cMajorGuitar.strings.length, 6);
assert.equal(cMajorGuitar.strings[0].midiNote, 64);
assert.deepEqual(cMajorGuitar.strings[0].trastes.slice(0, 3).map(function (fret) { return fret.nombre; }), ['F', 'F#', 'G']);

const cMajorPiano = app.buildInstrumentView({
	data: data,
	domain: domain,
	instrument: '1',
	octaveCount: 1,
	preferFlats: true,
	report: cMajorReport
});

assert.equal(cMajorPiano.type, 'piano');
assert.equal(cMajorPiano.keyboard.blackKeys.length, 12);
assert.equal(cMajorPiano.keyboard.whiteKeys.length, 7);
assert.equal(cMajorPiano.keyboard.blackKeys[1].nombre, 'Db');
assert.equal(cMajorPiano.keyboard.whiteKeys[0].midiNote, 48);

let playedNotes = null;
let playedOptions = null;
const chordPlayback = app.createChordPlayback({
	playbackService: {
		playChordFromNames: function (noteNames, options) {
			playedNotes = noteNames;
			playedOptions = options;
		}
	}
});

const parsedNotes = chordPlayback.playChordFromCellId('C-E-G-B');
assert.deepEqual(parsedNotes, ['C', 'E', 'G', 'B']);
assert.deepEqual(playedNotes, ['C', 'E', 'G', 'B']);
assert.deepEqual(playedOptions, {
	bassOctaveOffset: -12,
	duration: 0.75
});

let playedMidiNote = null;
let playedMidiOptions = null;
const instrumentPlayback = app.createInstrumentPlayback({
	playbackService: {
		playMidiNote: function (midiNote, options) {
			playedMidiNote = midiNote;
			playedMidiOptions = options;
		}
	}
});

assert.equal(instrumentPlayback.playMidiNote('60'), 60);
assert.equal(playedMidiNote, 60);
assert.deepEqual(playedMidiOptions, {
	duration: 0.55
});

const modalReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 13,
	scaleName: 'Modo jónico',
	tonicIndex: noteIndex('C'),
	tonicName: 'C'
});

assert.equal(modalReport.extendedHarmonyEnabled, false);
assert.equal(modalReport.parallelScaleChords.length, 0);
assert.equal(modalReport.circleOfFifths, null);

console.log('Application layer tests passed');
