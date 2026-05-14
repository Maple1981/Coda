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
	'js/data/progression-rules-data.js',
	'js/data.js',
	'js/services/data-index-service.js',
	'js/services/midi-export-service.js',
	'js/services/progression-midi-file-service.js',
	'js/services/progression-style-service.js',
	'js/services/progression-state-normalizer-service.js',
	'js/services/progression-degree-resolver-service.js',
	'js/services/progression-pitch-service.js',
	'js/services/progression-chord-quality-service.js',
	'js/services/progression-voice-leading-score-service.js',
	'js/services/progression-voicing-disposition-service.js',
	'js/services/progression-voicing-factor-service.js',
	'js/services/progression-voicing-midi-service.js',
	'js/services/progression-voicing-factory-service.js',
	'js/services/progression-voicing-selection-service.js',
	'js/services/progression-voicing-service.js',
	'js/services/progression-pedal-link-service.js',
	'js/services/progression-voice-leading-service.js',
	'js/services/progression-measure-clone-service.js',
	'js/services/progression-measure-segment-service.js',
	'js/services/progression-measure-timeline-service.js',
	'js/services/progression-formatting-service.js',
	'js/services/progression-tonal-function-service.js',
	'js/services/progression-measure-context-service.js',
	'js/services/progression-structure-index-service.js',
	'js/services/progression-structure-editing-service.js',
	'js/services/progression-suspension-resolution-service.js',
	'js/services/progression-additional-chord-score-service.js',
	'js/services/progression-additional-chord-service.js',
	'js/services/progression-segment-builder-service.js',
	'js/services/progression-replacement-chord-service.js',
	'js/services/progression-measure-chord-addition-service.js',
	'js/services/progression-measure-chord-replacement-service.js',
	'js/services/progression-editing-service.js',
	'js/services/progression-tension-service.js',
	'js/services/progression-suspension-heuristic-service.js',
	'js/services/progression-suspension-service.js',
	'js/services/progression-seventh-decision-service.js',
	'js/services/progression-chord-plan-service.js',
	'js/services/progression-measure-builder-service.js',
	'js/services/progression-result-service.js',
	'js/services/progression-cadence-planner-service.js',
	'js/services/progression-pattern-weight-service.js',
	'js/services/progression-pattern-selector-service.js',
	'js/services/progression-phrase-block-selector-service.js',
	'js/services/progression-planner-service.js',
	'js/services/progression-builder-service.js',
	'js/services/progression-chord-menu-option-service.js',
	'js/services/progression-chord-menu-service.js',
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

const cMajorProgressionPlan = app.buildProgressionFromState({
	domain: domain,
	progressionState: {
		articulation: 'legato',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 30,
		meter: '3/4',
		modalInterchange: 10,
		tensions: 40,
		voices: 3
	},
	report: cMajorReport
});

assert.equal(cMajorProgressionPlan.bars, 4);
assert.equal(cMajorProgressionPlan.meter, '3/4');
assert.equal(cMajorProgressionPlan.style, 'modern');
assert.equal(cMajorProgressionPlan.totalBeats, 12);
assert.equal(cMajorProgressionPlan.totalSeconds, 6);
assert.equal(cMajorProgressionPlan.voicing, 'closed');
assert.deepEqual(cMajorProgressionPlan.measures.map(function (measure) { return measure.degree; }), ['I', 'IV 6/4', 'V 6', 'I']);
assert.deepEqual(cMajorProgressionPlan.measures.map(function (measure) { return measure.chordName; }), ['C', 'F', 'G', 'C']);
assert.deepEqual(cMajorProgressionPlan.measures.map(function (measure) { return measure.tonalFunction; }), ['T', 'SD', 'D', 'T']);
assert.deepEqual(cMajorProgressionPlan.measures[1], {
	articulation: 'legato',
	bar: 2,
	beatUnit: 4,
	chord: cMajorReport.scaleChords[3],
	chordKind: 'triad',
	chordName: 'F',
	degree: 'IV 6/4',
	displayName: 'F 6/4',
	durationBeats: 3,
	durationSeconds: 1.5,
	endBeat: 6,
	endSeconds: 3,
	inversion: '6/4',
	inversionIndex: 2,
	midiNotes: [48, 53, 57],
	notes: ['C', 'F', 'A'],
	pedalsIn: [],
	pedalsOut: [],
	source: 'diatonic',
	startBeat: 3,
	startSeconds: 1.5,
	suspension: '',
	tonalFunction: 'SD',
	voiceNotes: [
		{ midiNote: 48, note: 'C', role: 'fifth' },
		{ midiNote: 53, note: 'F', role: 'root' },
		{ midiNote: 57, note: 'A', role: 'third' }
	],
	voiceLeading: {
		commonTones: 1,
		exteriorParallelPerfects: 0,
		parallelPerfects: 0,
		score: 0
	},
	voices: 3
});
assert.deepEqual(cMajorProgressionPlan.harmonicColor, {
	counterpoint: 30,
	modalInterchange: 10,
	tensions: 40
});

