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

runScript('js/data.js');
runScript('js/domain/music-domain.js');

const data = context.window.CodaData;
const domain = context.window.CodaDomain;

function byName(collection, name) {
	return collection.find(function (item) {
		return item.nombre === name;
	});
}

function noteIndex(name) {
	return data.notes.findIndex(function (note) {
		return note.nombre === name || note.enarmonica === name;
	});
}

function buildScale(tonicName, scaleName, preferFlats) {
	return domain.buildScale({
		tonicIndex: noteIndex(tonicName),
		scaleDefinition: byName(data.scales, scaleName),
		notes: data.notes,
		intervals: data.intervals,
		octaveSemitones: data.constants.octaveSemitones,
		preferFlats: preferFlats
	});
}

function buildScaleChords(scaleNotes, scaleName) {
	return domain.buildScaleChords({
		scaleNotes: scaleNotes,
		scaleDefinition: byName(data.scales, scaleName),
		chordDefinitions: data.chords,
		octaveSemitones: data.constants.octaveSemitones
	});
}

function names(items) {
	return items.map(function (item) {
		return item.nombre;
	});
}

const cMajor = buildScale('C', 'Mayor', false);
assert.deepEqual(names(cMajor), ['C', 'D', 'E', 'F', 'G', 'A', 'B']);

const cMajorChords = buildScaleChords(cMajor, 'Mayor');
assert.deepEqual(names(cMajorChords), ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5']);

const bbMajor = buildScale('Bb', 'Mayor', true);
assert.deepEqual(names(bbMajor), ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']);

const bbMajorChords = buildScaleChords(bbMajor, 'Mayor');

const d7OfG = domain.buildExtendedHarmonyChord({
	extensionRules: data.extendedHarmony.secondaryDominants,
	targetDegree: cMajor[4].grado,
	chordTypeName: 'Dominante',
	rootSemitoneOffset: 7,
	scaleChord: cMajorChords[4],
	notes: data.notes,
	chordDefinitions: data.chords,
	mode: 'M',
	preferFlats: false,
	octaveSemitones: data.constants.octaveSemitones
});
assert.equal(d7OfG.ruleName, 'V-V');
assert.equal(d7OfG.rootName, 'D');
assert.deepEqual(d7OfG.notes, ['D', 'F#', 'A', 'C']);

const c7OfF = domain.buildExtendedHarmonyChord({
	extensionRules: data.extendedHarmony.secondaryDominants,
	targetDegree: bbMajor[4].grado,
	chordTypeName: 'Dominante',
	rootSemitoneOffset: 7,
	scaleChord: bbMajorChords[4],
	notes: data.notes,
	chordDefinitions: data.chords,
	mode: 'M',
	preferFlats: true,
	octaveSemitones: data.constants.octaveSemitones
});
assert.equal(c7OfF.ruleName, 'V-V');
assert.equal(c7OfF.rootName, 'C');
assert.deepEqual(c7OfF.notes, ['C', 'E', 'G', 'Bb']);

console.log('Domain tests passed');
