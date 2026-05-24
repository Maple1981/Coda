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
const instrumentDomain = context.window.CodaInstrumentDomain;
const styleService = context.window.CodaProgressionStyle;
const chromaticCadenceService = context.window.CodaProgressionChromaticCadence;

assert.equal(styleService.normalize('modern'), 'contemporary');
assert.equal(styleService.normalize({ style: 'baroque' }), 'baroque');
assert.equal(styleService.usesFunctionalMinorDominant({ style: 'romantic' }), true);
assert.equal(styleService.avoidsStrongDominantResolution({ style: 'contemporary' }), true);
assert.equal(styleService.requiresPreparedDissonance({ style: 'renaissance' }), true);
assert.equal(styleService.prefersPartimentoBass({ style: 'baroque' }), true);
assert.equal(styleService.prefersFourPartHarmony({ style: 'baroque' }), true);
assert.equal(styleService.prefersFourPartHarmony({ style: 'contemporary' }), false);
assert.equal(styleService.minimizesDiminishedHarmony({ style: 'contemporary' }), true);
assert.ok(styleService.seventhProbabilityScale({ style: 'baroque' }) > styleService.seventhProbabilityScale({ style: 'contemporary' }));
assert.ok(styleService.patternAffinity({ style: 'baroque' }, { form: 'partimento-double-cadence' }) > 1);
assert.ok(styleService.patternAffinity({ style: 'baroque' }, { form: 'partimento-phrygian-half' }) > 1);
assert.ok(styleService.patternAffinity({ style: 'baroque' }, { form: 'partimento-four-part-rule-octave' }) > 1);
assert.ok(styleService.patternAffinity({ style: 'baroque' }, { form: 'diminished-seventh-family' }) > 1);
assert.ok(styleService.patternAffinity({ style: 'baroque' }, { form: 'tied-bass-four-part' }) > 1);
assert.ok(styleService.patternAffinity({ style: 'classic' }, { form: 'prinner' }) > 1);
assert.ok(styleService.patternAffinity({ style: 'classic' }, { form: 'galant-marpurg-cadence' }) > 1);
assert.equal(styleService.patternAffinity({ style: 'contemporary' }, { form: 'prinner' }), 1);

function noteIndex(name) {
	return data.notes.findIndex(function (note) {
		return note.nombre === name || note.enarmonica === name;
	});
}

function sequenceRng(values) {
	let index = 0;

	return function () {
		const value = values[Math.min(index, values.length - 1)];
		index += 1;
		return value;
	};
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

const bMajorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 0,
	scaleName: 'Mayor',
	tonicIndex: noteIndex('B'),
	tonicName: 'B'
});

const fMajorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: true,
	scaleIndex: 0,
	scaleName: 'Mayor',
	tonicIndex: noteIndex('F'),
	tonicName: 'F'
});

assert.equal(cMajorReport.scaleDefinition.nombre, 'Mayor');
assert.deepEqual(cMajorReport.scaleNotes.map(function (note) { return note.nombre; }), ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
assert.deepEqual(cMajorReport.scaleNotes.map(function (note) { return note.midiNote; }), [60, 62, 64, 65, 67, 69, 71]);
assert.deepEqual(cMajorReport.scaleChords.map(function (chord) { return chord.nombre; }), ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5']);
assert.deepEqual(cMajorReport.parallelScaleChords.map(function (chord) { return chord.nombre; }), ['Cm7', 'Dm7♭5', 'Ebmaj7', 'Fm7', 'Gm7', 'Abmaj7', 'Bb7']);
assert.ok(cMajorReport.modalInterchangeSources.some(function (source) { return source.scaleIndex === 3 && source.scaleChords[4].nombre === 'G7'; }));
assert.ok(cMajorReport.modalInterchangeSources.some(function (source) { return source.scaleIndex === 15 && source.scaleChords[3].nombre === 'Fm7'; }));
assert.equal(cMajorReport.extendedHarmonyEnabled, true);
assert.equal(cMajorReport.mode, 'M');
assert.equal(cMajorReport.circleOfFifths.selectedKey, 'C');
const cMajorDiminishedSeventh = chromaticCadenceService.diminishedSeventhDegree(cMajorReport, {
	targetDegreeIndex: 0
});
assert.deepEqual(cMajorDiminishedSeventh.chord.factorNotes, ['B', 'D', 'F', 'Ab']);
assert.equal(cMajorDiminishedSeventh.degreeDisplayName, 'viidim7');
assert.equal(cMajorDiminishedSeventh.sourceLabelKey, 'progression.chromatic.diminishedSeventh');
const cMajorDiminishedSeventhOfDominant = chromaticCadenceService.diminishedSeventhDegree(cMajorReport, {
	targetDegreeIndex: 4
});
assert.deepEqual(cMajorDiminishedSeventhOfDominant.chord.factorNotes, ['F#', 'A', 'C', 'Eb']);
assert.equal(cMajorDiminishedSeventhOfDominant.degreeDisplayName, 'viidim7/V');
const cMajorCommonToneDiminished = chromaticCadenceService.diminishedSeventhDegree(cMajorReport, {
	commonTone: true,
	targetDegreeIndex: 0
});
assert.deepEqual(cMajorCommonToneDiminished.chord.factorNotes, ['C', 'Eb', 'Gb', 'A']);
assert.equal(cMajorCommonToneDiminished.degreeDisplayName, 'CTdim7');

const cMajorPentatonicReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 8,
	scaleName: 'Pentatónica Mayor',
	tonicIndex: noteIndex('C'),
	tonicName: 'C'
});

assert.deepEqual(cMajorPentatonicReport.scaleNotes.map(function (note) { return note.nombre; }), ['C', 'D', 'E', 'G', 'A']);
assert.equal(cMajorPentatonicReport.scaleChords.length, 0);
assert.equal(cMajorPentatonicReport.parallelScaleChords.length, 0);

const cBluesHexatonicReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: true,
	scaleIndex: 10,
	scaleName: 'Blues hexatónica',
	tonicIndex: noteIndex('C'),
	tonicName: 'C'
});

