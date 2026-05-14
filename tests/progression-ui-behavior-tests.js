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
context.window.addEventListener = function () {};
const pendingTimers = [];
context.window.setTimeout = function (callback) {
	const timer = {
		callback: callback,
		cleared: false
	};
	pendingTimers.push(timer);
	return timer;
};
context.window.clearTimeout = function (timer) {
	if (timer) {
		timer.cleared = true;
	}
};
vm.createContext(context);

const loader = createScriptLoader(root, context);
loader.runManifestRange('js/data/constants-data.js', 'js/ui/scale-report-controller.js');

const data = context.window.CodaData;
const controller = context.window.CodaScaleReportController;
const document = createFakeDocument();
context.window.document = document;

const rendered = {
	instrument: 0,
	progression: 0,
	scaleReport: 0
};
const playbackInstruments = [];
const savedPreferences = {};
const options = {
	application: context.window.CodaApplication,
	chordPlayback: {
		playChordFromCellId: function () {}
	},
	data: data,
	domain: context.window.CodaDomain,
	initialForm: {
		format: '0',
		midiInstrument: 'acoustic_grand_piano',
		scaleIndex: '0',
		tonicIndex: '0'
	},
	initialNotation: 'anglosaxon',
	instrumentPlayback: {
		playMidiNote: function () {}
	},
	keyNavigation: {
		applyRecommendedNotation: function () {},
		navigateToLinkedKey: function () {}
	},
	musicalContext: context.window.CodaMusicalContext.create({
		data: data
	}),
	notation: context.window.CodaNotation,
	playbackService: {
		setInstrument: function (instrumentId) {
			playbackInstruments.push(instrumentId);
		}
	},
	preferences: {
		setValue: function (key, value) {
			savedPreferences[key] = value;
		}
	},
	progressionState: context.window.CodaProgressionState,
	renderers: {},
	ui: createFakeUi(document, rendered)
};

const initialized = controller.initialize(options);
const initialState = initialized.uiState.getProgressionState();
const initialProgression = initialized.uiState.getProgression();

assert.equal(rendered.scaleReport, 1);
assert.equal(rendered.instrument, 1);
assert.equal(rendered.progression, 1);
assert.equal(playbackInstruments[playbackInstruments.length - 1], 'acoustic_grand_piano');
assert.deepEqual(initialState, {
	articulation: 'sustain',
	bars: 8,
	beatsPerBar: 4,
	beatUnit: 4,
	bpm: 120,
	counterpoint: 20,
	meter: '4/4',
	modalInterchange: 25,
	style: 'modern',
	tensions: 35,
	voicing: 'closed',
	voices: 4
});
assert.equal(initialProgression.bars, 8);
assert.equal(initialProgression.meter, '4/4');
assert.equal(initialProgression.totalBeats, 32);
assert.equal(initialProgression.totalSeconds, 16);
assert.deepEqual(initialProgression.measures.map(function (measure) { return measure.degree; }), ['I', 'vi 6', 'ii', 'V 6/4', 'I 6', 'IV', 'V 6/4', 'I 6']);
assert.deepEqual(initialProgression.measures.map(function (measure) { return measure.chordName; }), ['C', 'Am', 'Dm', 'G', 'C', 'F', 'G', 'C']);
assert.deepEqual(initialProgression.measures.map(function (measure) { return measure.tonalFunction; }), ['T', 'T', 'SD', 'D', 'T', 'SD', 'D', 'T']);

document.getElementById('progressionTensions').value = '44';
document.querySelector('.progressionControls').dispatchEvent({
	target: document.getElementById('progressionTensions'),
	type: 'input'
});
assert.equal(initialized.uiState.getProgressionState().tensions, 35);
assert.equal(rendered.progression, 1);
runPendingTimers();
assert.equal(initialized.uiState.getProgressionState().tensions, 44);
assert.equal(savedPreferences.progressionTensions, '44');
assert.equal(rendered.progression, 2);

document.getElementById('progressionBars').value = '4';
document.getElementById('progressionMeter').value = '3/4';
document.getElementById('progressionBpm').value = '120';
document.getElementById('progressionVoices').value = '3';
document.getElementById('progressionArticulation').value = 'staccato';
document.getElementById('progressionStyle').value = 'classic';
document.getElementById('progressionTensions').value = '60';
document.querySelector('.progressionControls').dispatchEvent({
	target: document.getElementById('progressionBars'),
	type: 'change'
});

