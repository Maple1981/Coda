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
assert.equal(global.CodaCircleOfFifthsPopover.triggerIdFor({ id: 'toggleCircleOfFifths' }), 'toggleCircleOfFifths');
assert.equal(global.CodaCircleOfFifthsPopover.triggerIdFor({
	getAttribute: function (name) {
		return name === 'data-section-circle' ? 'B' : '';
	}
}), 'section-B');

const fakeCircleRoot = createFakeCircleRoot();
const appliedTargets = [];
const circleController = global.CodaCircleOfFifthsPopover.initialize({
	onSectionTarget: function (sectionId, targetId) {
		appliedTargets.push(sectionId + ':' + targetId);
		return true;
	},
	onTargetApplied: function () {
		appliedTargets.push('applied');
	},
	root: fakeCircleRoot
});
fakeCircleRoot.dispatch('click', {
	target: fakeCircleRoot.sectionLink,
	type: 'click'
});
assert.deepEqual(appliedTargets, ['B:F_', 'applied']);
circleController.updateAccess(null);
assert.equal(fakeCircleRoot.popover.hidden, true);

console.log('Service unit tests passed');

function createFakeCircleRoot() {
	const listeners = {};
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
			if (selector === '#circleOfFifthsPopover') {
				return root.popover;
			}
			if (selector === '.circlePopover__titlebar') {
				return null;
			}
			return null;
		},
		querySelectorAll: function () {
			return [];
		}
	};

	root.popover = {
		hidden: false,
		setAttribute: function () {},
		style: {}
	};
	root.sectionLink = {
		closest: function (selector) {
			return selector === '.revamp' ? root.sectionLink : null;
		},
		getAttribute: function (name) {
			return name === 'data-section-circle-target' ? 'B' : '';
		},
		id: 'F_'
	};

	return root;
}