assert.deepEqual(cBluesHexatonicReport.scaleNotes.map(function (note) { return note.nombre; }), ['C', 'Eb', 'F', 'Gb', 'G', 'Bb']);
assert.equal(cBluesHexatonicReport.scaleChords.length, 0);
assert.equal(cBluesHexatonicReport.parallelScaleChords.length, 0);

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

const gbMinorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: true,
	scaleIndex: 2,
	scaleName: 'Menor natural',
	tonicIndex: noteIndex('Gb'),
	tonicName: 'Gb'
});

assert.deepEqual(gbMinorReport.scaleNotes.map(function (note) { return note.nombre; }), ['Gb', 'Ab', 'Bbb', 'Cb', 'Db', 'Ebb', 'Fb']);
assert.equal(instrumentDomain.notePitchClass('Cb'), instrumentDomain.notePitchClass('B'));
assert.equal(instrumentDomain.notePitchClass('Fb'), instrumentDomain.notePitchClass('E'));
assert.equal(instrumentDomain.notePitchClass('Bbb'), instrumentDomain.notePitchClass('A'));
assert.equal(instrumentDomain.notePitchClass('Ebb'), instrumentDomain.notePitchClass('D'));

const gbMinorPianoKeyboard = instrumentDomain.buildPianoKeyboard({
	isDegreeSuppressed: function () { return false; },
	notes: data.notes,
	octaveCount: 1,
	preferFlats: true,
	scaleNotes: gbMinorReport.scaleNotes
});

function keyboardNote(keys, name) {
	return keys.find(function (key) {
		return key.nombre === name;
	});
}

assert.equal(keyboardNote(gbMinorPianoKeyboard.blackKeys, 'Gb').perteneceEscala, true);
assert.equal(keyboardNote(gbMinorPianoKeyboard.blackKeys, 'Ab').perteneceEscala, true);
assert.equal(keyboardNote(gbMinorPianoKeyboard.blackKeys, 'Db').perteneceEscala, true);
assert.equal(keyboardNote(gbMinorPianoKeyboard.whiteKeys, 'A').perteneceEscala, true);
assert.equal(keyboardNote(gbMinorPianoKeyboard.whiteKeys, 'B').perteneceEscala, true);
assert.equal(keyboardNote(gbMinorPianoKeyboard.whiteKeys, 'D').perteneceEscala, true);
assert.equal(keyboardNote(gbMinorPianoKeyboard.whiteKeys, 'E').perteneceEscala, true);

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
		articulation: 'sustain',
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
assert.equal(cMajorProgressionPlan.style, 'contemporary');
assert.equal(cMajorProgressionPlan.totalBeats, 12);
assert.equal(cMajorProgressionPlan.totalSeconds, 6);
assert.equal(cMajorProgressionPlan.voicing, 'closed');
assert.deepEqual(cMajorProgressionPlan.measures.map(function (measure) { return measure.degree; }), ['I', 'IV 6/4', 'V 6', 'I']);
assert.deepEqual(cMajorProgressionPlan.measures.map(function (measure) { return measure.chordName; }), ['C', 'F', 'G', 'C']);
assert.deepEqual(cMajorProgressionPlan.measures.map(function (measure) { return measure.tonalFunction; }), ['T', 'SD', 'D', 'T']);
const patternWeightService = context.window.CodaProgressionPatternWeight;
const baroquePartimentoPattern = {
	cadence: 'half',
	counterpoint: 88,
	degrees: [0, { forceInversionIndex: 1, index: 4 }, { forceInversionIndex: 1, index: 0 }, 4],
	form: 'partimento-rule-octave',
	styles: ['baroque'],
	weight: 10
};
assert.ok(patternWeightService.adjustedPatternWeight(baroquePartimentoPattern, {
	counterpoint: 90,
	modalInterchange: 10,
	style: 'baroque',
	tensions: 50
}, 'major') > 10);
assert.equal(patternWeightService.adjustedPatternWeight(baroquePartimentoPattern, {
	counterpoint: 90,
	modalInterchange: 10,
	style: 'contemporary',
	tensions: 50
}, 'major'), 0);
assert.ok(patternWeightService.sensitiveDegreeFactor([0, 6, 4, 0], 'major', { style: 'contemporary' }) < 1);
assert.equal(patternWeightService.sensitiveDegreeFactor([0, 6, 4, 0], 'major', { style: 'baroque' }), 1);
assert.ok(patternWeightService.figuredBassShapeScore([
	0,
	{ forceInversionIndex: 1, index: 1 },
	{ forceInversionIndex: 3, forceKind: 'seventh', index: 3 },
	0
], { style: 'baroque' }) > 0);
assert.equal(patternWeightService.figuredBassShapeScore([
	0,
	{ forceInversionIndex: 1, index: 1 },
	{ forceInversionIndex: 3, forceKind: 'seventh', index: 3 },
	0
], { style: 'classic' }), 0);
assert.ok(patternWeightService.fourPartHarmonyScore([
	0,
	{ forceInversionIndex: 1, forceKind: 'seventh', index: 4 },
	0
], { style: 'baroque', voices: 4 }) > 0);
assert.equal(patternWeightService.fourPartHarmonyScore([
	0,
	{ forceInversionIndex: 1, forceKind: 'seventh', index: 4 },
	0
], { style: 'baroque', voices: 3 }), 0);
assert.ok(patternWeightService.chromaticDiminishedScore([
	0,
	{ chromaticRole: 'diminishedSeventh', targetDegreeIndex: 4 },
	4,
	0
], { chromaticism: 80, style: 'baroque', voices: 4 }) > 0);
assert.equal(patternWeightService.chromaticDiminishedScore([
	0,
	{ chromaticRole: 'diminishedSeventh', targetDegreeIndex: 4 },
	4,
	0
], { chromaticism: 80, style: 'contemporary', voices: 4 }), 0);
assert.ok(patternWeightService.partimentoSequenceShapeScore([0, 5, 6, 4, 5, 3], { style: 'baroque' }) > 0);
assert.ok(data.progressionRules.phraseBlocks.some(function (block) {
	return block.id === 'baroque-phrygian-half' && block.form === 'partimento-phrygian-half';
}));
assert.ok(data.progressionRules.patterns.some(function (pattern) {
	return pattern.id === 'galant-prinner-period' && pattern.styles.indexOf('classic') > -1;
}));
assert.ok(data.progressionRules.patterns.some(function (pattern) {
	return pattern.id === 'baroque-four-part-rule-octave-ascending' && pattern.form === 'partimento-four-part-rule-octave';
}));
assert.ok(data.progressionRules.phraseBlocks.some(function (block) {
	return block.id === 'baroque-discant-cadence-half' && block.form === 'partimento-discant-cadence';
}));
assert.ok(data.progressionRules.phraseBlocks.some(function (block) {
	return block.id === 'baroque-diminished-seventh-half' && block.form === 'diminished-seventh-family';
}));
assert.ok(data.progressionRules.patterns.some(function (pattern) {
	return pattern.id === 'baroque-descending-thirds' && pattern.form === 'descending-thirds';
}));
assert.ok(data.progressionRules.patterns.some(function (pattern) {
	return pattern.id === 'baroque-minor-neapolitan-continuation' && pattern.form === 'minor-neapolitan-continuation';
}));
const contrastingSectionProgression = app.generateContrastingProgressionSection({
	data: data,
	domain: domain,
	progression: cMajorProgressionPlan,
	progressionState: {
		articulation: 'sustain',
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

const aprimeCloneProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	progression: cMajorProgressionPlan,
	progressionState: {
		articulation: 'sustain',
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
	sectionType: 'aprimeClone',
	selection: { preferFlats: false }
});
assert.deepEqual(aprimeCloneProgression.sections.map(function (section) { return section.id; }), ['A', 'A\'']);
assert.equal(aprimeCloneProgression.sections[1].variationKind, 'clone');
assert.equal(aprimeCloneProgression.sections[1].variationOf, 'A');
assert.deepEqual(aprimeCloneProgression.measures.slice(4).map(function (measure) { return measure.displayName; }), cMajorProgressionPlan.measures.map(function (measure) { return measure.displayName; }));
assert.equal(aprimeCloneProgression.measures[4].sectionId, 'A\'');

const bAfterAprimeProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	progression: aprimeCloneProgression,
	progressionState: {
		articulation: 'sustain',
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
	rng: sequenceRng([0.95, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: false }
});
assert.deepEqual(bAfterAprimeProgression.sections.map(function (section) { return section.id; }), ['A', 'A\'', 'B']);
assert.equal(bAfterAprimeProgression.sections[2].labelKey, 'progression.sectionB');
assert.notEqual(bAfterAprimeProgression.sections[2].contextLabel, bAfterAprimeProgression.sections[0].contextLabel);

const bprimeCloneProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	progression: contrastingSectionProgression,
	progressionState: {
		articulation: 'sustain',
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
	sectionType: 'bprimeClone',
	selection: { preferFlats: false }
});
assert.deepEqual(bprimeCloneProgression.sections.map(function (section) { return section.id; }), ['A', 'B', 'B\'']);
assert.equal(bprimeCloneProgression.sections[2].labelKey, 'progression.sectionBprime');
assert.equal(bprimeCloneProgression.sections[2].variationKind, 'clone');
assert.equal(bprimeCloneProgression.sections[2].variationOf, 'B');
assert.deepEqual(bprimeCloneProgression.measures.slice(8).map(function (measure) { return measure.displayName; }), contrastingSectionProgression.measures.slice(4).map(function (measure) { return measure.displayName; }));

const aprimeProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	progression: contrastingSectionProgression,
	progressionState: {
		articulation: 'sustain',
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
	rng: sequenceRng([0, 0, 0.5, 0.75]),
	sectionType: 'ap',
	selection: { preferFlats: false }
});
assert.deepEqual(aprimeProgression.sections.map(function (section) { return section.id; }), ['A', 'B', 'A\'']);
assert.equal(aprimeProgression.sections[2].labelKey, 'progression.sectionAprime');
assert.equal(aprimeProgression.sections[2].variationOf, 'A');
assert.equal(aprimeProgression.sections[2].state.bars, 4);
assert.equal(aprimeProgression.measures[8].sectionId, 'A\'');
assert.ok(changedMeasureCount(contrastingSectionProgression.measures.slice(0, 4), aprimeProgression.measures.slice(8, 12)) >= 1);

