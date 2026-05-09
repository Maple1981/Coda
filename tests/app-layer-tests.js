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
	'js/data.js',
	'js/domain/music-utils.js',
	'js/domain/scale-domain.js',
	'js/domain/chord-domain.js',
	'js/domain/extended-harmony-domain.js',
	'js/domain/circle-of-fifths-domain.js',
	'js/domain/instrument-domain.js',
	'js/domain/music-domain.js',
	'js/application/scale-report-application.js'
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
