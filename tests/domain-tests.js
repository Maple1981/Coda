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

assert.equal(data.constants.octaveSemitones, 12);
assert.equal(data.notes.length, 12);
assert.ok(data.extendedHarmony.secondaryDominants.length > 0);
assert.ok(data.extendedHarmony.tritoneSubstitutes.length > 0);
assert.ok(data.extendedHarmony.relativeMinorSeconds.length > 0);

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

const cMajorChords = buildScaleChords(cMajor, 'Mayor');
assert.deepEqual(names(cMajorChords), ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5']);

const bbMajor = buildScale('Bb', 'Mayor', true);
assert.deepEqual(names(bbMajor), ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']);

const bbMajorChords = buildScaleChords(bbMajor, 'Mayor');

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
