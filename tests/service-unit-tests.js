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
