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
	'js/domain/music-domain.js'
].forEach(runScript);

const data = context.window.CodaData;
const domain = context.window.CodaDomain;

assert.equal(data.constants.octaveSemitones, 12);
assert.equal(data.midi.initialMidiNote, 60);
assert.equal(data.midiInstruments[0].id, 'acoustic_grand_piano');
assert.equal(data.midiInstruments[1].id, 'acoustic_guitar_nylon');
assert.equal(data.midiInstruments[1].viewInstrument, '0');
assert.equal(data.midiInstruments[2].id, 'drawbar_organ');
assert.equal(data.midiInstruments[3].id, 'string_ensemble_1');
assert.equal(data.notes.length, 12);
assert.equal(data.indexes.notes.indexByName.C, 0);
assert.equal(data.indexes.notes.indexByName.Db, 1);
assert.equal(data.indexes.chords.byPattern['1-4-7-11'].abreviatura, 'maj7');
assert.equal(data.indexes.intervals.bySemitones['7'].grado, 'VJ');
assert.ok(data.extendedHarmony.secondaryDominants.length > 0);
assert.ok(data.extendedHarmony.tritoneSubstitutes.length > 0);
assert.ok(data.extendedHarmony.relativeMinorSeconds.length > 0);

const cMajorCircle = domain.buildCircleOfFifthsView({
	circleOfFifths: data.circleOfFifths,
	preferFlats: false,
	scaleDefinition: data.scales[0],
	selectedScaleIndex: 0,
	tonicName: 'C'
});

assert.equal(cMajorCircle.selectedKey, 'C');
assert.equal(cMajorCircle.orderedKeys.length, 12);
assert.deepEqual(cMajorCircle.orderedKeys.slice(0, 3).map(function (key) { return key.nombre; }), ['C', 'G', 'D']);
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[0],
	selectedScaleIndex: 0,
	tonicName: 'C'
}), true);
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[0],
	selectedScaleIndex: 0,
	tonicName: 'F'
}), true);
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[0],
	selectedScaleIndex: 0,
	tonicName: 'G'
}), false);

const fSharpMajorCircle = domain.buildCircleOfFifthsView({
	circleOfFifths: data.circleOfFifths,
	preferFlats: false,
	scaleDefinition: data.scales[0],
	selectedScaleIndex: 0,
	tonicName: 'F#'
});

assert.equal(fSharpMajorCircle.selectedKey, 'F#');
assert.equal(fSharpMajorCircle.orderedKeys[0].nombre, 'C');
assert.equal(fSharpMajorCircle.orderedKeys[6].nombre, 'F#');
assert.equal(fSharpMajorCircle.orderedKeys[6].enarmonica, 'D#m');
assert.equal(data.circleOfFifths.length, 13);

const fSharpMajorCircleAsFlats = domain.buildCircleOfFifthsView({
	circleOfFifths: data.circleOfFifths,
	preferFlats: true,
	scaleDefinition: data.scales[0],
	selectedScaleIndex: 0,
	tonicName: 'Gb'
});

assert.equal(fSharpMajorCircleAsFlats.selectedKey, 'Gb');
assert.equal(fSharpMajorCircleAsFlats.orderedKeys[6].nombre, 'Gb');
assert.equal(fSharpMajorCircleAsFlats.orderedKeys[6].enarmonica, 'Ebm');

const aSharpMinorCircle = domain.buildCircleOfFifthsView({
	circleOfFifths: data.circleOfFifths,
	preferFlats: true,
	scaleDefinition: data.scales[2],
	selectedScaleIndex: 2,
	tonicName: 'A#'
});

assert.equal(aSharpMinorCircle.selectedKey, 'Bbm');
assert.equal(aSharpMinorCircle.orderedKeys[0].nombre, 'C');
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[2],
	selectedScaleIndex: 2,
	tonicName: 'D'
}), true);
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[2],
	selectedScaleIndex: 2,
	tonicName: 'E'
}), false);
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[14],
	selectedScaleIndex: 14,
	tonicName: 'C'
}), true);
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[14],
	selectedScaleIndex: 14,
	tonicName: 'D'
}), true);
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[15],
	selectedScaleIndex: 15,
	tonicName: 'E'
}), false);
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[16],
	selectedScaleIndex: 16,
	tonicName: 'F'
}), true);
assert.equal(domain.shouldPreferFlatsForKeySignature({
	notes: data.notes,
	scaleDefinition: data.scales[17],
	selectedScaleIndex: 17,
	tonicName: 'G'
}), false);

function byName(collection, name) {
	return collection.find(function (item) {
		return item.nombre === name;
	});
}

