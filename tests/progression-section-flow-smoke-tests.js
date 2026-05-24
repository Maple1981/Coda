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
loader.runManifestRange('js/data/constants-data.js', 'js/application/progression-playback-application.js');

const global = context.window;
const app = global.CodaApplication;
const data = global.CodaData;
const domain = global.CodaDomain;
const state = {
	articulation: 'sustain',
	bars: 4,
	beatUnit: 4,
	beatsPerBar: 4,
	bpm: 112,
	counterpoint: 70,
	harmonicDensity: 15,
	humanization: 0,
	intensity: 80,
	meter: '4/4',
	modalInterchange: 10,
	style: 'baroque',
	swing: 0,
	tensions: 40,
	voices: 4
};

const cMajorReport = reportFor('C', 0, false);
const fMajorReport = reportFor('F', 0, false);
const sectionA = app.generateProgressionFromState({
	data: data,
	domain: domain,
	progressionState: state,
	report: cMajorReport,
	rng: sequenceRng([0.2, 0.1, 0.1, 0.1])
});
const sectionB = app.generateProgressionSection({
	data: data,
	domain: domain,
	modulationType: 'pivot',
	progression: sectionA,
	progressionState: state,
	report: cMajorReport,
	rng: sequenceRng([0.1, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: false }
});
const pivotMeasure = sectionB.measures.slice(0, sectionB.sections[0].length).filter(function (measure) {
	return measure.modulationKind === 'pivot';
})[0];
const pivotDescriptor = global.CodaProgressionAnalysisLabels.sourceLabelDescriptor(pivotMeasure, {
	i18n: {
		t: function (key) {
			return {
				'data.scales.0': 'Major',
				'progression.modulation.inKey': 'in',
				'progression.modulation.pivot': 'Pivot chord'
			}[key] || key;
		}
	},
	notation: global.CodaNotation,
	notationStyle: 'anglosaxon',
	sections: sectionB.sections
});

assert.deepEqual(sectionB.sections.map(function (section) { return section.id; }), ['A', 'B']);
assert.equal(sectionB.sections[1].modulation.kind, 'pivot');
assert.notEqual(sectionB.sections[1].contextLabel, sectionB.sections[0].contextLabel);
assert.ok(pivotMeasure);
assert.equal(pivotDescriptor.type, 'modulation');
assert.equal(pivotDescriptor.visible, true);
assert.ok(pivotDescriptor.text.indexOf('Pivot chord:') === 0);

const retargeted = app.retargetProgressionSection({
	data: data,
	domain: domain,
	progression: sectionB,
	sectionId: 'B',
	sectionState: state,
	targetReport: fMajorReport
});
const schedule = global.CodaProgressionPlaybackSchedule.buildProgressionPlaybackSchedule(retargeted, {
	instrument: 0,
	startIndex: 0,
	voices: 4
});

assert.deepEqual(retargeted.sections.map(function (section) { return section.id; }), ['A', 'B']);
assert.equal(retargeted.sections[1].contextTonicName, 'F');
assert.equal(retargeted.sections[1].contextScaleIndex, 0);
assert.equal(retargeted.sections[1].modulation, undefined);
assert.equal(retargeted.measures.length, 8);
assert.deepEqual(retargeted.measures.map(function (measure) { return measure.bar; }), [1, 2, 3, 4, 5, 6, 7, 8]);
assert.ok(retargeted.measures.every(function (measure, index) {
	return index === 0 || Number(measure.startSeconds) >= Number(retargeted.measures[index - 1].startSeconds);
}));
assert.ok(schedule.length >= retargeted.measures.length);

console.log('Progression section flow smoke tests passed');

function reportFor(tonicName, scaleIndex, preferFlats) {
	return app.buildScaleReport({
		data: data,
		domain: domain,
		preferFlats: preferFlats,
		scaleIndex: scaleIndex,
		scaleName: data.scales[scaleIndex].nombre,
		tonicIndex: noteIndex(tonicName),
		tonicName: tonicName
	});
}

function noteIndex(noteName) {
	for (let i = 0; i < data.notes.length; i++) {
		if (data.notes[i].nombre === noteName || data.notes[i].enarmonica === noteName) {
			return i;
		}
	}

	return 0;
}

function sequenceRng(values) {
	let index = 0;

	return function () {
		const value = values[index % values.length];
		index += 1;
		return value;
	};
}