const twoBarProgressionPlan = app.buildProgressionFromState({
	domain: domain,
	progressionState: {
		articulation: 'sustain',
		bars: 2,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 30,
		meter: '4/4',
		modalInterchange: 10,
		tensions: 40,
		voices: 3
	},
	report: cMajorReport
});
const twoBarAprimeVariation = app.generateProgressionSection({
	data: data,
	domain: domain,
	progression: twoBarProgressionPlan,
	progressionState: {
		articulation: 'sustain',
		bars: 2,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 30,
		meter: '4/4',
		modalInterchange: 10,
		tensions: 40,
		voices: 3
	},
	report: cMajorReport,
	rng: sequenceRng([0, 0, 0.25, 0.75]),
	sectionType: 'aprimeVariation',
	selection: { preferFlats: false }
});
assert.ok(changedMeasureCount(twoBarProgressionPlan.measures, twoBarAprimeVariation.measures.slice(2, 4)) >= 1);

const sectionCProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	progression: aprimeProgression,
	progressionState: {
		articulation: 'sustain',
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
	rng: sequenceRng([0.1, 0.1, 0.1, 0.1]),
	sectionType: 'C',
	selection: { preferFlats: false }
});
assert.deepEqual(sectionCProgression.sections.map(function (section) { return section.id; }), ['A', 'B', 'A\'', 'C']);
assert.equal(sectionCProgression.sections[3].labelKey, 'progression.sectionC');
assert.notEqual(sectionCProgression.sections[3].contextLabel, sectionCProgression.sections[0].contextLabel);
assert.equal(sectionCProgression.measures[12].sectionId, 'C');
const secondaryDominantModulationProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	modulationType: 'secondaryDominant',
	progression: cMajorProgressionPlan,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 70,
		meter: '3/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 40,
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: false }
});
assert.equal(secondaryDominantModulationProgression.sections[1].modulation.kind, 'secondaryDominant');
assert.equal(secondaryDominantModulationProgression.sections[1].modulation.originSectionId, 'A');
assert.equal(secondaryDominantModulationProgression.measures[3].modulationRole, 'secondary-dominant');
assert.equal(secondaryDominantModulationProgression.measures[3].sourceLabelKey, 'progression.modulation.secondaryDominant');
assert.equal(secondaryDominantModulationProgression.measures[3].tonalFunction, 'D');
assert.equal(secondaryDominantModulationProgression.measures[3].degree, 'V/A');
assert.equal(secondaryDominantModulationProgression.measures[4].sectionId, 'B');
const pivotModulationProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	modulationType: 'pivot',
	progression: cMajorProgressionPlan,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 70,
		meter: '3/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 40,
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: false }
});
assert.equal(pivotModulationProgression.sections[1].modulation.kind, 'pivot');
assert.ok(pivotModulationProgression.sections[1].modulation.pivotDegree);
assert.equal(pivotModulationProgression.measures[3].modulationRole, 'pivot');
assert.equal(pivotModulationProgression.measures[3].modulationSourceLabelKey, 'progression.modulation.pivot');
assert.equal(pivotModulationProgression.measures[3].degree.indexOf('/'), -1);
assert.equal(pivotModulationProgression.measures[3].pivotTargetTonicName, pivotModulationProgression.sections[1].contextTonicName);
assert.equal(pivotModulationProgression.measures[4].modulationRole, undefined);
assert.equal(pivotModulationProgression.measures[4].modulationSourceLabelKey, undefined);
const pivotAnalysis = context.window.CodaProgressionHarmonicAnalysis.analyze(pivotModulationProgression);
assert.equal(pivotAnalysis.version, 1);
assert.equal(pivotAnalysis.transitions[0].kind, 'pivot');
assert.equal(pivotAnalysis.transitions[0].originSectionId, 'A');
assert.equal(pivotAnalysis.transitions[0].targetSectionId, 'B');
assert.equal(pivotAnalysis.measures[3].source.type, 'modulation');
assert.equal(pivotAnalysis.measures[3].source.kind, 'pivot');
const retargetedBMeasures = app.generateProgressionFromState({
	data: data,
	domain: domain,
	progressionState: pivotModulationProgression.sections[1].state,
	report: fMajorReport,
	rng: sequenceRng([0.1, 0.1, 0.1, 0.1])
});
const retargetedPivotProgression = context.window.CodaProgressionSectionRetarget.replaceContext({
	generatedMeasures: retargetedBMeasures.measures,
	progression: pivotModulationProgression,
	sectionId: 'B',
	sectionState: pivotModulationProgression.sections[1].state,
	targetReport: fMajorReport
});
assert.equal(retargetedPivotProgression.sections[1].contextLabel, 'F Mayor');
assert.equal(retargetedPivotProgression.sections[1].modulation, undefined);
assert.equal(retargetedPivotProgression.measures[3].modulationRole, undefined);
assert.equal(retargetedPivotProgression.measures[4].sectionId, 'B');
assert.ok(retargetedPivotProgression.measures[4].startSeconds > retargetedPivotProgression.measures[0].startSeconds);
for (let i = 1; i < retargetedPivotProgression.measures.length; i++) {
	assert.ok(retargetedPivotProgression.measures[i].startSeconds >= retargetedPivotProgression.measures[i - 1].startSeconds);
}
const pivotCompatibleProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	modulationType: 'pivot',
	progression: cMajorProgressionPlan,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 70,
		meter: '3/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 40,
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0.32, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: false }
});
assert.equal(pivotCompatibleProgression.sections[1].modulation.kind, 'pivot');
assert.notEqual(pivotCompatibleProgression.sections[1].contrast, 'parallel');
assert.equal(pivotCompatibleProgression.measures[3].modulationRole, 'pivot');
assert.equal(pivotCompatibleProgression.measures[4].modulationRole, undefined);
const bMajorProgressionPlan = app.buildProgressionFromState({
	domain: domain,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 70,
		meter: '3/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 40,
		voices: 4
	},
	report: bMajorReport
});
const bMajorPivotModulationProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	modulationType: 'pivot',
	progression: bMajorProgressionPlan,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 70,
		meter: '3/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 40,
		voices: 4
	},
	report: bMajorReport,
	rng: sequenceRng([0.99, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: false }
});
assert.equal(bMajorPivotModulationProgression.sections[1].modulation.kind, 'pivot');
assert.notEqual(bMajorPivotModulationProgression.sections[1].contextLabel, 'B Mayor');
assert.notEqual(bMajorPivotModulationProgression.sections[1].contextTonicName, 'B');
assert.equal(bMajorPivotModulationProgression.measures[3].modulationRole, 'pivot');
assert.equal(bMajorPivotModulationProgression.measures[3].modulationSourceLabelKey, 'progression.modulation.pivot');
assert.equal(bMajorPivotModulationProgression.measures[3].degree.indexOf('/'), -1);
assert.equal(bMajorPivotModulationProgression.measures[4].modulationRole, undefined);
assert.equal(bMajorPivotModulationProgression.measures[4].modulationSourceLabelKey, undefined);
assert.ok(bMajorPivotModulationProgression.measures.slice(4, 8).some(function (measure) {
	return measure.degreeIndex === 0;
}));
assert.ok(bMajorPivotModulationProgression.measures.slice(4, 8).some(function (measure) {
	return measure.degreeIndex === 4;
}));
const noModulationContrastProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	modulationType: 'none',
	progression: cMajorProgressionPlan,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 50,
		meter: '3/4',
		modalInterchange: 10,
		style: 'classic',
		tensions: 40,
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0.1, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: false }
});
assert.equal(noModulationContrastProgression.sections[1].contrast, 'same-no-modulation');
assert.equal(noModulationContrastProgression.sections[1].contextLabel, 'C Mayor');
assert.equal(noModulationContrastProgression.sections[1].modulation, undefined);
assert.notEqual(noModulationContrastProgression.measures[4].degreeIndex, 0);
assert.ok(noModulationContrastProgression.measures[4].tonalFunction === 'T' || noModulationContrastProgression.measures[4].tonalFunction === 'SD');
const sectionRemovedProgression = app.removeProgressionSection(sectionCProgression, 'A\'');
assert.deepEqual(sectionRemovedProgression.sections.map(function (section) { return section.id; }), ['A', 'B', 'C']);
assert.deepEqual(sectionRemovedProgression.sections.map(function (section) { return section.startIndex; }), [0, 4, 8]);
assert.equal(sectionRemovedProgression.measures.length, 12);
assert.equal(sectionRemovedProgression.bars, 12);
assert.equal(sectionRemovedProgression.measures[4].sectionId, 'B');
assert.equal(sectionRemovedProgression.measures[8].sectionId, 'C');
assert.equal(sectionRemovedProgression.measures[8].bar, 9);
assert.equal(app.removeProgressionSection(sectionRemovedProgression, 'A'), sectionRemovedProgression);
const sectionBRemovedProgression = app.removeProgressionSection(sectionCProgression, 'B');
assert.deepEqual(sectionBRemovedProgression.sections.map(function (section) { return section.id; }), ['A', 'A\'', 'B']);
assert.deepEqual(sectionBRemovedProgression.sections.map(function (section) { return section.startIndex; }), [0, 4, 8]);
assert.equal(sectionBRemovedProgression.sections[2].labelKey, 'progression.sectionB');
assert.equal(sectionBRemovedProgression.measures[8].sectionId, 'B');
assert.equal(sectionBRemovedProgression.measures[8].sectionLabelKey, 'progression.sectionB');
assert.equal(sectionBRemovedProgression.measures[8].bar, 9);
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
			articulation: 'sustain',
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
	articulation: 'sustain',
	bar: 2,
	beatUnit: 4,
	beatsPerBar: 3,
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
	humanization: 0,
	intensity: 80,
	inversion: '6/4',
	inversionIndex: 2,
	midiNotes: [48, 53, 57],
	notes: ['C', 'F', 'A'],
	pedalsIn: [],
	pedalsOut: [],
	source: 'diatonic',
	startBeat: 3,
	startSeconds: 1.5,
	swing: 0,
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
assert.equal(cMajorProgressionPlan.harmonicDensity, 0);

