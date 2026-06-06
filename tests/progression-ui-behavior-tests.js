const assert = require('assert');
const path = require('path');
const vm = require('vm');
const { createScriptLoader } = require('./helpers/script-loader');

const root = path.resolve(__dirname, '..');
const context = {
	console,
	Event: function (eventName, options) {
		this.type = eventName;
		this.bubbles = options && options.bubbles === true;
	},
	window: {}
};
context.window.window = context.window;
context.window.addEventListener = function () {};
const pendingTimers = [];
context.window.setTimeout = function (callback, delay) {
	const timer = {
		callback: callback,
		cleared: false
	};
	timer.delay = delay || 0;
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
	scaleReport: 0,
	scaleReportOptions: null
};
const playbackInstruments = [];
const playedScaleMidiNotes = [];
const savedPreferences = {};
const savedWorkspaces = [];
let playbackPlaying = false;
const playbackHeadUpdates = [];
let transportStops = 0;
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
		playMidiNote: function (midiNote) {
			playedScaleMidiNotes.push(midiNote);
		}
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
	progressionTransport: {
		initialize: function () {
			return {
				isPlaying: function () {
					return playbackPlaying;
				},
				refreshInspector: function () {},
				setPlaybackHead: function (index) {
					playbackHeadUpdates.push(index);
				},
				stop: function () {
					transportStops += 1;
					playbackPlaying = false;
				}
			};
		}
	},
	progressionWorkspaceStorage: {
		buildWorkspace: context.window.CodaProgressionWorkspaceStorage.buildWorkspace,
		matchesSelection: context.window.CodaProgressionWorkspaceStorage.matchesSelection,
		write: function (workspace) {
			savedWorkspaces.push(workspace);
			return true;
		}
	},
	renderers: {},
	ui: createFakeUi(document, rendered)
};

const initialized = controller.initialize(options);
const initialState = initialized.uiState.getProgressionState();
const initialProgression = initialized.uiState.getProgression();