const cMajorOpenVoicingPlan = app.buildProgressionFromState({
	domain: domain,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 30,
		meter: '4/4',
		tensions: 0,
		voicing: 'open',
		voices: 4
	},
	report: cMajorReport
});
const cMajorClosedVoicingPlan = app.buildProgressionFromState({
	domain: domain,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 30,
		meter: '4/4',
		tensions: 0,
		voicing: 'closed',
		voices: 4
	},
	report: cMajorReport
});
assert.equal(cMajorOpenVoicingPlan.voicing, 'open');
assert.ok(upperVoiceSpan(cMajorOpenVoicingPlan.measures[0].midiNotes) > 12);
assert.ok(upperVoiceSpan(cMajorOpenVoicingPlan.measures[0].midiNotes) > upperVoiceSpan(cMajorClosedVoicingPlan.measures[0].midiNotes));

const splitProgression = app.addProgressionMeasureChord(cMajorProgressionPlan, 0, {
	data: data,
	progressionState: {
		articulation: 'legato',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 30,
		meter: '3/4',
		modalInterchange: 10,
		tensions: 40,
		voices: 3
	},
	report: cMajorReport,
	rng: function () { return 0; }
});
assert.equal(splitProgression.measures[0].chords.length, 2);
assert.equal(splitProgression.measures[0].chords[0].chordName, 'C');
assert.ok(/^Am/.test(splitProgression.measures[0].chords[1].chordName));
assert.equal(splitProgression.measures[0].chords[1].tonalFunction, 'T');
assert.deepEqual(splitProgression.measures[0].chords.map(function (chord) { return chord.durationBeats; }), [1.5, 1.5]);
assert.equal(splitProgression.measures[0].chords[1].startBeat, 1.5);

const suspendedMeasureProgression = JSON.parse(JSON.stringify(cMajorProgressionPlan));
suspendedMeasureProgression.measures[0].degree = 'I sus4';
suspendedMeasureProgression.measures[0].displayName = 'C sus4';
suspendedMeasureProgression.measures[0].midiNotes = [48, 53, 55, 60];
suspendedMeasureProgression.measures[0].notes = ['C', 'F', 'G', 'C'];
suspendedMeasureProgression.measures[0].suspension = 'sus4';
suspendedMeasureProgression.measures[0].voiceNotes = [
	{ midiNote: 48, note: 'C', role: 'root' },
	{ midiNote: 53, note: 'F', role: 'fourth' },
	{ midiNote: 55, note: 'G', role: 'fifth' },
	{ midiNote: 60, note: 'C', role: 'root-doubling' }
];
const resolvedSuspensionProgression = app.addProgressionMeasureChord(suspendedMeasureProgression, 0, {
	data: data,
	progressionState: {
		articulation: 'legato',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 30,
		meter: '3/4',
		modalInterchange: 10,
		tensions: 40,
		voices: 4
	},
	report: cMajorReport,
	rng: function () { return 0; }
});
assert.equal(resolvedSuspensionProgression.measures[0].chords.length, 2);
assert.equal(resolvedSuspensionProgression.measures[0].chords[1].suspension, '');
assert.equal(resolvedSuspensionProgression.measures[0].chords[1].chord, cMajorReport.scaleChords[0]);
assert.ok(['C', 'C 6', 'C 6/4', 'Cmaj7', 'Cmaj7 6/5', 'Cmaj7 4/3', 'Cmaj7 4/2'].indexOf(resolvedSuspensionProgression.measures[0].chords[1].displayName) > -1);
assert.equal(resolvedSuspensionProgression.measures[0].chords[1].degree.indexOf('sus'), -1);

