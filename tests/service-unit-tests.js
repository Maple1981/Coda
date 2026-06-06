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
loader.runScript('js/ui/progression-generation-events-controller.js');
loader.runScript('js/ui/circle-of-fifths-popover-controller.js');
loader.runScript('js/ui/workbench-instrument-menu-controller.js');
loader.runScript('js/ui/scale-report-ui.js');

const global = context.window;

const originalJson = {
	items: [{ value: 1 }]
};
const clonedJson = global.CodaProgressionObjects.cloneJson(originalJson);
clonedJson.items[0].value = 2;
assert.equal(originalJson.items[0].value, 1);
assert.equal(global.CodaProgressionObjects.cloneJson(null), null);

assert.deepEqual(global.CodaCircleOfFifthsTargets.targetFromId('F_'), {
	preferFlats: false,
	scaleIndex: 0,
	tonicName: 'F'
});
assert.deepEqual(global.CodaCircleOfFifthsTargets.targetFromId('Bb_m'), {
	preferFlats: true,
	scaleIndex: 2,
	tonicName: 'Bb'
});

let reportOptions = null;
const targetReport = global.CodaCircleOfFifthsTargets.reportForTarget({
	application: {
		buildScaleReport: function (options) {
			reportOptions = options;
			return {
				ok: true,
				scaleIndex: options.scaleIndex,
				tonicName: options.tonicName
			};
		}
	},
	data: global.CodaData,
	domain: global.CodaDomain,
	keyNavigation: {
		findNoteValue: function (notes, noteName) {
			return noteName === 'Bb' ? 10 : -1;
		}
	},
	targetId: 'Bb_m'
});
assert.deepEqual(targetReport, {
	ok: true,
	scaleIndex: 2,
	tonicName: 'Bb'
});
assert.equal(reportOptions.preferFlats, true);
assert.equal(reportOptions.scaleName, global.CodaData.scales[2].nombre);
assert.equal(reportOptions.tonicIndex, 10);

const sections = [
	{
		id: 'A',
		length: 4,
		startIndex: 0
	},
	{
		contrast: true,
		contextLabel: 'F mayor',
		contextScaleIndex: 0,
		contextScaleName: 'Mayor',
		contextTonicName: 'F',
		id: 'B',
		length: 4,
		modulation: {
			kind: 'pivot',
			originSectionId: 'A',
			pivotDegree: 'iii',
			targetContextLabel: 'F mayor',
			targetScaleIndex: 0,
			targetSectionId: 'B',
			targetTonicName: 'F'
		},
		startIndex: 4
	}
];
const progression = {
	measures: [
		{ bar: 1 },
		{ bar: 2 },
		{ bar: 3 },
		{
			bar: 4,
			modulationKind: 'pivot',
			pivotTargetDegree: 'iii',
			sectionId: 'A',
			sourceLabelKey: 'progression.modulation.pivot'
		},
		{ bar: 5, sectionId: 'B' }
	],
	sections: sections
};

assert.deepEqual(global.CodaProgressionSectionDocument.sectionRange(sections[0], 5), {
	end: 4,
	length: 4,
	start: 0
});
assert.equal(global.CodaProgressionSectionDocument.sectionEndIndex(sections[1]), 8);
assert.equal(global.CodaProgressionSectionDocument.previousSection(progression, 'B').id, 'A');
assert.equal(global.CodaProgressionSectionDocument.nextSection(progression, 'A').id, 'B');
assert.equal(global.CodaProgressionSectionDocument.sectionTransitionFromOrigin(sections, 'A', 'pivot').id, 'B');
assert.equal(global.CodaProgressionSectionDocument.sectionTransitionForTarget(sections, 'B', 'pivot').id, 'B');