function byRuleName(collection, name) {
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

function assertNoRepeatedLetters(scaleNotes) {
	var letters = scaleNotes.map(function (note) {
		return note.nombre.charAt(0);
	});

	assert.equal(new Set(letters).size, letters.length);
}

function types(items) {
	return items.map(function (item) {
		return item.tipo || '';
	});
}

function buildExtendedHarmonyChord(options) {
	return domain.buildExtendedHarmonyChord({
		extensionRules: options.extensionRules,
		targetDegree: options.targetDegree,
		chordTypeName: options.chordTypeName,
		rootSemitoneOffset: options.rootSemitoneOffset,
		scaleChord: options.scaleChord,
		notes: data.notes,
		chordDefinitions: data.chords,
		mode: options.mode || 'M',
		preferFlats: options.preferFlats || false,
		octaveSemitones: data.constants.octaveSemitones
	});
}

const cMajor = buildScale('C', 'Mayor', false);
assert.deepEqual(names(cMajor), ['C', 'D', 'E', 'F', 'G', 'A', 'B']);

const cMajorGuitar = domain.buildGuitarFretboard({
	fretCount: data.constants.fretCount,
	isDegreeSuppressed: function () { return false; },
	notes: data.notes,
	preferFlats: false,
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleNotes: cMajor,
	tuning: data.tunings[0]
});

assert.equal(cMajorGuitar.length, 6);
assert.equal(cMajorGuitar[0].aire, 'E');
assert.equal(cMajorGuitar[0].midiNote, 64);
assert.equal(cMajorGuitar[5].aire, 'E');
assert.equal(cMajorGuitar[5].midiNote, 40);
assert.equal(cMajorGuitar[0].trastes.length, 12);
assert.deepEqual(cMajorGuitar[0].trastes.slice(0, 3).map(function (fret) { return fret.nombre; }), ['F', 'F#', 'G']);
assert.deepEqual(cMajorGuitar[5].trastes.slice(0, 3).map(function (fret) { return fret.midiNote; }), [41, 42, 43]);
assert.equal(cMajorGuitar[0].trastes[0].perteneceEscala, true);
assert.equal(cMajorGuitar[0].trastes[1].perteneceEscala, false);

const ebTuningGuitar = domain.buildGuitarFretboard({
	fretCount: data.constants.fretCount,
	isDegreeSuppressed: function () { return false; },
	notes: data.notes,
	preferFlats: true,
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleNotes: cMajor,
	tuning: data.tunings[1]
});

assert.deepEqual(ebTuningGuitar.map(function (string) { return string.midiNote; }), [63, 58, 54, 49, 44, 39]);

const cMajorPiano = domain.buildPianoKeyboard({
	isDegreeSuppressed: function () { return false; },
	notes: data.notes,
	octaveCount: 2,
	preferFlats: true,
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleNotes: cMajor
});

assert.equal(cMajorPiano.blackKeys.length, 24);
assert.equal(cMajorPiano.whiteKeys.length, 14);
assert.equal(cMajorPiano.blackKeys[1].nombre, 'Db');
assert.equal(cMajorPiano.whiteKeys[0].nombre, 'C');
assert.equal(cMajorPiano.whiteKeys[0].midiNote, 48);
assert.equal(cMajorPiano.whiteKeys[7].midiNote, 60);
assert.equal(cMajorPiano.whiteKeys[0].perteneceEscala, true);

const cMajorChords = buildScaleChords(cMajor, 'Mayor');
assert.deepEqual(domain.createDiatonicDegreePlan({
	bars: 8,
	scaleNotes: cMajor
}), ['I', 'VI', 'II', 'VJ', 'I', 'IVJ', 'VJ', 'I']);

const cMajorCadence = domain.resolveProgressionDegrees({
	degrees: ['I', 'IV', 'V', 'I'],
	scaleChords: cMajorChords,
	scaleNotes: cMajor
});
assert.deepEqual(cMajorCadence.map(function (step) { return step.chord.nombre; }), ['Cmaj7', 'Fmaj7', 'G7', 'Cmaj7']);
assert.deepEqual(names(cMajorChords), ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5']);

const bbMajor = buildScale('Bb', 'Mayor', true);
assert.deepEqual(names(bbMajor), ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']);

const bbMajorChords = buildScaleChords(bbMajor, 'Mayor');

const fSharpMajor = buildScale('F#', 'Mayor', false);
assert.deepEqual(names(fSharpMajor), ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']);
assertNoRepeatedLetters(fSharpMajor);

const cMinorNaturalAsSharps = buildScale('C', 'Menor natural', false);
assert.deepEqual(names(cMinorNaturalAsSharps), ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb']);
assertNoRepeatedLetters(cMinorNaturalAsSharps);

const cMinorNatural = buildScale('C', 'Menor natural', true);
assert.deepEqual(names(cMinorNatural), ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb']);

const cMinorNaturalChords = buildScaleChords(cMinorNatural, 'Menor natural');
assert.deepEqual(names(cMinorNaturalChords), ['Cm7', 'Dm7♭5', 'Ebmaj7', 'Fm7', 'Gm7', 'Abmaj7', 'Bb7']);

const aMinorHarmonic = buildScale('A', 'Menor armónica', false);
assert.deepEqual(names(aMinorHarmonic), ['A', 'B', 'C', 'D', 'E', 'F', 'G#']);

const aMinorHarmonicChords = buildScaleChords(aMinorHarmonic, 'Menor armónica');
assert.deepEqual(names(aMinorHarmonicChords), ['AmMaj7', 'Bm7♭5', 'C+maj7', 'Dm7', 'E7', 'Fmaj7', 'G#dim7']);

const dDorian = buildScale('D', 'Modo dórico', false);
assert.deepEqual(names(dDorian), ['D', 'E', 'F', 'G', 'A', 'B', 'C']);
assert.deepEqual(types(dDorian), ['', '', 'secundaria', '', '', 'principal', '']);

const dDorianChords = buildScaleChords(dDorian, 'Modo dórico');
assert.deepEqual(names(dDorianChords), ['Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5', 'Cmaj7']);
assert.deepEqual(types(dDorianChords), ['', 'cadencial', '', 'cadencial', '', 'evitar', 'cadencial']);

const d7OfG = buildExtendedHarmonyChord({
	extensionRules: data.extendedHarmony.secondaryDominants,
	targetDegree: cMajor[4].grado,
	chordTypeName: 'Dominante',
	rootSemitoneOffset: 7,
	scaleChord: cMajorChords[4],
});
assert.equal(d7OfG.ruleName, 'V-V');
assert.equal(d7OfG.rootName, 'D');
assert.deepEqual(d7OfG.notes, ['D', 'F#', 'A', 'C']);

const c7OfF = buildExtendedHarmonyChord({
	extensionRules: data.extendedHarmony.secondaryDominants,
	targetDegree: bbMajor[4].grado,
	chordTypeName: 'Dominante',
	rootSemitoneOffset: 7,
	scaleChord: bbMajorChords[4],
	preferFlats: true,
});
assert.equal(c7OfF.ruleName, 'V-V');
assert.equal(c7OfF.rootName, 'C');
assert.deepEqual(c7OfF.notes, ['C', 'E', 'G', 'Bb']);

const tritoneSubstituteOfV = buildExtendedHarmonyChord({
	extensionRules: data.extendedHarmony.tritoneSubstitutes,
	targetDegree: cMajor[4].grado,
	chordTypeName: 'Dominante',
	rootSemitoneOffset: 6,
	scaleChord: cMajorChords[4]
});
assert.equal(tritoneSubstituteOfV.ruleName, 'susV-V');
assert.equal(tritoneSubstituteOfV.rootName, 'C#');
assert.deepEqual(tritoneSubstituteOfV.notes, ['C#', 'F', 'G#', 'B']);
assert.equal(tritoneSubstituteOfV.important, true);

const relativeMinorSecondOfVRule = byRuleName(data.extendedHarmony.relativeMinorSeconds, 'ii7rel-V');
const relativeMinorSecondOfV = buildExtendedHarmonyChord({
	extensionRules: data.extendedHarmony.relativeMinorSeconds,
	targetDegree: cMajor[4].grado,
	chordTypeName: relativeMinorSecondOfVRule.tipo,
	rootSemitoneOffset: 2,
	scaleChord: cMajorChords[4]
});
assert.equal(relativeMinorSecondOfV.ruleName, 'ii7rel-V');
assert.equal(relativeMinorSecondOfV.rootName, 'A');
assert.deepEqual(relativeMinorSecondOfV.notes, ['A', 'C', 'E', 'G']);

const secondaryDominantOfIIInMinorMode = buildExtendedHarmonyChord({
	extensionRules: data.extendedHarmony.secondaryDominants,
	targetDegree: cMajor[1].grado,
	chordTypeName: 'Dominante',
	rootSemitoneOffset: 7,
	scaleChord: cMajorChords[1],
	mode: 'm'
});
assert.equal(secondaryDominantOfIIInMinorMode, undefined);

const secondaryDominantOfVInMinorMode = buildExtendedHarmonyChord({
	extensionRules: data.extendedHarmony.secondaryDominants,
	targetDegree: cMajor[4].grado,
	chordTypeName: 'Dominante',
	rootSemitoneOffset: 7,
	scaleChord: cMajorChords[4],
	mode: 'm'
});
assert.equal(secondaryDominantOfVInMinorMode.ruleName, 'V-V');
assert.deepEqual(secondaryDominantOfVInMinorMode.notes, ['D', 'F#', 'A', 'C']);

console.log('Domain tests passed');