const threeChordMeasureProgression = app.addProgressionMeasureChord(splitProgression, 0, {
	chordIndex: 1,
	data: data,
	progressionState: {
		articulation: 'legato',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 30,
		meter: '3/4',
		modalInterchange: 10,
		tensions: 40,
		voices: 3
	},
	report: cMajorReport,
	rng: function () { return 0; }
});
const fourChordMeasureProgression = app.addProgressionMeasureChord(threeChordMeasureProgression, 0, {
	chordIndex: 2,
	data: data,
	progressionState: {
		articulation: 'legato',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 30,
		meter: '3/4',
		modalInterchange: 10,
		tensions: 40,
		voices: 3
	},
	report: cMajorReport,
	rng: function () { return 0; }
});
assert.equal(threeChordMeasureProgression.measures[0].chords.length, 3);
assert.deepEqual(threeChordMeasureProgression.measures[0].chords.map(function (chord) { return chord.durationBeats; }), [1, 1, 1]);
assert.equal(fourChordMeasureProgression.measures[0].chords.length, 4);
assert.deepEqual(fourChordMeasureProgression.measures[0].chords.map(function (chord) { return chord.durationBeats; }), [0.75, 0.75, 0.75, 0.75]);
assert.equal(app.addProgressionMeasureChord(fourChordMeasureProgression, 0, { chordIndex: 3, report: cMajorReport }).measures[0].chords.length, 4);
assert.equal(app.removeProgressionMeasureChord(fourChordMeasureProgression, 0, 0).measures[0].chords.length, 4);
const removedAdditionalChordProgression = app.removeProgressionMeasureChord(fourChordMeasureProgression, 0, 2);
assert.equal(removedAdditionalChordProgression.measures[0].chords.length, 3);
assert.deepEqual(removedAdditionalChordProgression.measures[0].chords.map(function (chord) { return chord.durationBeats; }), [1, 1, 1]);
assert.equal(app.removeProgressionMeasureChord(splitProgression, 0, 1).measures[0].chords, undefined);
const manualSplitMeasureProgression = {
	beatsPerBar: 4,
	bpm: 120,
	measures: [
		{
			bar: 1,
			chordName: 'C',
			displayName: 'C',
			durationBeats: 4,
			durationSeconds: 2,
			startBeat: 0,
			startSeconds: 0,
			chords: [
				{ bar: 1, chordIndex: 0, chordName: 'C', displayName: 'C', durationBeats: 1, durationSeconds: 0.5, startBeat: 0, startSeconds: 0 },
				{ bar: 1, chordIndex: 1, chordName: 'Am', displayName: 'Am', durationBeats: 1, durationSeconds: 0.5, startBeat: 1, startSeconds: 0.5 },
				{ bar: 1, chordIndex: 2, chordName: 'Em', displayName: 'Em', durationBeats: 1, durationSeconds: 0.5, startBeat: 2, startSeconds: 1 },
				{ bar: 1, chordIndex: 3, chordName: 'G', displayName: 'G', durationBeats: 1, durationSeconds: 0.5, startBeat: 3, startSeconds: 1.5 }
			]
		}
	],
	secondsPerBeat: 0.5
};
const reorderedMeasureChordsProgression = app.reorderProgressionMeasureChords(manualSplitMeasureProgression, 0, 3, 1);
assert.deepEqual(reorderedMeasureChordsProgression.measures[0].chords.map(function (chord) { return chord.chordName; }), ['C', 'G', 'Am', 'Em']);
assert.deepEqual(reorderedMeasureChordsProgression.measures[0].chords.map(function (chord) { return chord.chordIndex; }), [0, 1, 2, 3]);
assert.deepEqual(reorderedMeasureChordsProgression.measures[0].chords.map(function (chord) { return chord.startBeat; }), [0, 1, 2, 3]);
assert.strictEqual(app.reorderProgressionMeasureChords(manualSplitMeasureProgression, 0, 3, 0), manualSplitMeasureProgression);
assert.strictEqual(app.reorderProgressionMeasureChords(manualSplitMeasureProgression, 0, 0, 2), manualSplitMeasureProgression);