const analysis = global.CodaProgressionHarmonicAnalysis.analyze(progression);
assert.equal(analysis.version, 1);
assert.equal(analysis.transitions.length, 1);
assert.equal(analysis.transitions[0].originSectionId, 'A');
assert.equal(analysis.transitions[0].targetContext.label, 'F mayor');
assert.deepEqual(analysis.measures[3].source, {
	kind: 'pivot',
	labelKey: 'progression.modulation.pivot',
	targetContext: {
		label: 'F mayor',
		scaleIndex: 0,
		scaleName: 'Mayor',
		tonicName: 'F'
	},
	targetDegree: 'iii',
	type: 'modulation'
});
assert.equal(global.CodaProgressionHarmonicAnalysis.sourceForChord({
	chromaticRole: 'neapolitan',
	sectionId: 'A',
	source: 'chromatic',
	sourceLabelKey: 'progression.chromatic.neapolitan'
}, { sections: sections }).type, 'chromatic');
const pivotLabelDescriptor = global.CodaProgressionAnalysisLabels.sourceLabelDescriptor(progression.measures[3], {
	i18n: {
		t: function (key) {
			return {
				'data.scales.0': 'Major',
				'progression.modulation.inKey': 'in',
				'progression.modulation.pivot': 'pivot chord'
			}[key] || key;
		}
	},
	notation: global.CodaNotation,
	notationStyle: 'anglosaxon',
	sections: sections
});
assert.equal(pivotLabelDescriptor.type, 'modulation');
assert.equal(pivotLabelDescriptor.visible, true);
assert.equal(pivotLabelDescriptor.text, 'Pivot chord: iii in F Major');
assert.equal(global.CodaProgressionAnalysisLabels.sourceLabelDescriptor({ source: 'diatonic' }, { sections: sections }).visible, false);

const fakeRoot = {
	querySelector: function (selector) {
		return selector === '#progressionNextSectionModulationType' ? { value: 'pivot' } : null;
	}
};
assert.equal(global.CodaProgressionGenerationEvents.modulationTypeForSection(fakeRoot, 'contrast'), 'pivot');
assert.equal(global.CodaProgressionGenerationEvents.modulationTypeForSection(fakeRoot, 'variation'), 'none');
const cMajorReportForPivots = reportFor('C', 0, false);
const gMajorReportForPivots = reportFor('G', 0, false);
const commonPivots = global.CodaProgressionSectionModulation.commonPivotChords(cMajorReportForPivots, gMajorReportForPivots);
const splitOriginMeasures = [
	{
		bar: 1,
		chordName: 'C',
		degree: 'I',
		durationBeats: 4,
		durationSeconds: 2,
		startBeat: 0,
		startSeconds: 0
	},
	{
		bar: 2,
		chordName: 'F',
		chords: [
			{
				bar: 2,
				chordName: 'F',
				degree: 'IV',
				durationBeats: 2,
				durationSeconds: 1,
				startBeat: 4,
				startSeconds: 2
			},
			{
				bar: 2,
				chordName: 'Am',
				degree: 'vi',
				durationBeats: 2,
				durationSeconds: 1,
				startBeat: 6,
				startSeconds: 3
			}
		],
		degree: 'IV',
		durationBeats: 4,
		durationSeconds: 2,
		startBeat: 4,
		startSeconds: 2
	},
	{
		bar: 3,
		chordName: 'G',
		degree: 'V',
		durationBeats: 4,
		durationSeconds: 2,
		startBeat: 8,
		startSeconds: 4
	}
];
const splitPivotModulation = global.CodaProgressionSectionModulation.prepare({
	dependencies: {
		generateProgressionFromState: function (options) {
			return {
				measures: options.rules.patterns[0].degrees.map(function (degree, index) {
					const chord = options.report.scaleChords[degree.index];

					return {
						bar: index + 1,
						chord: chord,
						chordName: chord.nombre,
						degree: options.report.scaleNotes[degree.index].grado,
						degreeIndex: degree.index,
						displayName: chord.nombre,
						durationBeats: 4,
						durationSeconds: 2,
						notes: chord.factorNotes || [chord.fundamental, chord.tercera, chord.quinta],
						source: 'diatonic',
						startBeat: index * 4,
						startSeconds: index * 2,
						tonalFunction: 'T'
					};
				})
			};
		}
	},
	originMeasures: splitOriginMeasures,
	originReport: cMajorReportForPivots,
	options: {
		data: global.CodaData,
		domain: global.CodaDomain,
		modulationType: 'pivot'
	},
	progressionState: {
		bars: 3,
		beatsPerBar: 4,
		bpm: 120,
		counterpoint: 70
	},
	rng: function () {
		return 0.99;
	},
	sectionMeasures: [{ bar: 4, chordName: 'G', degree: 'I' }],
	targetReport: gMajorReportForPivots
});
const splitPivotApplied = global.CodaProgressionSectionModulation.applyToCombinedMeasures(
	splitOriginMeasures,
	[{ bar: 4, chordName: 'G', degree: 'I', sectionId: 'B' }],
	splitPivotModulation
);
assert.ok(commonPivots.length >= 3);
assert.equal(splitPivotModulation.metadata.kind, 'pivot');
assert.equal(splitPivotModulation.metadata.pivotCount, 3);
assert.equal(splitPivotApplied[1].chords[0].modulationRole, 'pivot');
assert.equal(splitPivotApplied[1].chords[1].modulationRole, 'pivot');
assert.equal(splitPivotApplied[2].modulationRole, 'pivot');
assert.equal(splitPivotApplied[3].modulationRole, undefined);
assert.equal(splitPivotApplied[1].chords[0].durationBeats, 2);
assert.equal(splitPivotApplied[1].chords[1].startBeat, 6);
global.CodaProgressionSectionDocument.annotateSectionMeasures(splitPivotApplied, [
	{ id: 'A', labelKey: 'progression.sectionA', length: 3, startIndex: 0 },
	{
		contrast: true,
		contextLabel: 'G Major',
		contextScaleIndex: 0,
		contextScaleName: 'Mayor',
		contextTonicName: 'G',
		id: 'B',
		labelKey: 'progression.sectionB',
		length: 1,
		modulation: splitPivotModulation.metadata,
		startIndex: 3
	}
]);
assert.equal(splitPivotApplied[1].chords[0].sectionId, 'A');
assert.equal(global.CodaProgressionAnalysisLabels.sourceLabelDescriptor(splitPivotApplied[1].chords[0], {
	i18n: {
		t: function (key) {
			return {
				'data.scales.0': 'Major',
				'progression.modulation.inKey': 'in',
				'progression.modulation.pivot': 'pivot chord'
			}[key] || key;
		}
	},
	notation: global.CodaNotation,
	notationStyle: 'anglosaxon',
	sections: [
		{ id: 'A', labelKey: 'progression.sectionA', length: 3, startIndex: 0 },
		{
			contrast: true,
			contextLabel: 'G Major',
			contextScaleIndex: 0,
			contextScaleName: 'Mayor',
			contextTonicName: 'G',
			id: 'B',
			labelKey: 'progression.sectionB',
			length: 1,
			modulation: splitPivotModulation.metadata,
			startIndex: 3
		}
	]
}).visible, true);
assert.equal(global.CodaCircleOfFifthsPopover.triggerIdFor({ id: 'toggleCircleOfFifths' }), 'toggleCircleOfFifths');
assert.equal(global.CodaCircleOfFifthsPopover.triggerIdFor({
	getAttribute: function (name) {
		return name === 'data-section-circle' ? 'B' : '';
	}
}), 'section-B');

