const assert = require('assert');
const path = require('path');
const vm = require('vm');
const { createScriptLoader } = require('./helpers/script-loader');

const root = path.resolve(__dirname, '..');
const context = {
	console,
	window: {}
};
context.window.window = context.window;
vm.createContext(context);

const loader = createScriptLoader(root, context);
loader.runManifestRange('js/data/constants-data.js', 'js/application/progression-application.js');

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
assert.ok(cMajorReport.modalInterchangeSources.some(function (source) { return source.scaleIndex === 3 && source.scaleChords[4].nombre === 'G7'; }));
assert.ok(cMajorReport.modalInterchangeSources.some(function (source) { return source.scaleIndex === 15 && source.scaleChords[3].nombre === 'Fm7'; }));
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
const contrastingSectionProgression = app.generateContrastingProgressionSection({
	data: data,
	domain: domain,
	progression: cMajorProgressionPlan,
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
	rng: function () { return 0; },
	selection: { preferFlats: false }
});
assert.equal(contrastingSectionProgression.measures.length, 8);
assert.deepEqual(contrastingSectionProgression.sections.map(function (section) { return section.id; }), ['A', 'B']);
assert.equal(contrastingSectionProgression.sections[0].length, 4);
assert.equal(contrastingSectionProgression.sections[1].length, 4);
assert.equal(contrastingSectionProgression.sections[1].contextTonicName, 'C');
assert.equal(contrastingSectionProgression.sections[1].contextScaleIndex, 0);
assert.equal(contrastingSectionProgression.sections[1].contextScaleName, 'Mayor');
assert.equal(contrastingSectionProgression.sections[1].contextLabel, 'C Mayor');
assert.equal(contrastingSectionProgression.sections[1].circleOfFifths.selectedKey, 'C');
assert.equal(contrastingSectionProgression.measures[4].bar, 5);
assert.equal(contrastingSectionProgression.measures[4].sectionId, 'B');
assert.equal(contrastingSectionProgression.measures[4].tonalFunction, 'SD');
[
	{ expected: 'relative', rng: sequenceRng([0.5, 0.1, 0.1, 0.1]) },
	{ expected: 'parallel', rng: sequenceRng([0.75, 0.1, 0.1, 0.1]) },
	{ expected: 'circle-neighbor', rng: sequenceRng([0.95, 0.1, 0.1, 0.1]) }
].forEach(function (scenario) {
	var contrasted = app.generateContrastingProgressionSection({
		data: data,
		domain: domain,
		progression: cMajorProgressionPlan,
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
		rng: scenario.rng,
		selection: { preferFlats: false }
	});

	assert.equal(contrasted.sections[1].contrast, scenario.expected);
	assert.ok(contrasted.sections[1].contextTonicName);
	assert.ok(contrasted.sections[1].circleOfFifths);
	assert.equal(contrasted.measures.length, 8);
	assert.equal(contrasted.measures[4].sectionId, 'B');
});
assert.deepEqual(cMajorProgressionPlan.measures[1], {
	articulation: 'legato',
	bar: 2,
	beatUnit: 4,
	chord: cMajorReport.scaleChords[3],
	chordKind: 'triad',
	chordName: 'F',
	degreeIndex: 3,
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
	chromaticism: 10,
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

const silentProgression = app.replaceProgressionMeasureChord(cMajorProgressionPlan, 0, 0, {
	kind: 'silence'
}, {
	data: data,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		meter: '4/4',
		voices: 4
	},
	report: cMajorReport
});
assert.equal(silentProgression.measures[0].isSilence, true);
assert.equal(silentProgression.measures[0].displayName, '');
assert.equal(silentProgression.measures[0].degree, '');
assert.deepEqual(silentProgression.measures[0].notes, []);
assert.deepEqual(silentProgression.measures[0].midiNotes, []);
assert.equal(silentProgression.measures[0].tonalFunction, '');
assert.equal(silentProgression.measures[0].restorableDegreeIndex, 0);
assert.equal(silentProgression.measures[0].restorableKind, 'triad');
assert.equal(silentProgression.measures[0].restorableInversionIndex, 0);
assert.equal(silentProgression.measures[0].restorableSource, 'diatonic');
const restoredSilentProgression = app.replaceProgressionMeasureChord(silentProgression, 0, 0, {
	degreeIndex: silentProgression.measures[0].restorableDegreeIndex,
	inversionIndex: 2,
	kind: 'seventh',
	source: silentProgression.measures[0].restorableSource,
	sourceScaleIndex: silentProgression.measures[0].restorableSourceScaleIndex
}, {
	data: data,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		meter: '4/4',
		voices: 4
	},
	report: cMajorReport
});
assert.equal(restoredSilentProgression.measures[0].isSilence, undefined);
assert.equal(restoredSilentProgression.measures[0].degree, 'Imaj7 4/3');
assert.equal(restoredSilentProgression.measures[0].chordKind, 'seventh');
assert.equal(restoredSilentProgression.measures[0].inversionIndex, 2);

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
assert.equal(eMinorChordMenu[1].id, 'interchange');
assert.ok(eMinorChordMenu[1].items.length > 0);
assert.equal(eMinorChordMenu[1].items[0].degreeIndex, eMinorProgressionPlan.measures[0].degreeIndex);
assert.equal(eMinorChordMenu[1].items[0].source, 'interchange');
assert.ok(eMinorChordMenu[1].items[0].options.some(function (item) {
	return item.source === 'interchange' && item.sourceScaleIndex != null;
}));
const cMajorInEMinor = eMinorChordMenu[2].items.filter(function (item) {
	return item.chordName === 'Cmaj7';
})[0];
assert.equal(cMajorInEMinor.degree, 'VImaj7');
assert.deepEqual(eMinorChordMenu[2].items.map(function (item) {
	return item.commonToneCount;
}), [3, 2, 1, 1]);