const denseCmajorProgressionPlan = app.buildProgressionFromState({
	domain: domain,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 30,
		harmonicDensity: 100,
		meter: '4/4',
		modalInterchange: 10,
		tensions: 40,
		voices: 4
	},
	report: cMajorReport,
	rng: function () { return 0; }
});
assert.equal(denseCmajorProgressionPlan.harmonicDensity, 100);
assert.ok(denseCmajorProgressionPlan.measures[0].chords.length > 1);
assert.equal(denseCmajorProgressionPlan.measures[2].chords.length, 4);
assert.equal(denseCmajorProgressionPlan.measures[3].chords, undefined);
assert.ok(cMajorProgressionPlan.measures.every(function (measure) {
	return !measure.chords || measure.chords.length <= 1;
}));
const harmonicDensityService = context.window.CodaProgressionHarmonicDensity;
assert.equal(harmonicDensityService.meterFamily({ beatsPerBar: 4 }), 'binary');
assert.equal(harmonicDensityService.meterFamily({ beatsPerBar: 3 }), 'ternary');
assert.equal(harmonicDensityService.meterFamily({ beatsPerBar: 7 }), 'irregular');
assert.equal(harmonicDensityService.chordCountForMeasure({
	index: 2,
	progressionState: { beatsPerBar: 4, harmonicDensity: 0 },
	rng: sequenceRng([0]),
	totalMeasures: 8
}), 1);
assert.equal(harmonicDensityService.targetChordCount(0, 8, { beatsPerBar: 4 }, 0.6, sequenceRng([0, 0])), 2);
assert.equal(harmonicDensityService.targetChordCount(2, 8, { beatsPerBar: 4 }, 0.6, sequenceRng([0, 0.99])), 3);
assert.equal(harmonicDensityService.targetChordCount(2, 8, { beatsPerBar: 4 }, 0.7, sequenceRng([0, 0])), 4);
assert.equal(harmonicDensityService.targetChordCount(0, 8, { beatsPerBar: 3 }, 0.5, sequenceRng([0, 0])), 1);
assert.equal(harmonicDensityService.targetChordCount(2, 8, { beatsPerBar: 3 }, 0.8, sequenceRng([0.5, 0])), 3);
assert.equal(harmonicDensityService.targetChordCount(0, 8, { beatsPerBar: 9 }, 1, sequenceRng([0, 0])), 3);
assert.equal(harmonicDensityService.chordCountForMeasure({
	density: 0.55,
	index: 1,
	measure: { tonalFunction: 'T' },
	nextMeasure: { tonalFunction: 'SD' },
	progressionState: { beatsPerBar: 4 },
	rng: sequenceRng([0.8]),
	totalMeasures: 8
}), 1);
assert.equal(harmonicDensityService.chordCountForMeasure({
	density: 0.55,
	index: 1,
	measure: { tonalFunction: 'D' },
	nextMeasure: { tonalFunction: 'T' },
	progressionState: { beatsPerBar: 4 },
	rng: sequenceRng([0.8]),
	totalMeasures: 8
}), 2);
assert.equal(harmonicDensityService.chordCountForMeasure({
	denseRun: 2,
	density: 0.9,
	index: 5,
	progressionState: { beatsPerBar: 4 },
	rng: sequenceRng([0]),
	totalMeasures: 8
}), 2);
assert.equal(harmonicDensityService.chordCountForMeasure({
	density: 0.8,
	index: 6,
	progressionState: { beatsPerBar: 4 },
	rng: sequenceRng([0]),
	totalMeasures: 8
}), 4);

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
		articulation: 'sustain',
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
assert.deepEqual(splitProgression.measures[0].chords.map(function (chord) { return chord.durationBeats; }), [2, 1]);
assert.equal(splitProgression.measures[0].chords[1].startBeat, 2);
const revoicedSplitMeasures = app.revoiceProgression(splitProgression, {
	data: data,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 90,
		humanization: 0,
		intensity: 80,
		meter: '3/4',
		modalInterchange: 10,
		style: 'classic',
		swing: 0,
		tensions: 90,
		voicing: 'open',
		voices: 5
	},
	report: cMajorReport
});
assert.equal(revoicedSplitMeasures[0].chords.length, 2);
assert.deepEqual(revoicedSplitMeasures[0].chords.map(function (chord) { return chord.chordName; }), splitProgression.measures[0].chords.map(function (chord) { return chord.chordName; }));
assert.ok(revoicedSplitMeasures[0].chords[0].midiNotes.length > splitProgression.measures[0].chords[0].midiNotes.length);
assert.equal(revoicedSplitMeasures[0].chords[0].voices, 5);
assert.equal(revoicedSplitMeasures[0].chords[1].voices, 5);
assert.equal(revoicedSplitMeasures[0].chords[0].articulation, 'sustain');
const transformedSplitProgression = app.transformProgressionFromState(splitProgression, {
	data: data,
	progressionState: {
		articulation: 'staccato',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 132,
		counterpoint: 90,
		harmonicDensity: 70,
		humanization: 12,
		intensity: 96,
		meter: '3/4',
		modalInterchange: 10,
		style: 'classic',
		swing: 18,
		tensions: 90,
		voicing: 'open',
		voices: 5
	},
	report: cMajorReport
});
assert.equal(transformedSplitProgression.userEdited, true);
assert.equal(transformedSplitProgression.bpm, 132);
assert.equal(transformedSplitProgression.measures[0].chords.length, 2);
assert.deepEqual(transformedSplitProgression.measures[0].chords.map(function (chord) { return chord.chordName; }), splitProgression.measures[0].chords.map(function (chord) { return chord.chordName; }));
assert.equal(transformedSplitProgression.measures[0].chords[0].articulation, 'staccato');
assert.equal(transformedSplitProgression.measures[0].chords[0].voices, 5);
let transformGeneratorCalled = false;
const extendedTransformedProgression = context.window.CodaProgressionDocumentTransform.applyState(cMajorProgressionPlan, {
	data: data,
	generateProgressionFromState: function () {
		transformGeneratorCalled = true;
		return app.generateProgressionFromState({
			data: data,
			progressionState: {
				bars: 8,
				beatsPerBar: 4,
				bpm: 120,
				meter: '4/4'
			},
			report: cMajorReport
		});
	},
	progressionState: {
		articulation: 'sustain',
		bars: 8,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 30,
		harmonicDensity: 0,
		humanization: 0,
		intensity: 80,
		meter: '4/4',
		modalInterchange: 10,
		style: 'contemporary',
		swing: 0,
		tensions: 40,
		voicing: 'closed',
		voices: 3
	},
	report: cMajorReport
});
assert.equal(transformGeneratorCalled, false);
assert.equal(extendedTransformedProgression.measures.length, 8);
assert.deepEqual(
	extendedTransformedProgression.measures.slice(0, 4).map(function (measure) { return measure.chordName; }),
	cMajorProgressionPlan.measures.map(function (measure) { return measure.chordName; })
);
assert.deepEqual(
	extendedTransformedProgression.measures.slice(4, 8).map(function (measure) { return measure.chordName; }),
	cMajorProgressionPlan.measures.map(function (measure) { return measure.chordName; })
);

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
		articulation: 'sustain',
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
		articulation: 'sustain',
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
		articulation: 'sustain',
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
const pulseTimedMeasure = {
	bar: 1,
	durationBeats: 4,
	durationSeconds: 2,
	startBeat: 0,
	startSeconds: 0
};
const pulseTimedChords = [
	{ chordName: 'C' },
	{ chordName: 'F' },
	{ chordName: 'G' }
];
assert.deepEqual(context.window.CodaProgressionMeasureSegments.chordDurationPlan(pulseTimedMeasure, pulseTimedChords, {
	rng: function () { return 0; }
}), [2, 1, 1]);
assert.deepEqual(context.window.CodaProgressionMeasureSegments.retimeMeasureChordList(pulseTimedMeasure, pulseTimedChords, 0.5, {
	rng: function () { return 0.99; }
}).map(function (chord) {
	return {
		durationBeats: chord.durationBeats,
		startBeat: chord.startBeat
	};
}), [
	{ durationBeats: 1, startBeat: 0 },
	{ durationBeats: 1, startBeat: 1 },
	{ durationBeats: 2, startBeat: 2 }
]);
assert.deepEqual(context.window.CodaProgressionMeasureSegments.chordDurationPlan({
	durationBeats: 7
}, pulseTimedChords, {
	rng: function () { return 0; }
}), [3, 2, 2]);
assert.deepEqual(context.window.CodaProgressionMeasureSegments.chordDurationPlan({
	durationBeats: 3
}, [
	{ chordName: 'C' },
	{ chordName: 'F' },
	{ chordName: 'G' },
	{ chordName: 'Am' }
], {
	rng: function () { return 0; }
}), [0.75, 0.75, 0.75, 0.75]);
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
		style: 'contemporary',
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
const forcedDiminishedSeventhRules = {
	patterns: [
		{
			cadence: 'authentic',
			counterpoint: 90,
			degrees: [
				0,
				{ chromaticRole: 'diminishedSeventh', forceInversionIndex: 1, targetDegreeIndex: 4 },
				4,
				0
			],
			form: 'forced-diminished-seventh',
			id: 'forced-diminished-seventh',
			modes: ['major'],
			modalColor: 35,
			tensionAffinity: 70,
			weight: 100
		}
	]
};
const cMajorDiminishedProgression = app.generateProgressionFromState({
	data: data,
	domain: domain,
	progressionState: {
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		chromaticism: 80,
		counterpoint: 50,
		meter: '4/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 50,
		voices: 4
	},
	report: cMajorReport,
	rng: function () { return 0.99; },
	rules: forcedDiminishedSeventhRules
});
assert.equal(cMajorDiminishedProgression.measures[1].source, 'chromatic');
assert.equal(cMajorDiminishedProgression.measures[1].chromaticRole, 'diminishedSeventh');
assert.equal(cMajorDiminishedProgression.measures[1].sourceLabelKey, 'progression.chromatic.diminishedSeventh');
assert.equal(cMajorDiminishedProgression.measures[1].degree, 'viidim7/V 6/5');
assert.equal(cMajorDiminishedProgression.measures[1].displayName, 'F#dim7 6/5');
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
assert.equal(generatedHighColorProgression.generation.style, 'contemporary');
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
		style: 'contemporary',
		tensions: 35,
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0, 0.99, 0.99, 0.18, 0.99, 0.99, 0.99]),
	rules: forcedSuspensionRules
});
assert.ok(suspensionWeightedProgression.measures.some(function (measure) {
	return measure.suspension === 'sus2' || measure.suspension === 'sus4';
}));