const fakeCircleRoot = createFakeCircleRoot();
const appliedTargets = [];
const circleController = global.CodaCircleOfFifthsPopover.initialize({
	notationStyle: function () {
		return 'anglosaxon';
	},
	onGlobalTarget: function (targetId) {
		appliedTargets.push('global:' + targetId);
		return true;
	},
	onSectionTarget: function (sectionId, targetId) {
		appliedTargets.push(sectionId + ':' + targetId);
		return true;
	},
	onTargetApplied: function () {
		appliedTargets.push('applied');
	},
	renderers: {
		circleOfFifths: {
			render: function (options) {
				return options.sectionId + ':' + options.selectedKey + ':' + options.orderedKeys.length;
			}
		}
	},
	report: function () {
		return {
			circleOfFifths: {
				orderedKeys: ['C_', 'G_'],
				selectedKey: 'C_'
			}
		};
	},
	root: fakeCircleRoot,
	sectionForId: function (sectionId) {
		return sectionId === 'B' ? {
			circleOfFifths: {
				orderedKeys: ['F_', 'C_'],
				selectedKey: 'F_'
			}
		} : null;
	}
});
fakeCircleRoot.dispatch('click', {
	target: fakeCircleRoot.globalTrigger,
	type: 'click'
});
assert.equal(circleController.isOpen(), true);
assert.equal(fakeCircleRoot.popover.hidden, false);
assert.equal(fakeCircleRoot.container.innerHTML, ':C_:2');
assert.equal(fakeCircleRoot.globalTrigger.getAttribute('aria-expanded'), 'true');
fakeCircleRoot.dispatch('click', {
	target: fakeCircleRoot.globalTrigger,
	type: 'click'
});
assert.equal(circleController.isOpen(), false);
assert.equal(fakeCircleRoot.globalTrigger.getAttribute('aria-expanded'), 'false');
fakeCircleRoot.dispatch('click', {
	target: fakeCircleRoot.sectionTrigger,
	type: 'click'
});
assert.equal(fakeCircleRoot.container.innerHTML, 'B:F_:2');
fakeCircleRoot.dispatch('click', {
	target: fakeCircleRoot.sectionLink,
	type: 'click'
});
assert.deepEqual(appliedTargets, ['B:F_', 'applied']);
fakeCircleRoot.dispatch('click', {
	target: fakeCircleRoot.globalTrigger,
	type: 'click'
});
fakeCircleRoot.dispatch('click', {
	target: fakeCircleRoot.globalLink,
	type: 'click'
});
assert.deepEqual(appliedTargets, ['B:F_', 'applied', 'global:G_', 'applied']);
circleController.updateAccess(null);
assert.equal(fakeCircleRoot.popover.hidden, true);