const chordMenu = app.buildProgressionChordMenu({
	currentSegment: cMajorProgressionPlan.measures[0],
	report: cMajorReport
});
assert.equal(chordMenu[0].id, 'sameFunction');
assert.deepEqual(chordMenu[0].items.map(function (item) { return item.chordName; }), ['Cmaj7', 'Em7', 'Am7']);
assert.ok(chordMenu[0].items[0].options.some(function (item) {
	return item.kind === 'triad' && item.displayName === 'C 6/4';
}));
assert.ok(chordMenu[0].items[0].options.some(function (item) {
	return item.kind === 'seventh' && item.displayName === 'Cmaj7 4/2';
}));

const eMinorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 2,
	scaleName: 'Menor natural',
	tonicIndex: noteIndex('E'),
	tonicName: 'E'
});
const eMinorProgressionPlan = app.buildProgressionFromState({
	domain: domain,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		meter: '4/4',
		voices: 4
	},
	report: eMinorReport
});
const eMinorChordMenu = app.buildProgressionChordMenu({
	currentSegment: eMinorProgressionPlan.measures[0],
	report: eMinorReport
});
const cMajorInEMinor = eMinorChordMenu[1].items.filter(function (item) {
	return item.chordName === 'Cmaj7';
})[0];
assert.equal(cMajorInEMinor.degree, 'VImaj7');
assert.deepEqual(eMinorChordMenu[1].items.map(function (item) {
	return item.commonToneCount;
}), [3, 2, 1, 1]);

const replacedSeventhProgression = app.replaceProgressionMeasureChord(cMajorProgressionPlan, 0, 0, {
	degreeIndex: 4,
	inversionIndex: 0,
	kind: 'seventh'
}, {
	data: data,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		meter: '3/4',
		voices: 3
	},
	report: cMajorReport
});
assert.equal(replacedSeventhProgression.measures[0].displayName, 'G7');
assert.deepEqual(replacedSeventhProgression.measures[0].notes, ['G', 'B', 'F']);
assert.deepEqual(replacedSeventhProgression.measures[0].voiceNotes.map(function (voice) { return voice.role; }), ['root', 'third', 'seventh']);

const replacedHalfDiminishedProgression = app.replaceProgressionMeasureChord(cMajorProgressionPlan, 0, 0, {
	degreeIndex: 6,
	inversionIndex: 0,
	kind: 'seventh'
}, {
	data: data,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		meter: '3/4',
		voices: 3
	},
	report: cMajorReport
});
assert.equal(replacedHalfDiminishedProgression.measures[0].displayName, 'Bm7♭5');
assert.deepEqual(replacedHalfDiminishedProgression.measures[0].notes, ['B', 'D', 'F']);
assert.deepEqual(replacedHalfDiminishedProgression.measures[0].voiceNotes.map(function (voice) { return voice.role; }), ['root', 'third', 'fifth']);

const generatedHighColorProgression = app.generateProgressionFromState({
	data: data,
	progressionState: {
		articulation: 'arpeggio',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 96,
		counterpoint: 80,
		meter: '4/4',
		modalInterchange: 90,
		tensions: 80,
		voices: 6
	},
	report: cMajorReport,
	rng: function () {
		return 0.54;
	}
});