const originalMathRandom = vm.runInContext('Math.random', context);
context.__codaTestRandom = sequenceRng([0, 0.99, 0.99, 0.18, 0.99, 0.99, 0.99]);
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
		style: 'contemporary',
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
		articulation: 'sustain',
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
		style: 'contemporary'
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
assert.deepEqual(modernCadenceProgression.measures.slice(-2).map(function (measure) { return measure.degree; }), ['ii7 4/2 sus2', 'V7 6/5 sus4']);
assert.equal(classicCadenceProgression.generation.cadence, 'authentic');
assert.deepEqual(classicCadenceProgression.measures.slice(-2).map(function (measure) { return measure.degree; }), ['V 6', 'I']);
const forcedMinorCadenceRules = {
	patterns: [
		{
			cadence: 'authentic',
			counterpoint: 70,
			degrees: [0, 3, 4, 0],
			form: 'forced-minor-authentic',
			id: 'forced-minor-authentic',
			modes: ['minor'],
			modalColor: 10,
			tensionAffinity: 30,
			weight: 100
		}
	]
};
const classicMinorCadenceProgression = app.generateProgressionFromState({
	progressionState: {
		bars: 4,
		beatsPerBar: 4,
		bpm: 120,
		meter: '4/4',
		style: 'classic'
	},
	report: eMinorReport,
	rng: function () { return 0.99; },
	rules: forcedMinorCadenceRules
});
assert.equal(classicMinorCadenceProgression.generation.cadence, 'authentic');
assert.equal(classicMinorCadenceProgression.measures[2].chordName, 'B');
assert.equal(classicMinorCadenceProgression.measures[2].source, 'interchange');
assert.equal(classicMinorCadenceProgression.measures[2].sourceScaleIndex, 3);
assert.equal(classicMinorCadenceProgression.measures[2].sourceTonicName, 'E');
assert.notEqual(classicMinorCadenceProgression.measures[2].chordName, 'Bm');
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
const subFiveCadenceProgression = app.generateProgressionFromState({
	progressionState: {
		bars: 4,
		beatsPerBar: 4,
		bpm: 120,
		chromaticism: 100,
		meter: '4/4',
		style: 'classic',
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0, 0, 0.9, 0.9, 0.7]),
	rules: forcedCadenceRules
});
assert.equal(subFiveCadenceProgression.generation.cadence, 'subFive');
assert.equal(subFiveCadenceProgression.measures[2].source, 'chromatic');
assert.equal(subFiveCadenceProgression.measures[2].chromaticRole, 'subFive');
assert.equal(subFiveCadenceProgression.measures[2].tonalFunction, 'D');
assert.equal(subFiveCadenceProgression.measures[2].displayName, 'Db7');
assert.equal(subFiveCadenceProgression.measures[2].degree, 'SubV/I');
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
	rng: sequenceRng([0.4, 0.1, 0.99, 0.99, 0.99])
});
assert.equal(dDorianModalProgression.generation.cadence, 'modal');
assert.equal(dDorianModalProgression.generation.patternId, 'dorian-modal-vamp');
assert.deepEqual(dDorianModalProgression.measures.map(function (measure) { return measure.degree; }), ['i', 'i', 'ii', 'i']);
assert.deepEqual(dDorianModalProgression.measures.map(function (measure) { return measure.chordName; }), ['Dm', 'Dm', 'Em', 'Dm']);
assert.deepEqual(dDorianModalProgression.measures.map(function (measure) { return measure.modalRole || ''; }), ['tonic', 'tonic', 'modal-cadential', 'tonic']);
assert.ok(dDorianModalProgression.measures.every(function (measure) { return measure.chordName !== 'G7'; }));
assert.ok(dDorianModalProgression.measures.every(function (measure) { return dDorianReport.scaleChords[measure.degreeIndex].tipo !== 'evitar'; }));
assert.equal(dDorianModalProgression.generation.voiceLeading, 'modal-pedal-stepwise');