const changedState = initialized.uiState.getProgressionState();
const changedProgression = initialized.uiState.getProgression();

assert.equal(changedState.bars, 4);
assert.equal(changedState.meter, '3/4');
assert.equal(changedState.bpm, 120);
assert.equal(changedState.voices, 3);
assert.equal(changedState.articulation, 'staccato');
assert.equal(changedState.style, 'classic');
assert.equal(changedState.tensions, 60);
assert.equal(changedProgression.bars, 4);
assert.deepEqual(savedPreferences, {
	progressionArticulation: 'staccato',
	progressionBars: '4',
	progressionBpm: '120',
	progressionCounterpoint: '20',
	progressionMeter: '3/4',
	progressionModalInterchange: '25',
	progressionStyle: 'classic',
	progressionTensions: '60',
	progressionVoicing: 'closed',
	progressionVoices: '3'
});
assert.equal(document.getElementById('undoChange').disabled, false);
assert.equal(document.getElementById('redoChange').disabled, true);
assert.equal(changedProgression.meter, '3/4');
assert.equal(changedProgression.totalBeats, 12);
assert.equal(changedProgression.totalSeconds, 6);
assert.equal(rendered.progression, 3);
assert.deepEqual(changedProgression.measures.map(function (measure) { return measure.degree; }), ['I', 'IV 6/4', 'V 6', 'I']);
assert.deepEqual(changedProgression.measures.map(function (measure) { return measure.chordName; }), ['C', 'F', 'G', 'C']);
assert.deepEqual(changedProgression.measures.map(function (measure) { return measure.tonalFunction; }), ['T', 'SD', 'D', 'T']);
document.getElementById('progressionLoop').checked = true;
document.getElementById('progressionLoop').dispatchEvent({
	target: document.getElementById('progressionLoop'),
	type: 'change'
});
assert.equal(rendered.progression, 3);
assert.strictEqual(initialized.uiState.getProgression(), changedProgression);
assert.deepEqual(changedProgression.measures[1], {
	articulation: 'staccato',
	bar: 2,
	beatUnit: 4,
	chord: initialized.uiState.getReport().scaleChords[3],
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
assert.deepEqual(changedProgression.harmonicColor, {
	counterpoint: 20,
	modalInterchange: 25,
	tensions: 60
});

document.getElementById('undoChange').dispatchEvent({
	target: document.getElementById('undoChange'),
	type: 'click'
});
assert.equal(initialized.uiState.getProgressionState().bars, 8);
assert.equal(initialized.uiState.getProgression().bars, 8);
assert.equal(document.getElementById('undoChange').disabled, true);
assert.equal(document.getElementById('redoChange').disabled, false);

document.getElementById('redoChange').dispatchEvent({
	target: document.getElementById('redoChange'),
	type: 'click'
});
assert.equal(initialized.uiState.getProgressionState().bars, 4);
assert.equal(initialized.uiState.getProgression().bars, 4);
assert.equal(document.getElementById('undoChange').disabled, false);
assert.equal(document.getElementById('redoChange').disabled, true);

document.dispatchDocumentEvent({
	ctrlKey: true,
	key: 'z',
	preventDefault: function () {
		this.preventDefaultCalled = true;
	},
	target: document.body,
	type: 'keydown'
});
assert.equal(initialized.uiState.getProgressionState().bars, 8);

document.dispatchDocumentEvent({
	ctrlKey: true,
	key: 'z',
	preventDefault: function () {
		this.preventDefaultCalled = true;
	},
	shiftKey: true,
	target: document.body,
	type: 'keydown'
});
assert.equal(initialized.uiState.getProgressionState().bars, 4);

const focusedSelect = createFakeElement('focused-select');
focusedSelect.tagName = 'SELECT';
document.dispatchDocumentEvent({
	ctrlKey: true,
	key: 'z',
	preventDefault: function () {
		this.preventDefaultCalled = true;
	},
	target: focusedSelect,
	type: 'keydown'
});
assert.equal(initialized.uiState.getProgressionState().bars, 8);

const focusedTextInput = createFakeElement('focused-text');
focusedTextInput.tagName = 'INPUT';
focusedTextInput.type = 'text';
document.dispatchDocumentEvent({
	ctrlKey: true,
	key: 'z',
	preventDefault: function () {
		this.preventDefaultCalled = true;
	},
	target: focusedTextInput,
	type: 'keydown'
});
assert.equal(initialized.uiState.getProgressionState().bars, 8);

const editedProgression = Object.assign({}, initialized.uiState.getProgression(), {
	userEdited: true
});
const scaleReportsBeforeInstrumentChange = rendered.scaleReport;
const progressionRendersBeforeInstrumentChange = rendered.progression;
const instrumentRendersBeforeInstrumentChange = rendered.instrument;
initialized.uiState.setProgression(editedProgression);
document.getElementById('instrumentoSonoro').value = 'drawbar_organ';
document.getElementById('instrumentoSonoro').dispatchEvent({
	target: document.getElementById('instrumentoSonoro'),
	type: 'change'
});
assert.strictEqual(initialized.uiState.getProgression(), editedProgression);
assert.equal(rendered.scaleReport, scaleReportsBeforeInstrumentChange);
assert.equal(rendered.progression, progressionRendersBeforeInstrumentChange);
assert.equal(rendered.instrument, instrumentRendersBeforeInstrumentChange + 1);
assert.equal(initialized.uiState.getSelection().midiInstrument, 'drawbar_organ');
assert.equal(playbackInstruments[playbackInstruments.length - 1], 'drawbar_organ');
assert.equal(savedPreferences.midiInstrument, 'drawbar_organ');

document.dispatchDocumentEvent({
	target: document.getElementById('workbenchContextInstrumentToggle'),
	type: 'click'
});
assert.equal(document.getElementById('workbenchInstrumentMenu').hidden, false);
assert.equal(document.getElementById('workbenchContextInstrumentToggle').getAttribute('aria-expanded'), 'true');
document.dispatchDocumentEvent({
	target: document.getElementById('workbenchContextInstrumentToggle'),
	type: 'click'
});
assert.equal(document.getElementById('workbenchInstrumentMenu').hidden, true);
assert.equal(document.getElementById('workbenchContextInstrumentToggle').getAttribute('aria-expanded'), 'false');

console.log('Progression UI behavior tests passed');

function createFakeUi(fakeDocument, renderedCounter) {
	return {
		hasRenderedResults: function () {
			return renderedCounter.scaleReport > 0;
		},
		readSelection: function (sourceData) {
			const formatInput = fakeDocument.querySelector('#interface input[type="radio"][name="formato"]:checked');
			const scaleIndex = parseInt(fakeDocument.getElementById('escala').value, 10);
			const tonicIndex = parseInt(fakeDocument.getElementById('tonica').value, 10);
			const midiInstrument = fakeDocument.getElementById('instrumentoSonoro').value;
			const midiInstrumentDefinition = sourceData.midiInstruments.find(function (instrument) {
				return instrument.id === midiInstrument;
			});
			const preferFlats = formatInput ? formatInput.value === '1' : false;
			const tonicDefinition = sourceData.notes[tonicIndex];

			return {
				instrument: midiInstrumentDefinition ? midiInstrumentDefinition.viewInstrument : '1',
				midiInstrument: midiInstrument,
				preferFlats: preferFlats,
				scaleIndex: scaleIndex,
				scaleName: sourceData.scales[scaleIndex].nombre,
				tonicIndex: tonicIndex,
				tonicName: preferFlats && tonicDefinition.enarmonica ? tonicDefinition.enarmonica : tonicDefinition.nombre
			};
		},
		renderInstrument: function () {
			renderedCounter.instrument += 1;
		},
		renderProgression: function () {
			renderedCounter.progression += 1;
		},
		renderScaleReport: function () {
			renderedCounter.scaleReport += 1;
		},
		scheduleDashboardWorkspaceHeight: function () {},
		scheduleInstrumentScale: function () {},
		scheduleSidebarPanelViewport: function () {}
	};
}

function runPendingTimers() {
	while (pendingTimers.length) {
		const timer = pendingTimers.shift();

		if (!timer.cleared) {
			timer.callback();
		}
	}
}

function createFakeDocument() {
	const elements = {};
	const fakeDocument = createFakeElement('document');
	const documentListeners = {};
	fakeDocument.body = createFakeElement('body');
	fakeDocument.addEventListener = function (eventName, handler) {
		documentListeners[eventName] = documentListeners[eventName] || [];
		documentListeners[eventName].push(handler);
	};
	fakeDocument.dispatchDocumentEvent = function (event) {
		const handlers = documentListeners[event.type] || [];
		handlers.forEach(function (handler) {
			handler(event);
		});
	};
	fakeDocument.getElementById = function (id) {
		return elements[id] || null;
	};
	fakeDocument.querySelector = function (selector) {
		if (selector === 'select#escala') {
			return elements.escala;
		}

		if (selector === 'select#tonica') {
			return elements.tonica;
		}

		if (selector === '#interface input[type="radio"][name="formato"]:checked') {
			return elements.sostenidos.checked ? elements.sostenidos : elements.bemoles;
		}

	if (selector === '.progressionControls') {
		return elements.progressionControls;
	}

	if (selector === '.workbenchContext') {
		return elements.workbenchContext;
	}

	if (selector === '.workbenchContextKey') {
		return elements.workbenchContextKeyToggle;
	}

	if (selector === '.workbenchContextInstrument') {
		return elements.workbenchContextInstrumentToggle;
	}

		if (selector.charAt(0) === '#' && selector.indexOf(' ') === -1) {
			return elements[selector.slice(1)] || null;
		}

		return null;
	};
	fakeDocument.querySelectorAll = function (selector) {
		if (selector === '#tonica, #escala') {
			return [elements.tonica, elements.escala];
		}

		if (selector === '#interface input[type="radio"][name="formato"]') {
			return [elements.sostenidos, elements.bemoles];
		}

		const element = fakeDocument.querySelector(selector);

		return element ? [element] : [];
	};

	addElement('interface');
	addElement('herramientasTeoricas');
	addElement('constructorProgresiones');
	addElement('progressionControls');
	addElement('workbenchContext');
	addElement('workbenchContextKeyToggle');
	addElement('workbenchContextInstrumentToggle');
	addElement('workbenchInstrumentMenu').hidden = true;
	addElement('toggleWorkbenchInstrumentMenu');
	addElement('toggleCircleOfFifthsFromContext');
	addElement('toggleTheoryControls');
	addElement('toggleScaleTheoryDetails');
	addElement('undoChange');
	addElement('redoChange');
	addElement('formatoLabel');
	addElement('selectorIdioma', 'es');
	addElement('selectorNotacion', 'anglosaxon');
	addElement('tonica', '0');
	addElement('escala', '0');
	addElement('instrumentoSonoro', 'acoustic_grand_piano');
	addRadio('sostenidos', '0', true);
	addRadio('bemoles', '1', false);
	addElement('progressionArticulation', 'sustain');
	addElement('progressionBars', '8');
	addElement('progressionBpm', '120');
	addElement('progressionCounterpoint', '20');
	addElement('progressionMeter', '4/4');
	addElement('progressionModalInterchange', '25');
	addElement('progressionStyle', 'modern');
	addElement('progressionTensions', '35');
	addElement('progressionVoicing', 'closed');
	addElement('progressionVoices', '4');
	addElement('progressionLoop');
	addElement('progressionMetronome');

	return fakeDocument;

	function addElement(id, value) {
		elements[id] = createFakeElement(id, value);
		return elements[id];
	}

	function addRadio(id, value, checked) {
		const element = addElement(id, value);
		element.checked = checked;
		element.name = 'formato';
		element.type = 'radio';
		return element;
	}
}

function createFakeElement(id, value) {
	const listeners = {};
	const attributes = {};
	const classes = {};

	return {
		checked: false,
		classList: {
			add: function (className) {
				classes[className] = true;
			},
			contains: function (className) {
				return classes[className] === true;
			},
			remove: function (className) {
				delete classes[className];
			},
			toggle: function (className) {
				classes[className] = !classes[className];
				return classes[className];
			}
		},
		closest: function (selector) {
			if (selector.charAt(0) === '#' && selector.slice(1) === id) {
				return this;
			}

			return null;
		},
		addEventListener: function (eventName, handler) {
			listeners[eventName] = listeners[eventName] || [];
			listeners[eventName].push(handler);
		},
		dispatchEvent: function (event) {
			const eventName = event.type || event;
			const handlers = listeners[eventName] || [];
			const normalizedEvent = typeof event === 'string' ? { type: eventName } : event;
			normalizedEvent.currentTarget = this;
			normalizedEvent.target = normalizedEvent.target || this;
			handlers.forEach(function (handler) {
				handler(normalizedEvent);
			});
		},
		getAttribute: function (name) {
			return attributes[name];
		},
		id: id,
		innerHTML: '',
		nodeType: 1,
		querySelector: function () {
			return null;
		},
		setAttribute: function (name, nextValue) {
			attributes[name] = String(nextValue);
		},
		textContent: '',
		value: value || ''
	};
}