const fakeInstrumentRoot = createFakeInstrumentRoot();
const selectedInstruments = [];
const instrumentMenu = global.CodaWorkbenchInstrumentMenu.initialize({
	data: {
		midiInstruments: [
			{ id: 'piano', nombre: 'Piano' },
			{ id: 'organ&lead', nombre: 'Organ <Lead>' }
		]
	},
	i18n: null,
	onInstrumentSelected: function (instrumentId) {
		selectedInstruments.push(instrumentId);
	},
	root: fakeInstrumentRoot
});
instrumentMenu.render({ midiInstrument: 'organ&lead' });
assert.ok(fakeInstrumentRoot.menu.innerHTML.indexOf('organ&amp;lead') > -1);
assert.ok(fakeInstrumentRoot.menu.innerHTML.indexOf('Organ &lt;Lead&gt;') > -1);
fakeInstrumentRoot.dispatch('click', {
	target: fakeInstrumentRoot.contextToggle,
	type: 'click'
});
assert.equal(instrumentMenu.isOpen(), true);
assert.equal(fakeInstrumentRoot.contextToggle.getAttribute('aria-expanded'), 'true');
fakeInstrumentRoot.dispatch('click', {
	target: fakeInstrumentRoot.item,
	type: 'click'
});
assert.deepEqual(selectedInstruments, ['drawbar_organ']);
assert.equal(instrumentMenu.isOpen(), false);

const previousDocument = global.document;
const fakePianoViewport = {
	clientWidth: 240,
	scrollLeft: 0,
	scrollWidth: 1400
};
const fakeC3Key = {
	offsetLeft: 600,
	offsetWidth: 24
};
const fakeC3Note = {
	closest: function (selector) {
		return selector === '.pianoKey' ? fakeC3Key : null;
	}
};
global.document = {
	querySelector: function (selector) {
		if (selector === '#instrumento .instrumentScaleViewport') {
			return fakePianoViewport;
		}
		if (selector === '#instrumento .pianoKeyboard [data-midi-note="60"]') {
			return fakeC3Note;
		}

		return null;
	}
};
global.CodaUi.scrollPianoToDefaultOctave();
assert.equal(fakePianoViewport.scrollLeft, 492);
global.document = previousDocument;

console.log('Service unit tests passed');