const eMinorChromaticProgression = app.generateProgressionFromState({
	data: data,
	domain: domain,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		chromaticism: 100,
		counterpoint: 40,
		meter: '4/4',
		modalInterchange: 25,
		style: 'modern',
		tensions: 35,
		voices: 4
	},
	report: eMinorReport,
	rules: {
		patterns: [
			{
				cadence: 'half',
				counterpoint: 40,
				degrees: [0, 3, 1, 4],
				form: 'chromatic-test',
				id: 'chromatic-test',
				modes: ['minor'],
				modalColor: 25,
				tensionAffinity: 35,
				weight: 1
			}
		]
	},
	rng: sequenceRng([0, 0, 0, 1, 0])
});
assert.equal(eMinorChromaticProgression.generation.cadence, 'neapolitan');
assert.ok(eMinorChromaticProgression.measures.some(function (measure) {
	return measure.source === 'chromatic' && measure.chromaticRole === 'neapolitan';
}));
assert.ok(eMinorChromaticProgression.measures.some(function (measure) {
	return measure.sourceLabelKey === 'progression.chromatic.neapolitan';
}));
const cMajorNeapolitanReplacement = app.replaceProgressionMeasureChord(cMajorProgressionPlan, 0, 0, {
	chromaticRole: 'neapolitan',
	inversionIndex: 0,
	kind: 'seventh',
	source: 'chromatic'
}, {
	data: data,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		meter: '4/4',
		voices: 4
	},
	report: cMajorReport
});
assert.equal(cMajorNeapolitanReplacement.measures[0].source, 'chromatic');
assert.equal(cMajorNeapolitanReplacement.measures[0].chromaticRole, 'neapolitan');
assert.equal(cMajorNeapolitanReplacement.measures[0].displayName, 'Dbmaj7');
assert.equal(cMajorNeapolitanReplacement.measures[0].degree, '♭IImaj7');

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
assert.deepEqual(generatedHighColorProgression.measures.map(function (measure) { return measure.source; }), ['diatonic', 'interchange', 'interchange', 'diatonic']);
assert.deepEqual(generatedHighColorProgression.measures.map(function (measure) { return measure.sourceScaleIndex || null; }), [null, 15, 15, null]);
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
const cadentialSixFourProgression = app.generateProgressionFromState({
	progressionState: {
		bars: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 100,
		meter: '4/4',
		style: 'classic',
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0, 0, 0]),
	rules: forcedCadenceRules
});
assert.equal(cadentialSixFourProgression.generation.cadence, 'cadential64');
assert.deepEqual(cadentialSixFourProgression.measures.map(function (measure) { return measure.degree; }), ['I', 'I 6/4', 'V7', 'I']);
assert.deepEqual(cadentialSixFourProgression.measures.map(function (measure) { return measure.chordName; }), ['C', 'C', 'G7', 'C']);
assert.deepEqual(cadentialSixFourProgression.measures.map(function (measure) { return measure.chordKind; }), ['triad', 'triad', 'seventh', 'triad']);
assert.deepEqual(cadentialSixFourProgression.measures.map(function (measure) { return measure.tonalFunction; }), ['T', 'D', 'D', 'T']);
assert.equal(cadentialSixFourProgression.measures[1].inversion, '6/4');
assert.equal(cadentialSixFourProgression.measures[1].cadentialRole, 'cadential64');
assert.equal(cadentialSixFourProgression.measures[2].cadentialRole, 'cadential-dominant');
assert.deepEqual(cadentialSixFourProgression.measures[1].notes, ['G', 'C', 'E', 'C']);
const cadentialSixFourPredominantProgression = app.generateProgressionFromState({
	progressionState: {
		bars: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 100,
		meter: '4/4',
		style: 'classic',
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0, 0, 0, 0.8, 0]),
	rules: forcedCadenceRules
});
assert.equal(cadentialSixFourPredominantProgression.generation.cadence, 'cadential64');
assert.deepEqual(cadentialSixFourPredominantProgression.measures.map(function (measure) { return measure.degree; }), ['IV', 'I 6/4', 'V7', 'I']);
assert.equal(cadentialSixFourPredominantProgression.measures[0].cadentialRole, 'cadential-predominant');
const dDorianReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 14,
	scaleName: 'Modo dórico',
	tonicIndex: noteIndex('D'),
	tonicName: 'D'
});
const dDorianModalProgression = app.generateProgressionFromState({
	data: data,
	progressionState: {
		bars: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 80,
		meter: '4/4',
		style: 'classic',
		tensions: 80,
		voices: 4
	},
	report: dDorianReport,
	rng: sequenceRng([0.4, 0.99, 0.99, 0.99, 0.99])
});
assert.equal(dDorianModalProgression.generation.cadence, 'modal');
assert.equal(dDorianModalProgression.generation.patternId, 'dorian-modal-vamp');
assert.deepEqual(dDorianModalProgression.measures.map(function (measure) { return measure.degree; }), ['i', 'ii', 'IV', 'i']);
assert.deepEqual(dDorianModalProgression.measures.map(function (measure) { return measure.chordName; }), ['Dm', 'Em', 'G', 'Dm']);
assert.deepEqual(dDorianModalProgression.measures.map(function (measure) { return measure.modalRole || ''; }), ['tonic', 'modal-color', 'modal-cadential', 'tonic']);
assert.ok(dDorianModalProgression.measures.every(function (measure) { return measure.chordName !== 'G7'; }));
assert.equal(dDorianModalProgression.generation.voiceLeading, 'modal-pedal-stepwise');

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