[13, 14, 15, 16, 17, 18, 19].forEach(function (scaleIndex) {
	var scale = data.scales[scaleIndex];
	var modalReportForAvoidance = app.buildScaleReport({
		data: data,
		domain: domain,
		preferFlats: false,
		scaleIndex: scaleIndex,
		scaleName: scale.nombre,
		tonicIndex: noteIndex('C'),
		tonicName: 'C'
	});
	var modalProgressionForAvoidance = app.generateProgressionFromState({
		data: data,
		progressionState: {
			bars: 8,
			beatsPerBar: 4,
			bpm: 120,
			counterpoint: 80,
			meter: '4/4',
			style: 'classic',
			tensions: 70,
			voices: 4
		},
		report: modalReportForAvoidance,
		rng: sequenceRng([0.4, 0.2, 0.55, 0.75, 0.25, 0.8, 0.1, 0.6])
	});
	var tonicCount = modalProgressionForAvoidance.measures.filter(function (measure) {
		return measure.degreeIndex === 0;
	}).length;
	var cadentialCount = modalProgressionForAvoidance.measures.filter(function (measure) {
		return modalReportForAvoidance.scaleChords[measure.degreeIndex].tipo === 'cadencial';
	}).length;

	assert.ok(modalProgressionForAvoidance.measures.every(function (measure) {
		return measure.degreeIndex === 0 || modalReportForAvoidance.scaleChords[measure.degreeIndex].tipo !== 'evitar';
	}));
	assert.ok(tonicCount >= cadentialCount);
});

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

const cMinorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: true,
	scaleIndex: 2,
	scaleName: 'Menor natural',
	tonicIndex: noteIndex('C'),
	tonicName: 'C'
});
const cMinorPlan = app.buildProgressionFromState({
	domain: domain,
	progressionState: {
		bars: 4,
		bpm: 120,
		meter: '4/4'
	},
	report: cMinorReport
});
const cMinorRelativeSection = app.generateContrastingProgressionSection({
	data: data,
	domain: domain,
	progression: cMinorPlan,
	progressionState: {
		bars: 4,
		bpm: 120,
		meter: '4/4'
	},
	report: cMinorReport,
	rng: sequenceRng([0.5, 0.1, 0.1, 0.1]),
	selection: { preferFlats: true }
});
assert.equal(cMinorRelativeSection.sections[1].contrast, 'relative');
assert.equal(cMinorRelativeSection.sections[1].contextTonicName, 'Eb');
assert.equal(cMinorRelativeSection.sections[1].contextScaleName, 'Mayor');
assert.equal(cMinorRelativeSection.sections[1].circleOfFifths.selectedKey, 'Eb');

const classicalDissonance = context.window.CodaProgressionClassicalDissonance;
assert.equal(classicalDissonance.isPreparedByPreviousHarmony({
	voiceNotes: [{ note: 'F', midiNote: 65 }, { note: 'A', midiNote: 69 }],
	notes: ['D', 'F', 'A']
}, 'F'), true);
assert.equal(classicalDissonance.isPreparedByPreviousHarmony({
	voiceNotes: [{ note: 'E', midiNote: 64 }, { note: 'G', midiNote: 67 }],
	notes: ['C', 'E', 'G']
}, 'F'), false);
assert.equal(classicalDissonance.resolvesByStepToChordThird(['C', 'E', 'G'], 'F'), true);
assert.equal(classicalDissonance.resolvesByStepToChordThird(['C', 'E', 'G'], 'A'), false);
assert.equal(classicalDissonance.allowsPassingNote({ midiNote: 60 }, { midiNote: 62 }, { midiNote: 64 }, { style: 'classic' }), true);
assert.equal(classicalDissonance.allowsPassingNote({ midiNote: 60 }, { midiNote: 62 }, { midiNote: 65 }, { style: 'classic' }), false);