assert.equal(generatedHighColorProgression.bars, 4);
assert.equal(generatedHighColorProgression.generation.cadence, 'mixed-plagal');
assert.equal(generatedHighColorProgression.generation.patternId, 'I-iv-I');
assert.equal(generatedHighColorProgression.generation.style, 'modern');
assert.deepEqual(generatedHighColorProgression.measures.map(function (measure) { return measure.source; }), ['diatonic', 'parallel', 'parallel', 'diatonic']);
assert.deepEqual(generatedHighColorProgression.measures.map(function (measure) { return measure.chordName; }), ['C', 'Fm', 'Fm7', 'C']);
assert.ok(generatedHighColorProgression.measures[0].displayName.indexOf('add9') > -1);
assert.ok(generatedHighColorProgression.measures[0].notes.length > 4);
assert.equal(generatedHighColorProgression.measures[0].chordKind, 'triad');
assert.equal(generatedHighColorProgression.measures[0].voiceNotes.filter(function (voice) { return voice.role === 'tension'; }).length, 2);
assert.deepEqual(generatedHighColorProgression.measures[0].pedalsOut.map(function (pedal) { return pedal.note; }), ['C', 'G']);
assert.equal(generatedHighColorProgression.measures[1].inversion, '6/4');
assert.equal(generatedHighColorProgression.measures[1].suspension, 'sus2');
assert.equal(generatedHighColorProgression.measures[1].degree, 'iv 6/4 sus2');
assert.equal(generatedHighColorProgression.measures[1].displayName, 'Fm 6/4 sus2 add11 add13');
assert.deepEqual(generatedHighColorProgression.measures[1].pedalsIn.map(function (pedal) { return pedal.midiNote; }), [48, 55]);
assert.equal(generatedHighColorProgression.measures[1].voiceLeading.parallelPerfects, 0);
assert.equal(generatedHighColorProgression.measures[2].displayName, 'Fm7 4/2 sus2 11 13');
assert.equal(generatedHighColorProgression.measures[2].voiceNotes.filter(function (voice) { return voice.role === 'seventh-doubling' || voice.role === 'tension-doubling'; }).length, 0);
assert.equal(app.formatProgressionDegreeForChord('IVJ', 'Fm7'), 'iv7');
assert.equal(app.formatProgressionDegreeForChord('VII', 'Bm7♭5'), 'vii7♭5');
assert.equal(app.formatProgressionDegreeForChord('II', 'Db7♭5'), 'II7♭5');
assert.equal(app.formatProgressionDegreeForChord('II', 'Db7b5'), 'II7♭5');

const forcedSuspensionRules = {
	patterns: [
		{
			cadence: 'plagal',
			counterpoint: 40,
			degrees: [0, 3, 4, 0],
			form: 'forced-plagal-suspension',
			id: 'forced-plagal-suspension',
			modes: ['major'],
			modalColor: 20,
			tensionAffinity: 35,
			weight: 100
		}
	]
};

const suspensionWeightedProgression = app.generateProgressionFromState({
	data: data,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 40,
		meter: '4/4',
		modalInterchange: 20,
		style: 'modern',
		tensions: 35,
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0, 0.99, 0.18, 0.99, 0.99, 0.99]),
	rules: forcedSuspensionRules
});
assert.ok(suspensionWeightedProgression.measures.some(function (measure) {
	return measure.suspension === 'sus2' || measure.suspension === 'sus4';
}));

const originalMathRandom = vm.runInContext('Math.random', context);
context.__codaTestRandom = sequenceRng([0, 0.99, 0.18, 0.99, 0.99, 0.99]);
context.__codaOriginalRandom = originalMathRandom;
vm.runInContext('Math.random = function () { return __codaTestRandom(); };', context);
const suspensionWithDefaultRandom = app.generateProgressionFromState({
	data: data,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 40,
		meter: '4/4',
		modalInterchange: 20,
		style: 'modern',
		tensions: 35,
		voices: 4
	},
	report: cMajorReport,
	rules: forcedSuspensionRules
});
vm.runInContext('Math.random = __codaOriginalRandom;', context);
delete context.__codaTestRandom;
delete context.__codaOriginalRandom;
assert.ok(suspensionWithDefaultRandom.measures.some(function (measure) {
	return measure.suspension === 'sus2' || measure.suspension === 'sus4';
}));