function createFakeCircleRoot() {
	const listeners = {};
	const elements = {};
	const root = {
		addEventListener: function (eventName, handler) {
			listeners[eventName] = listeners[eventName] || [];
			listeners[eventName].push(handler);
		},
		dispatch: function (eventName, event) {
			(listeners[eventName] || []).forEach(function (handler) {
				handler(event);
			});
		},
		querySelector: function (selector) {
			return elements[selector] || null;
		},
		querySelectorAll: function (selector) {
			return selector === '.progressionSectionCircleButton' ? [root.sectionTrigger] : [];
		}
	};

	root.popover = fakeElement('circleOfFifthsPopover');
	root.popover.hidden = true;
	root.popover.offsetHeight = 260;
	root.popover.offsetWidth = 300;
	root.popover.querySelector = function () { return null; };
	root.popover.getBoundingClientRect = function () {
		return { bottom: 0, left: 0, top: 0 };
	};
	root.popover.closest = function (selector) {
		return selector === '.circlePopover__surface' ? root.popover : null;
	};
	root.popover.style = {};
	root.container = fakeElement('circuloQuintas');
	root.globalTrigger = fakeElement('toggleCircleOfFifths');
	root.globalTrigger.getBoundingClientRect = function () {
		return { bottom: 20, left: 20, top: 0 };
	};
	root.sectionTrigger = fakeElement('sectionCircleB');
	root.sectionTrigger.getAttribute = function (name) {
		if (name === 'data-section-circle') {
			return 'B';
		}
		return this.attributes[name];
	};
	root.sectionTrigger.closest = function (selector) {
		return selector === '.progressionSectionCircleButton' ? root.sectionTrigger : null;
	};
	root.sectionTrigger.getBoundingClientRect = function () {
		return { bottom: 20, left: 20, top: 0 };
	};
	root.sectionLink = fakeElement('sectionCircleF');
	root.sectionLink.id = 'F_';
	root.sectionLink.setAttribute('data-section-circle-target', 'B');
	root.sectionLink.closest = function (selector) {
		if (selector === '.revamp') {
			return root.sectionLink;
		}
		if (selector === '.circlePopover__surface') {
			return root.popover;
		}
		return null;
	};
	root.globalLink = fakeElement('globalCircleG');
	root.globalLink.id = 'G_';
	root.globalLink.closest = function (selector) {
		if (selector === '.revamp') {
			return root.globalLink;
		}
		if (selector === '.circlePopover__surface') {
			return root.popover;
		}
		return null;
	};

	elements['#circleOfFifthsPopover'] = root.popover;
	elements['#circuloQuintas'] = root.container;
	elements['#toggleCircleOfFifths'] = root.globalTrigger;
	elements['#toggleCircleOfFifthsFromContext'] = fakeElement('toggleCircleOfFifthsFromContext');
	elements['#toggleCircleOfFifthsFromForm'] = fakeElement('toggleCircleOfFifthsFromForm');
	elements['#workbenchContextKeyToggle'] = fakeElement('workbenchContextKeyToggle');
	elements['.circlePopover__titlebar'] = null;

	return root;
}

function reportFor(tonicName, scaleIndex, preferFlats) {
	return global.CodaApplication.buildScaleReport({
		data: global.CodaData,
		domain: global.CodaDomain,
		preferFlats: preferFlats,
		scaleIndex: scaleIndex,
		scaleName: global.CodaData.scales[scaleIndex].nombre,
		tonicIndex: noteIndex(tonicName),
		tonicName: tonicName
	});
}

function noteIndex(noteName) {
	for (let i = 0; i < global.CodaData.notes.length; i++) {
		if (global.CodaData.notes[i].nombre === noteName || global.CodaData.notes[i].enarmonica === noteName) {
			return i;
		}
	}

	return 0;
}

function createFakeInstrumentRoot() {
	const listeners = {};
	const elements = {};
	const root = {
		addEventListener: function (eventName, handler) {
			listeners[eventName] = listeners[eventName] || [];
			listeners[eventName].push(handler);
		},
		dispatch: function (eventName, event) {
			(listeners[eventName] || []).forEach(function (handler) {
				handler(event);
			});
		},
		querySelector: function (selector) {
			return elements[selector] || null;
		}
	};

	root.menu = fakeElement('workbenchInstrumentMenu');
	root.menu.hidden = true;
	root.contextToggle = fakeElement('workbenchContextInstrumentToggle');
	root.contextToggle.closest = function (selector) {
		return selector === '#workbenchContextInstrumentToggle' ? root.contextToggle : null;
	};
	root.item = fakeElement('drawbarOrganItem');
	root.item.setAttribute('data-workbench-instrument-id', 'drawbar_organ');
	root.item.closest = function (selector) {
		return selector === '.workbenchInstrumentMenuItem' ? root.item : null;
	};
	elements['#workbenchInstrumentMenu'] = root.menu;
	elements['#toggleWorkbenchInstrumentMenu'] = fakeElement('toggleWorkbenchInstrumentMenu');
	elements['#workbenchContextInstrumentToggle'] = root.contextToggle;
	elements['#toggleWorkbenchInstrumentMenu .material-icons'] = fakeElement('instrumentMenuIcon');

	return root;
}

function fakeElement(id) {
	return {
		attributes: {},
		classList: {
			add: function () {},
			remove: function () {}
		},
		closest: function (selector) {
			return selector.charAt(0) === '#' && selector.slice(1) === id ? this : null;
		},
		getAttribute: function (name) {
			return this.attributes[name];
		},
		id: id,
		innerHTML: '',
		offsetHeight: 0,
		offsetWidth: 0,
		style: {}
		,
		setAttribute: function (name, value) {
			this.attributes[name] = String(value);
		},
		textContent: ''
	};
}