const classicTonicTension = context.window.CodaProgressionTensions.addToNotes(['C', 'E', 'G'], {
	degreeIndex: 0,
	kind: 'triad',
	nextChordNotes: ['F', 'A', 'C'],
	scaleNotes: cMajorReport.scaleNotes,
	style: 'classic',
	tensions: 100,
	tonalFunction: 'T',
	voices: 4
});
assert.deepEqual(classicTonicTension, { label: '', notes: ['C', 'E', 'G'] });

const classicDominantTension = context.window.CodaProgressionTensions.addToNotes(['G', 'B', 'D'], {
	degreeIndex: 4,
	kind: 'triad',
	nextChordNotes: ['C', 'E', 'G'],
	scaleNotes: cMajorReport.scaleNotes,
	style: 'classic',
	tensions: 100,
	tonalFunction: 'D',
	voices: 4
});
assert.equal(classicDominantTension.notes.length, 4);
assert.ok(classicDominantTension.label.length > 0);

const composerFlowBase = app.generateProgressionFromState({
	data: data,
	domain: domain,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 112,
		counterpoint: 70,
		harmonicDensity: 30,
		meter: '4/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 40,
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0.2, 0.1, 0.1, 0.1])
});
const composerFlowB = app.generateProgressionSection({
	data: data,
	domain: domain,
	modulationType: 'pivot',
	progression: composerFlowBase,
	progressionState: composerFlowBase.state || {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 112,
		counterpoint: 70,
		harmonicDensity: 30,
		meter: '4/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 40,
		voices: 4
	},
	report: cMajorReport,
	rng: sequenceRng([0.1, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: false }
});
const composerFlowRetargeted = app.retargetProgressionSection({
	data: data,
	domain: domain,
	progression: composerFlowB,
	sectionId: 'B',
	targetReport: fMajorReport
});
const composerFlowC = app.generateProgressionSection({
	data: data,
	domain: domain,
	modulationType: 'direct',
	progression: composerFlowRetargeted,
	progressionState: composerFlowRetargeted.sections[1].state,
	report: fMajorReport,
	rng: sequenceRng([0.6, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: true }
});
const composerSchedule = context.window.CodaProgressionPlaybackSchedule.buildProgressionPlaybackSchedule(composerFlowC, {
	instrument: 0,
	startIndex: 0,
	voices: 4
});
const composerMidi = app.buildProgressionMidiFile({
	data: data,
	midiInstrument: 'acoustic_grand_piano',
	progression: composerFlowC,
	progressionState: composerFlowC.sections[1].state
});
assert.deepEqual(composerFlowC.sections.map(function (section) { return section.id; }), ['A', 'B', 'C']);
assert.equal(composerFlowC.sections[1].contextLabel, 'F Mayor');
assert.equal(composerFlowC.sections[1].modulation, undefined);
assert.ok(composerFlowC.measures.every(function (measure, index, measures) {
	return index === 0 || Number(measure.startSeconds) >= Number(measures[index - 1].startSeconds);
}));
assert.ok(composerSchedule.length >= composerFlowC.measures.length);
assert.ok(composerMidi && composerMidi.bytes && composerMidi.bytes.length > 32);

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

function changedMeasureCount(sourceMeasures, variationMeasures) {
	var count = 0;

	for (var i = 0; i < sourceMeasures.length && i < variationMeasures.length; i++) {
		if (measureSignature(sourceMeasures[i]) !== measureSignature(variationMeasures[i])) {
			count += 1;
		}
	}

	return count;
}

function measureSignature(measure) {
	if (measure && measure.chords && measure.chords.length) {
		return measure.chords.map(measureSignature).join('|');
	}

	return [
		measure && measure.displayName,
		measure && measure.chordName,
		measure && measure.label
	].join('::');
}