const generatedEightBarProgression = app.generateProgressionFromState({
	data: data,
	progressionState: {
		articulation: 'legato',
		bars: 8,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 70,
		meter: '4/4',
		modalInterchange: 25,
		tensions: 55,
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0.1, 0.2, 0.2, 0.1, 0.7])
});

assert.notDeepEqual(
	generatedEightBarProgression.measures.slice(0, 4).map(function (measure) { return measure.chordName; }),
	generatedEightBarProgression.measures.slice(4, 8).map(function (measure) { return measure.chordName; })
);
assert.notEqual(generatedEightBarProgression.measures[3].chordName, 'C');
assert.notDeepEqual(generatedEightBarProgression.measures.slice(-2).map(function (measure) { return measure.degree; }), ['V', 'I']);

const forcedCadenceRules = {
	patterns: [
		{
			cadence: 'authentic',
			counterpoint: 70,
			degrees: [0, 3, 4, 0],
			form: 'forced-authentic',
			id: 'forced-authentic',
			modes: ['major'],
			modalColor: 10,
			tensionAffinity: 30,
			weight: 100
		},
		{
			cadence: 'half',
			counterpoint: 70,
			degrees: [0, 3, 1, 4],
			form: 'forced-half',
			id: 'forced-half',
			modes: ['major'],
			modalColor: 10,
			tensionAffinity: 30,
			weight: 1
		}
	]
};
const modernCadenceProgression = app.generateProgressionFromState({
	progressionState: {
		bars: 4,
		beatsPerBar: 4,
		bpm: 120,
		meter: '4/4',
		style: 'modern'
	},
	report: cMajorReport,
	rng: function () { return 0; },
	rules: forcedCadenceRules
});
const classicCadenceProgression = app.generateProgressionFromState({
	progressionState: {
		bars: 4,
		beatsPerBar: 4,
		bpm: 120,
		meter: '4/4',
		style: 'classic'
	},
	report: cMajorReport,
	rng: function () { return 0.99; },
	rules: forcedCadenceRules
});
assert.equal(modernCadenceProgression.generation.cadence, 'half');
assert.deepEqual(modernCadenceProgression.measures.slice(-2).map(function (measure) { return measure.degree; }), ['ii7 sus2', 'V7 4/3 sus4']);
assert.equal(classicCadenceProgression.generation.cadence, 'authentic');
assert.deepEqual(classicCadenceProgression.measures.slice(-2).map(function (measure) { return measure.degree; }), ['V 6', 'I']);

const reorderedProgression = app.reorderProgressionMeasures(cMajorProgressionPlan, 1, 3);
assert.deepEqual(reorderedProgression.measures.map(function (measure) { return measure.chordName; }), ['C', 'G', 'C', 'F']);
assert.deepEqual(reorderedProgression.measures.map(function (measure) { return measure.bar; }), [1, 2, 3, 4]);
assert.deepEqual(reorderedProgression.measures.map(function (measure) { return measure.startSeconds; }), [0, 1.5, 3, 4.5]);
assert.equal(reorderedProgression.totalSeconds, cMajorProgressionPlan.totalSeconds);

const cMajorProgressionMidi = app.buildProgressionMidiFile({
	data: data,
	midiInstrument: 'string_ensemble_1',
	progression: cMajorProgressionPlan
});

assert.equal(cMajorProgressionMidi.events.find(function (event) {
	return event.type === 'programChange';
}).program, 48);
assert.deepEqual(cMajorProgressionMidi.events.filter(function (event) {
	return event.type === 'noteOn';
}).slice(0, 3).map(function (event) {
	return event.note;
}), [48, 52, 55]);
assert.ok(cMajorProgressionMidi.bytes.length > 60);

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

function sequenceRng(values) {
	var index = 0;

	return function () {
		var value = values[index % values.length];
		index += 1;
		return value;
	};
}

function upperVoiceSpan(midiNotes) {
	return midiNotes[midiNotes.length - 1] - midiNotes[1];
}