assert.equal(rendered.scaleReport, 1);
assert.equal(rendered.instrument, 1);
assert.equal(rendered.progression, 1);
assert.equal(typeof rendered.scaleReportOptions.onScaleNoteClick, 'function');
rendered.scaleReportOptions.onScaleNoteClick({
	getAttribute: function (name) {
		return name === 'data-midi-note' ? '60' : '';
	}
});
assert.equal(playedScaleMidiNotes[0], '60');
assert.equal(typeof rendered.scaleReportOptions.onScalePlaybackClick, 'function');
rendered.scaleReportOptions.onScalePlaybackClick({
	getAttribute: function (name) {
		return name === 'data-midi-notes' ? '60,62,64' : '';
	}
});
assert.deepEqual(pendingTimers.map(function (timer) { return timer.delay; }), [0, 410, 500, 910, 1000, 1410]);
runNextPendingTimer();
assert.equal(document.scaleDegreeNoteButtons[0].classList.contains('isPlayingScaleNote'), true);
assert.equal(document.scaleDegreeNoteButtons[1].classList.contains('isPlayingScaleNote'), false);
runNextPendingTimer();
assert.equal(document.scaleDegreeNoteButtons[0].classList.contains('isPlayingScaleNote'), false);
runPendingTimers();
assert.deepEqual(playedScaleMidiNotes, ['60', 60, 62, 64]);
assert.equal(document.scaleDegreeNoteButtons[2].classList.contains('isPlayingScaleNote'), false);
const originalQuerySelectorAll = document.querySelectorAll;
const bbbChordInstrumentNotes = ['A', 'B', 'D', 'E', 'Gb'].map(function (noteName) {
	const element = createFakeElement('instrument-' + noteName);
	element.setAttribute('data-note-name', noteName);
	return element;
});
document.querySelectorAll = function (selector) {
	if (selector === '.celdaNota span[data-note-name]') {
		return bbbChordInstrumentNotes;
	}

	return originalQuerySelectorAll(selector);
};
controller.highlightChord()({ id: 'Bbb-Cb-Ebb-Fb' });
assert.equal(bbbChordInstrumentNotes[0].classList.contains('resaltada'), true);
assert.equal(bbbChordInstrumentNotes[1].classList.contains('resaltada'), true);
assert.equal(bbbChordInstrumentNotes[2].classList.contains('resaltada'), true);
assert.equal(bbbChordInstrumentNotes[3].classList.contains('resaltada'), true);
assert.equal(bbbChordInstrumentNotes[4].classList.contains('resaltada'), false);
document.querySelectorAll = originalQuerySelectorAll;
assert.equal(playbackInstruments[playbackInstruments.length - 1], 'acoustic_grand_piano');
assert.deepEqual(initialState, {
	articulation: 'sustain',
	bars: 8,
	beatsPerBar: 4,
	beatUnit: 4,
	bpm: 120,
	chromaticism: 10,
	counterpoint: 20,
	generateMelodicVoice: false,
	harmonicDensity: 0,
	humanization: 0,
	intensity: 80,
	meter: '4/4',
	modalInterchange: 25,
	midiInstrument: 'acoustic_grand_piano',
	style: 'contemporary',
	swing: 0,
	tensions: 35,
	voicing: 'closed',
	voices: 4
});
assert.equal(initialProgression.bars, 8);
assert.equal(initialProgression.meter, '4/4');
assert.equal(initialProgression.totalBeats, 32);
assert.equal(initialProgression.totalSeconds, 16);
assert.ok(savedWorkspaces.length > 0);
assert.equal(savedWorkspaces[savedWorkspaces.length - 1].signature, '0|0|0');
assert.equal(savedWorkspaces[savedWorkspaces.length - 1].progression.measures.length, 8);
assert.deepEqual(initialProgression.measures.map(function (measure) { return structuralDegree(measure.degree); }), ['I', 'vi', 'ii', 'V', 'I', 'IV', 'V', 'I']);
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
document.getElementById('progressionHarmonicDensity').value = '0';
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
assert.equal(changedState.harmonicDensity, 0);
assert.equal(changedState.voices, 3);
assert.equal(changedState.articulation, 'staccato');
assert.equal(changedState.style, 'classic');
assert.equal(changedState.tensions, 60);
assert.equal(changedProgression.bars, 4);
assert.equal(changedProgression.harmonicDensity, 0);
assert.deepEqual(savedPreferences, {
	progressionArticulation: 'staccato',
	progressionBars: '4',
	progressionBpm: '120',
	progressionChromaticism: 10,
	progressionCounterpoint: 20,
	progressionGenerateMelodicVoice: false,
	progressionHarmonicDensity: '0',
	progressionHumanization: 0,
	progressionIntensity: 80,
	progressionMeter: '3/4',
	progressionModalInterchange: 25,
	progressionStyle: 'classic',
	progressionSwing: 0,
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
assert.deepEqual(measureWithoutMelody(changedProgression.measures[1]), {
	articulation: 'staccato',
	bar: 2,
	beatUnit: 4,
	beatsPerBar: 3,
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
	humanization: 0,
	intensity: 80,
	inversion: '6/4',
	inversionIndex: 2,
	midiNotes: [60, 65, 69],
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
		{ midiNote: 60, note: 'C', role: 'fifth' },
		{ midiNote: 65, note: 'F', role: 'root' },
		{ midiNote: 69, note: 'A', role: 'third' }
	],
	voiceLeading: {
		commonTones: 1,
		exteriorParallelPerfects: 0,
		parallelPerfects: 0,
		score: 0
	},
	voices: 3
});
assert.equal(changedProgression.generateMelodicVoice, false);
assert.equal(changedProgression.measures.some(function (measure) {
	return measure.melodyEvents && measure.melodyEvents.length;
}), false);
assert.deepEqual(changedProgression.harmonicColor, {
	chromaticism: 10,
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

const editedSourceProgression = initialized.uiState.getProgression();
const editedProgression = Object.assign({}, editedSourceProgression, {
	measures: editedSourceProgression.measures.map(function (measure, index) {
		if (index !== 0) {
			return measure;
		}

		return Object.assign({}, measure, {
			chords: [
				Object.assign({}, measure, { chordIndex: 0 }),
				Object.assign({}, measure, {
					chordIndex: 1,
					chordName: 'Am',
					degree: 'vi',
					displayName: 'Am',
					notes: ['A', 'C', 'E']
				})
			]
		});
	}),
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
assert.equal(initialized.uiState.getProgression().measures[0].chords.length, 2);

const progressionRendersBeforeEditedControlChange = rendered.progression;
document.getElementById('progressionBars').value = '16';
document.querySelector('.progressionControls').dispatchEvent({
	target: document.getElementById('progressionBars'),
	type: 'change'
});
assert.equal(initialized.uiState.getProgressionState().bars, 16);
assert.equal(initialized.uiState.getProgression().userEdited, true);
assert.equal(initialized.uiState.getProgression().measures[0].chords.length, 2);
assert.equal(initialized.uiState.getProgression().measures.length, 16);
assert.equal(initialized.uiState.getProgression().bars, 16);
assert.equal(initialized.uiState.getProgression().measures[15].bar, 16);
assert.equal(rendered.progression, progressionRendersBeforeEditedControlChange + 1);
assert.equal(savedWorkspaces[savedWorkspaces.length - 1].progression.userEdited, true);
assert.equal(savedWorkspaces[savedWorkspaces.length - 1].progression.measures[0].chords.length, 2);
assert.equal(savedWorkspaces[savedWorkspaces.length - 1].progression.measures.length, 16);

const workspaceCountBeforeSectionB = savedWorkspaces.length;
document.getElementById('constructorProgresiones').dispatchEvent({
	target: document.getElementById('generateProgressionSectionB'),
	type: 'click'
});
assert.ok(savedWorkspaces.length > workspaceCountBeforeSectionB);
assert.equal(savedWorkspaces[savedWorkspaces.length - 1].progression.userEdited, true);
assert.ok(savedWorkspaces[savedWorkspaces.length - 1].progression.sections.some(function (section) {
	return section.id === 'B';
}));
const sectionProgressionLength = initialized.uiState.getProgression().measures.length;
document.getElementById('progressionBpm').value = '132';
document.querySelector('.progressionControls').dispatchEvent({
	target: document.getElementById('progressionBpm'),
	type: 'change'
});
assert.equal(initialized.uiState.getProgressionState().bpm, 132);
assert.equal(initialized.uiState.getProgression().measures.length, sectionProgressionLength);
assert.ok(initialized.uiState.getProgression().sections.some(function (section) {
	return section.id === 'B';
}));
assert.equal(savedWorkspaces[savedWorkspaces.length - 1].progression.measures.length, sectionProgressionLength);

const sectionCircleProgressionBefore = initialized.uiState.getProgression();
const sectionCircleHeadUpdatesBefore = playbackHeadUpdates.length;
const sectionCircleIdsBefore = sectionCircleProgressionBefore.sections.map(function (section) {
	return section.id;
});
const sectionCircleLengthBefore = sectionCircleProgressionBefore.measures.length;
const sectionAChordNamesBefore = sectionCircleProgressionBefore.measures
	.slice(0, sectionCircleProgressionBefore.sections[0].length)
	.map(function (measure) { return measure.chordName; });
const sectionCircleLink = createFakeElement('sectionCircleF');
sectionCircleLink.id = 'F_';
sectionCircleLink.setAttribute('data-section-circle-target', 'B');
sectionCircleLink.closest = function (selector) {
	return selector === '.revamp' ? sectionCircleLink : null;
};
document.dispatchDocumentEvent({
	preventDefault: function () {},
	target: sectionCircleLink,
	type: 'click'
});
const sectionCircleProgressionAfter = initialized.uiState.getProgression();
const sectionBAfterCircle = sectionCircleProgressionAfter.sections.find(function (section) {
	return section.id === 'B';
});
assert.deepEqual(sectionCircleProgressionAfter.sections.map(function (section) {
	return section.id;
}), sectionCircleIdsBefore);
assert.equal(sectionCircleProgressionAfter.measures.length, sectionCircleLengthBefore);
assert.equal(sectionBAfterCircle.contextTonicName, 'F');
assert.equal(sectionBAfterCircle.contextScaleIndex, 0);
assert.equal(playbackHeadUpdates[playbackHeadUpdates.length - 1], 0);
assert.ok(playbackHeadUpdates.length > sectionCircleHeadUpdatesBefore);
assert.ok(sectionCircleProgressionAfter.measures[sectionBAfterCircle.startIndex].startSeconds > sectionCircleProgressionAfter.measures[0].startSeconds);
for (let i = 1; i < sectionCircleProgressionAfter.measures.length; i++) {
	assert.ok(sectionCircleProgressionAfter.measures[i].startSeconds >= sectionCircleProgressionAfter.measures[i - 1].startSeconds);
}
assert.equal(document.getElementById('tonica').value, '0');
assert.equal(document.getElementById('escala').value, '0');
assert.deepEqual(sectionCircleProgressionAfter.measures
	.slice(0, sectionCircleProgressionAfter.sections[0].length)
	.map(function (measure) { return measure.chordName; }), sectionAChordNamesBefore);

document.getElementById('generateProgression').dispatchEvent({
	target: document.getElementById('generateProgression'),
	type: 'click'
});
const randomGeneratedProgression = initialized.uiState.getProgression();
const randomGeneratedDegrees = randomGeneratedProgression.measures.map(function (measure) {
	return measure.degree;
});
assert.equal(randomGeneratedProgression.userEdited, true);
const originalBuildProgressionFromState = options.application.buildProgressionFromState;
let buildProgressionFromStateCalls = 0;
options.application.buildProgressionFromState = function (buildOptions) {
	buildProgressionFromStateCalls += 1;
	return originalBuildProgressionFromState(buildOptions);
};
document.getElementById('progressionMeter').value = '3/4';
document.querySelector('.progressionControls').dispatchEvent({
	target: document.getElementById('progressionMeter'),
	type: 'change'
});
options.application.buildProgressionFromState = originalBuildProgressionFromState;
assert.equal(buildProgressionFromStateCalls, 0);
assert.equal(initialized.uiState.getProgressionState().meter, '3/4');
assert.equal(initialized.uiState.getProgression().userEdited, true);
assert.deepEqual(initialized.uiState.getProgression().measures.map(function (measure) {
	return measure.degree;
}), randomGeneratedDegrees);
document.getElementById('progressionIntensity').value = '102';
document.querySelector('.progressionControls').dispatchEvent({
	target: document.getElementById('progressionIntensity'),
	type: 'change'
});
assert.equal(initialized.uiState.getProgressionState().intensity, 102);
assert.equal(initialized.uiState.getProgression().userEdited, true);
assert.deepEqual(initialized.uiState.getProgression().measures.map(function (measure) {
	return measure.degree;
}), randomGeneratedDegrees);

document.getElementById('progressionNextSectionType').value = 'aprimeVariation';
document.getElementById('constructorProgresiones').dispatchEvent({
	target: document.getElementById('generateProgressionNextSection'),
	type: 'click'
});
const aprimeUiProgression = initialized.uiState.getProgression();
const aprimeUiSection = aprimeUiProgression.sections.find(function (section) {
	return section.id === 'A\'';
});
assert.ok(aprimeUiSection);
assert.ok(changedMeasureCount(
	aprimeUiProgression.measures.slice(0, aprimeUiSection.length),
	aprimeUiProgression.measures.slice(aprimeUiSection.startIndex, aprimeUiSection.startIndex + aprimeUiSection.length)
) >= 1);

const originalGenerateProgressionSection = options.application.generateProgressionSection;
let capturedNextSectionModulation = null;
options.application.generateProgressionSection = function (sectionOptions) {
	capturedNextSectionModulation = sectionOptions.modulationType;
	return originalGenerateProgressionSection(sectionOptions);
};
document.getElementById('progressionNextSectionType').value = 'contrast';
document.getElementById('progressionNextSectionModulationType').value = 'pivot';
document.resetNextSectionModulationOnRender = true;
document.getElementById('constructorProgresiones').dispatchEvent({
	target: document.getElementById('generateProgressionNextSection'),
	type: 'click'
});
document.resetNextSectionModulationOnRender = false;
options.application.generateProgressionSection = originalGenerateProgressionSection;
assert.equal(capturedNextSectionModulation, 'pivot');
assert.equal(initialized.uiState.getProgression().sections.slice(-1)[0].modulation.kind, 'pivot');
assert.notEqual(initialized.uiState.getProgression().sections.slice(-1)[0].contextLabel, initialized.uiState.getProgression().sections[0].contextLabel);

document.getElementById('progressionNextSectionType').value = 'contrast';
document.getElementById('progressionNextSectionModulationType').value = 'secondaryDominant';
document.resetNextSectionControlsOnRender = true;
document.getElementById('constructorProgresiones').dispatchEvent({
	target: {
		closest: function (selector) {
			return selector === '.progressionSectionDeleteButton' || selector === '.progressionSectionNavDeleteButton' ? {
				getAttribute: function (name) {
					return name === 'data-section-delete' ? 'B' : '';
				}
			} : null;
		}
	},
	type: 'click'
});
document.resetNextSectionControlsOnRender = false;
assert.equal(document.getElementById('progressionNextSectionType').value, 'contrast');
assert.equal(document.getElementById('progressionNextSectionModulationType').value, 'secondaryDominant');
assert.equal(document.getElementById('progressionNextSectionModulationType').hidden, false);
assert.equal(initialized.uiState.getProgression().sections.some(function (section) {
	return section.id === 'B';
}), false);

const liveProgression = initialized.uiState.getProgression();
const liveProgressionRendersBefore = rendered.progression;
const liveWorkspaceCountBefore = savedWorkspaces.length;
const liveStopsBefore = transportStops;
playbackPlaying = true;
document.getElementById('progressionIntensity').value = '111';
document.querySelector('.progressionControls').dispatchEvent({
	target: document.getElementById('progressionIntensity'),
	type: 'input'
});
assert.equal(initialized.uiState.getProgressionState().intensity, 111);
assert.strictEqual(initialized.uiState.getProgression(), liveProgression);
assert.equal(initialized.uiState.getProgression().intensity, 111);
assert.ok(initialized.uiState.getProgression().measures.every(function (measure) {
	return measure.intensity === 111;
}));
assert.equal(rendered.progression, liveProgressionRendersBefore);
assert.equal(transportStops, liveStopsBefore);
assert.ok(savedWorkspaces.length > liveWorkspaceCountBefore);
document.getElementById('progressionSwing').value = '33';
document.getElementById('progressionHumanization').value = '22';
document.querySelector('.progressionControls').dispatchEvent({
	target: document.getElementById('progressionSwing'),
	type: 'change'
});
assert.equal(initialized.uiState.getProgressionState().swing, 33);
assert.equal(initialized.uiState.getProgressionState().humanization, 22);
assert.equal(initialized.uiState.getProgression().swing, 33);
assert.equal(initialized.uiState.getProgression().humanization, 22);
assert.equal(rendered.progression, liveProgressionRendersBefore);
assert.equal(transportStops, liveStopsBefore);
playbackPlaying = false;

const knobInput = createFakeElement('testKnobInput', '50');
const knob = createFakeElement('testKnob');
knobInput.min = '0';
knobInput.max = '100';
knobInput.step = '1';
knobInput.focus = function () {
	this.focused = true;
};
knobInput.classList.add('knobControl__input');
knobInput.closest = function (selector) {
	return selector === '.knobControl' ? knob : null;
};
knob.querySelector = function (selector) {
	return selector === '.knobControl__input' ? knobInput : null;
};
knob.style = {
	setProperty: function (name, value) {
		this[name] = value;
	}
};

document.dispatchDocumentEvent({
	deltaY: -100,
	preventDefault: function () {
		this.preventDefaultCalled = true;
	},
	target: {
		closest: function (selector) {
			return selector === '.knobControl' ? knob : null;
		}
	},
	type: 'wheel'
});
assert.equal(knobInput.value, '55');

document.dispatchDocumentEvent({
	deltaY: 100,
	preventDefault: function () {
		this.preventDefaultCalled = true;
	},
	shiftKey: true,
	target: {
		closest: function (selector) {
			return selector === '.knobControl' ? knob : null;
		}
	},
	type: 'wheel'
});
assert.equal(knobInput.value, '54');

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

const renderedBeforePentatonic = rendered.scaleReport;
document.getElementById('escala').value = '8';
document.getElementById('escala').dispatchEvent({
	target: document.getElementById('escala'),
	type: 'change'
});
assert.equal(rendered.scaleReport, renderedBeforePentatonic + 1);
assert.equal(rendered.scaleReportOptions.report.scaleIndex, 8);
assert.deepEqual(rendered.scaleReportOptions.report.scaleNotes.map(function (note) { return note.nombre; }), ['C', 'D', 'E', 'G', 'A']);
assert.equal(rendered.scaleReportOptions.report.scaleChords.length, 0);
assert.equal(initialized.uiState.getProgression().unsupportedScale, true);

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
			if (fakeDocument.resetNextSectionControlsOnRender) {
				fakeDocument.getElementById('progressionNextSectionType').value = 'aprimeClone';
				fakeDocument.getElementById('progressionNextSectionModulationType').value = 'none';
			}
			if (fakeDocument.resetNextSectionModulationOnRender && fakeDocument.getElementById('progressionNextSectionModulationType')) {
				fakeDocument.getElementById('progressionNextSectionModulationType').value = 'none';
			}
		},
		renderScaleReport: function (renderOptions) {
			renderedCounter.scaleReport += 1;
			renderedCounter.scaleReportOptions = renderOptions;
		},
		scheduleDashboardWorkspaceHeight: function () {},
		scheduleInstrumentScale: function () {},
		scheduleSidebarPanelViewport: function () {}
	};
}

function runPendingTimers() {
	while (pendingTimers.length) {
		runNextPendingTimer();
	}
}

function runNextPendingTimer() {
	const timer = pendingTimers.shift();

	if (timer && !timer.cleared) {
		timer.callback();
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
		if (selector === '#notacion .scaleDegreeNoteButton[data-midi-note]') {
			return fakeDocument.scaleDegreeNoteButtons;
		}

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
	addElement('generateProgression');
	addElement('generateProgressionSectionB');
	addElement('generateProgressionNextSection');
	addElement('progressionNextSectionType', 'aprimeClone');
	addElement('progressionNextSectionModulationType', 'none');
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
	addElement('progressionChromaticism', '10');
	addElement('progressionCounterpoint', '20');
	addElement('progressionHarmonicDensity', '0');
	addElement('progressionHumanization', '0');
	addElement('progressionIntensity', '80');
	addElement('progressionMeter', '4/4');
	addElement('progressionModalInterchange', '25');
	addElement('progressionStyle', 'contemporary');
	addElement('progressionSwing', '0');
	addElement('progressionTensions', '35');
	addElement('progressionVoicing', 'closed');
	addElement('progressionVoices', '4');
	addElement('progressionLoop');
	addElement('progressionMetronome');
	fakeDocument.scaleDegreeNoteButtons = ['60', '62', '64'].map(function (midiNote) {
		const button = createFakeElement('scaleNote' + midiNote);
		button.setAttribute('data-midi-note', midiNote);
		return button;
	});

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
		value: value || '',
		style: {
			setProperty: function (name, nextValue) {
				this[name] = nextValue;
			}
		}
	};
}

function changedMeasureCount(sourceMeasures, variationMeasures) {
	let count = 0;

	for (let i = 0; i < sourceMeasures.length && i < variationMeasures.length; i++) {
		if (measureSignature(sourceMeasures[i]) !== measureSignature(variationMeasures[i])) {
			count += 1;
		}
	}

	return count;
}

function measureWithoutMelody(measure) {
	const result = {};

	Object.keys(measure || {}).forEach(function (key) {
		if (key !== 'melodicVoiceIndex' && key !== 'melody' && key !== 'melodyEvents' && key !== 'melodicStartType') {
			result[key] = measure[key];
		}
	});

	return result;
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

function structuralDegree(degree) {
	return String(degree || '').replace(/\s+(6|6\/4|6\/5|4\/3|4\/2)(\s|$)/g, ' ').trim();
}
