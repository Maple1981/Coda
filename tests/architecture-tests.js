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

runScript('js/bootstrap/script-manifest.js');

const manifestScripts = context.window.CodaScriptManifest.applicationScripts;
manifestScripts.filter(function (scriptPath) {
	return scriptPath !== 'js/app.js';
}).forEach(runScript);

const global = context.window;
const scaleReportControllerSource = fs.readFileSync(path.join(root, 'js/ui/scale-report-controller.js'), 'utf8').replace(/\r\n/g, '\n');

assert.ok(global.CodaData);
assert.ok(global.CodaDataCatalogs);
assert.ok(global.CodaChangelogContent.es);
assert.ok(global.CodaChangelogContent.en);
assert.ok(global.CodaWelcomeContent.es);
assert.ok(global.CodaWelcomeContent.en);
assert.ok(global.CodaDataIndex.create);
assert.ok(global.CodaTranslations);
assert.ok(global.CodaI18n.create);
assert.ok(global.CodaMusicalContext.create);
assert.ok(global.CodaNotation.formatNoteName);
assert.ok(global.CodaPreferences.create);
assert.ok(global.CodaDomain.buildScale);
assert.ok(global.CodaDomain.buildScaleReport === undefined);
assert.ok(global.CodaDomain.resolveProgressionDegrees);
assert.ok(global.CodaDomain.shouldPreferFlatsForKeySignature);
assert.ok(global.CodaApplication.buildScaleReport);
assert.ok(global.CodaApplication.createChordPlayback);
assert.ok(global.CodaApplication.createInstrumentPlayback);
assert.ok(global.CodaApplication.playChordFromCellId);
assert.ok(global.CodaApplication.playMidiNote);
assert.ok(global.CodaApplication.buildProgressionFromDegrees);
assert.ok(global.CodaRenderers.scaleSummary);
assert.ok(global.CodaRenderers.scaleChords);
assert.ok(global.CodaRenderers.extendedHarmony);
assert.ok(global.CodaRenderers.instruments);
assert.ok(global.CodaRenderers.circleOfFifths);
assert.ok(global.CodaRenderers.changelog);
assert.ok(global.CodaRenderers.welcome);
assert.ok(global.CodaRenderers.progressionWorkbench);
assert.ok(global.CodaUiState.create);
assert.ok(global.CodaStaticText.apply);
assert.ok(global.CodaVolumeControl.initialize);
assert.ok(global.CodaThemeControl.initialize);
assert.ok(global.CodaRandomSelect.initialize);
assert.ok(global.CodaRandomSelect.randomizeAllAssociatedControls);
assert.ok(global.CodaKeyNavigation.applyRecommendedNotation);
assert.ok(global.CodaChangelogDialog.initialize);
assert.ok(global.CodaUi.renderScaleReport);
assert.ok(global.CodaUi.attachInstrumentEvents);
assert.ok(global.CodaUi.scheduleDashboardWorkspaceHeight);
assert.ok(global.CodaUi.scheduleInstrumentScale);
assert.ok(global.CodaUi.scheduleSidebarPanelViewport);
assert.ok(global.CodaScaleReportController.initialize);
assert.ok(global.CodaPlayback.create);
assert.ok(global.CodaBootstrap.start);
assert.ok(scaleReportControllerSource.indexOf('renderReport();\n\n\t\treturn {') > -1);
assert.ok(scaleReportControllerSource.indexOf("$('#tonica, #escala').change(function ()") > -1);
assert.ok(manifestScripts.indexOf('js/data/constants-data.js') > -1);
assert.ok(manifestScripts.indexOf('js/data/midi-data.js') > -1);
assert.ok(manifestScripts.indexOf('js/data/scales-data.js') > -1);
assert.ok(manifestScripts.indexOf('js/content/changelog-content.js') > -1);
assert.ok(manifestScripts.indexOf('js/content/welcome-content.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/changelog-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/welcome-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/progression-workbench-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/ui-state.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/static-text-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/volume-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/theme-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/random-select-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/key-navigation-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/changelog-dialog-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/domain/progression-domain.js') > -1);
assert.ok(manifestScripts.indexOf('js/application/progression-application.js') > -1);
assert.ok(manifestScripts.indexOf('js/i18n/translations.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/data-index-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/i18n/i18n-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/musical-context-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/notation-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/preferences-service.js') > -1);
assert.deepEqual(manifestScripts.slice(-1), ['js/app.js']);

const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const htmlScripts = [];
const scriptRegex = /<script\s+src="([^"]+)"/g;
let match;
while ((match = scriptRegex.exec(indexHtml)) !== null) {
	htmlScripts.push(match[1]);
}

const manifestIndex = htmlScripts.indexOf('js/bootstrap/script-manifest.js');
assert.ok(manifestIndex > -1);
assert.deepEqual(htmlScripts.slice(manifestIndex + 1, manifestIndex + 1 + manifestScripts.length), manifestScripts);
assert.equal(indexHtml.indexOf('Novedades de la versión actual beta 0.5'), -1);
assert.ok(indexHtml.indexOf('<section id="controlVersiones" aria-live="polite"></section>') > -1);
assert.ok(indexHtml.indexOf('<section id="constructorProgresiones" class="progression-workbench"></section>') > -1);
assert.ok(indexHtml.indexOf('<section id="bienvenida"></section>') > -1);
assert.ok(indexHtml.indexOf('id="randomizeAll"') > -1);
assert.ok(indexHtml.indexOf('data-random-master-groups="global"') > -1);
assert.ok(indexHtml.indexOf('<label id="formatoLabel" class="opcion opcionFormato" for="sostenidos"') > -1);
assert.ok(indexHtml.indexOf('<label class="opcion opcionInstrumento" for="instrumentoSonoro"') > -1);
assert.ok(indexHtml.indexOf('<select id="instrumentoSonoro"></select>') > -1);
assert.ok(indexHtml.indexOf('id="randomizeTonic"') > -1);
assert.ok(indexHtml.indexOf('data-random-select-target="#tonica"') > -1);
assert.ok(indexHtml.indexOf('data-random-group="global"') > -1);
assert.ok(indexHtml.indexOf('id="randomizeScale"') > -1);
assert.ok(indexHtml.indexOf('data-random-select-target="#escala"') > -1);
assert.ok(indexHtml.indexOf('Content-Security-Policy') > -1);
assert.ok(indexHtml.indexOf("script-src 'self'") > -1);
assert.ok(indexHtml.indexOf('fonts.googleapis.com') > -1);
assert.ok(indexHtml.indexOf('fonts.gstatic.com') > -1);
assert.ok(indexHtml.indexOf('material-icons') > -1);
assert.equal(indexHtml.indexOf('script-src https://'), -1);
assert.ok(indexHtml.indexOf('id="themeToggleButton"') > -1);
assert.equal(indexHtml.indexOf('name="instrumento"'), -1);
assert.equal(indexHtml.indexOf('<strong>estudiantes</strong>'), -1);
assert.equal(indexHtml.indexOf('Imaj7'), -1);
assert.equal(global.CodaTranslations.es['changelog.html'], undefined);
assert.equal(global.CodaTranslations.en['changelog.html'], undefined);
assert.equal(global.CodaTranslations.es['welcome.main1'], undefined);
assert.equal(global.CodaTranslations.en['welcome.main1'], undefined);
assert.ok(global.CodaTranslations.es['footer.soundfonts'].indexOf('MIDI.js Soundfonts') > -1);
assert.ok(global.CodaTranslations.en['footer.soundfonts'].indexOf('Creative Commons Attribution 3.0') > -1);
assert.deepEqual(global.CodaPreferences.sanitizeValues({
	format: '1',
	language: 'en',
	midiInstrument: 'drawbar_organ',
	notation: 'latin',
	scaleIndex: '3',
	theme: 'day',
	tonicIndex: '8',
	unknown: '<script>',
	volume: '73'
}), {
	format: '1',
	language: 'en',
	midiInstrument: 'drawbar_organ',
	notation: 'latin',
	scaleIndex: 3,
	theme: 'day',
	tonicIndex: 8,
	volume: 73
});
assert.deepEqual(global.CodaPreferences.sanitizeValues({
	format: '9',
	language: 'fr',
	midiInstrument: '../bad',
	notation: 'bad',
	scaleIndex: 999,
	theme: 'dusk',
	tonicIndex: -1,
	volume: 101
}), {});
assert.ok(fs.readFileSync(path.join(root, 'js/midi/loader.js'), 'utf8').indexOf('root.USE_XHR = false') > -1);
assert.equal(fs.readFileSync(path.join(root, 'js/midi/loader.js'), 'utf8').indexOf('script.text'), -1);
assert.ok(fs.readFileSync(path.join(root, 'js/ui/static-text-controller.js'), 'utf8').indexOf('setTrustedHtml') > -1);
assert.equal(global.CodaRandomSelect.isSelectableOption({ value: '7', text: '------------' }), false);
assert.equal(global.CodaRandomSelect.isSelectableOption({ value: '3', text: 'Menor natural' }), true);
assert.equal(global.CodaRandomSelect.isSelectableOption({ value: '3', text: 'Menor natural', disabled: true }), false);
assert.deepEqual(global.CodaRandomSelect.pickOption([
	{ value: '0', text: 'C' },
	{ value: '1', text: 'D' },
	{ value: '2', text: 'E' }
], function () { return 0.99; }), { value: '2', text: 'E' });
assert.equal(global.CodaRandomSelect.pickNumericValue({
	max: '200',
	min: '20',
	step: '1',
	type: 'number'
}, function () { return 0.999; }), '200');
assert.equal(global.CodaRandomSelect.pickNumericValue({
	max: '6',
	min: '1',
	step: '1',
	type: 'number'
}, function () { return 0; }), '1');

let controllerOptions;
const i18n = global.CodaI18n.create({
	initialLanguage: 'es',
	translations: global.CodaTranslations
});
const englishI18n = global.CodaI18n.create({
	initialLanguage: 'en',
	translations: global.CodaTranslations
});
const preferences = global.CodaPreferences.create();
let playbackOptions;
let loadCalled = false;

const startResult = global.CodaBootstrap.start({
	$: function () {},
	application: global.CodaApplication,
	controller: {
		initialize: function (options) {
			controllerOptions = options;
			return { initialized: true };
		}
	},
	data: global.CodaData,
	domain: global.CodaDomain,
	i18n: i18n,
	initialForm: {
		format: '1',
		midiInstrument: 'string_ensemble_1',
		scaleIndex: '2',
		tonicIndex: '5'
	},
	initialNotation: 'latin',
	initialTheme: 'day',
	initialVolume: 73,
	midi: { plugin: {} },
	notation: global.CodaNotation,
	playbackFactory: {
		create: function (options) {
			playbackOptions = options;
			return {
				load: function () {
					loadCalled = true;
				}
			};
		}
	},
	preferences: preferences,
	renderers: global.CodaRenderers,
	keyNavigation: global.CodaKeyNavigation,
	changelogDialog: { initialize: function () {} },
	musicalContextFactory: global.CodaMusicalContext,
	staticText: global.CodaStaticText,
	themeControl: global.CodaThemeControl,
	ui: global.CodaUi,
	uiStateFactory: global.CodaUiState
});

assert.equal(startResult.controller.initialized, true);
assert.ok(startResult.chordPlayback.playChordFromCellId);
assert.ok(startResult.instrumentPlayback.playMidiNote);
assert.equal(loadCalled, false);
assert.equal(playbackOptions.notes, global.CodaData.notes);
assert.equal(global.CodaData.indexes.notes.indexByName['F#'], 6);
assert.equal(global.CodaData.indexes.chords.byName.Dominante.abreviatura, '7');
assert.equal(playbackOptions.channel, global.CodaData.midi.channel);
assert.equal(playbackOptions.instrument, global.CodaData.midiInstruments[0].id);
assert.equal(playbackOptions.instruments, global.CodaData.midiInstruments);
assert.equal(playbackOptions.volumePercent, 73);
assert.equal(controllerOptions.application, global.CodaApplication);
assert.equal(controllerOptions.changelogDialog.initialize != null, true);
assert.equal(controllerOptions.chordPlayback, startResult.chordPlayback);
assert.equal(controllerOptions.domain, global.CodaDomain);
assert.equal(controllerOptions.i18n, i18n);
assert.deepEqual(controllerOptions.initialForm, {
	format: '1',
	midiInstrument: 'string_ensemble_1',
	scaleIndex: '2',
	tonicIndex: '5'
});
assert.equal(controllerOptions.initialNotation, 'latin');
assert.equal(controllerOptions.initialTheme, 'day');
assert.equal(controllerOptions.initialVolume, 73);
assert.equal(controllerOptions.instrumentPlayback, startResult.instrumentPlayback);
assert.equal(controllerOptions.keyNavigation, global.CodaKeyNavigation);
assert.ok(controllerOptions.musicalContext.fromSelection);
assert.equal(controllerOptions.notation, global.CodaNotation);
assert.equal(controllerOptions.playbackService, startResult.playbackService);
assert.equal(controllerOptions.randomSelectControl, global.CodaRandomSelect);
assert.equal(controllerOptions.preferences, preferences);
assert.equal(controllerOptions.renderers, global.CodaRenderers);
assert.equal(controllerOptions.staticText, global.CodaStaticText);
assert.equal(controllerOptions.themeControl, global.CodaThemeControl);
assert.equal(controllerOptions.ui, global.CodaUi);
assert.equal(controllerOptions.uiState, startResult.uiState);
assert.equal(controllerOptions.volumeControl, global.CodaVolumeControl);
assert.equal(i18n.applyStatic, undefined);
assert.equal(startResult.uiState.getLanguage(), 'es');
assert.equal(startResult.uiState.getNotationStyle(), 'latin');
startResult.uiState.setSelection({ instrument: '0', tonicName: 'C' });
startResult.uiState.setMusicalContext({ tonicName: 'C', scaleName: 'Mayor' });
startResult.uiState.setSelectedTuningIndex(2);
assert.equal(startResult.uiState.getInstrument(), '0');
assert.equal(startResult.uiState.getMusicalContext().scaleName, 'Mayor');
assert.equal(startResult.uiState.getSelectedTuningIndex(), 2);
startResult.uiState.resetSelectedTuningIndex();
assert.equal(startResult.uiState.getSelectedTuningIndex(), 0);

let midiLoadOptions = null;
let playedChord = null;
let stoppedChord = null;
let volumeVelocity = null;
let chordVelocity = null;
let selectedProgram = null;
const lazyPlayback = global.CodaPlayback.create({
	channel: 0,
	initialMidiNote: 60,
	midi: {
		loadPlugin: function (options) {
			midiLoadOptions = options;
		},
		setVolume: function (channel, velocity) {
			volumeVelocity = velocity;
		},
		programChange: function (channel, program) {
			selectedProgram = program;
		},
		chordOn: function (channel, chord, velocity) {
			playedChord = chord;
			chordVelocity = velocity;
		},
		chordOff: function (channel, chord) {
			stoppedChord = chord;
		}
	},
	instruments: global.CodaData.midiInstruments,
	notes: global.CodaData.notes
});

lazyPlayback.playChordFromNames(['C', 'E', 'G']);
assert.ok(midiLoadOptions);
assert.equal(playedChord, null);
assert.equal(midiLoadOptions.api, 'webaudio');
midiLoadOptions.onsuccess();
assert.deepEqual(playedChord, [60, 64, 67]);
assert.deepEqual(stoppedChord, [60, 64, 67]);
assert.equal(volumeVelocity, 127);
assert.equal(chordVelocity, 127);
assert.equal(selectedProgram, 0);
lazyPlayback.setVolume(50);
lazyPlayback.playChordFromNames(['C', 'E', 'G']);
assert.equal(volumeVelocity, 64);
assert.equal(chordVelocity, 64);
lazyPlayback.setVolume(0);
lazyPlayback.playChordFromNames(['C', 'E', 'G']);
assert.equal(chordVelocity, 0);
assert.equal(lazyPlayback.setInstrument('acoustic_guitar_nylon'), 'acoustic_guitar_nylon');
assert.equal(lazyPlayback.isReady(), false);
playedChord = null;
midiLoadOptions = null;
lazyPlayback.playChordFromNames(['C', 'E', 'G']);
assert.equal(midiLoadOptions.instrument, 'acoustic_guitar_nylon');
assert.equal(playedChord, null);
midiLoadOptions.onsuccess();
assert.equal(selectedProgram, 24);
assert.deepEqual(playedChord, [60, 64, 67]);
assert.equal(global.CodaScaleReportController.resolvePlaybackInstrument(global.CodaData, 'string_ensemble_1').viewInstrument, '1');
assert.equal(global.CodaScaleReportController.resolvePlaybackInstrument(global.CodaData, '0').id, 'acoustic_guitar_nylon');
assert.equal(global.CodaThemeControl.normalizeTheme('day'), 'day');
assert.equal(global.CodaThemeControl.normalizeTheme('night'), 'night');
assert.equal(global.CodaThemeControl.normalizeTheme('missing'), 'night');
assert.deepEqual(global.CodaScaleReportController.resolveInitialForm(global.CodaData, {
	format: '1',
	midiInstrument: 'drawbar_organ',
	scaleIndex: '3',
	tonicIndex: '8'
}), {
	format: '1',
	midiInstrument: 'drawbar_organ',
	scaleIndex: 3,
	tonicIndex: 8
});
assert.deepEqual(global.CodaScaleReportController.resolveInitialForm(global.CodaData, {
	format: '9',
	midiInstrument: 'missing',
	scaleIndex: '999',
	tonicIndex: '-1'
}), {
	format: '0',
	midiInstrument: 'acoustic_grand_piano',
	scaleIndex: 0,
	tonicIndex: 0
});

let sliderValue = '100';
let volumeInputHandler = null;
let volumeOutputText = null;
let volumeAriaText = null;
let savedVolume = null;
let appliedVolume = null;
function fakeVolumeElement() {
	return {
		length: 1,
		attr: function (name, value) {
			if (name === 'aria-valuetext') {
				volumeAriaText = value;
			}
			return this;
		},
		on: function (events, handler) {
			if (events === 'input change') {
				volumeInputHandler = handler;
			}
			return this;
		},
		text: function (value) {
			volumeOutputText = value;
			return this;
		},
		val: function (value) {
			if (value !== undefined) {
				sliderValue = String(value);
				return this;
			}
			return sliderValue;
		}
	};
}
const fakeSlider = fakeVolumeElement();
const fakeOutput = fakeVolumeElement();
global.CodaVolumeControl.initialize({
	$: function (selector) {
		return selector === '#selectorVolumen' ? fakeSlider : fakeOutput;
	},
	initialVolume: 42,
	playbackService: {
		getVolume: function () {
			return 100;
		},
		setVolume: function (value) {
			appliedVolume = Number(value);
			return appliedVolume;
		}
	},
	preferences: {
		setValue: function (key, value) {
			if (key === 'volume') {
				savedVolume = value;
			}
		}
	}
});
assert.equal(appliedVolume, 42);
assert.equal(volumeOutputText, '42%');
assert.equal(volumeAriaText, '42%');
assert.equal(savedVolume, null);
sliderValue = '25';
volumeInputHandler();
assert.equal(savedVolume, 25);
assert.equal(appliedVolume, 25);

global.CodaData.scales.forEach(function (scale, index) {
	assert.ok(global.CodaTranslations.es['data.scales.' + index] != null);
	assert.ok(global.CodaTranslations.en['data.scales.' + index] != null);
});
global.CodaData.tunings.forEach(function (tuning, index) {
	assert.ok(global.CodaTranslations.es['data.tunings.' + index] != null);
	assert.ok(global.CodaTranslations.en['data.tunings.' + index] != null);
});
assert.equal(englishI18n.dataLabel('scales', 0, 'Mayor'), 'Major');
assert.equal(englishI18n.dataLabel('tunings', 0, 'Estándar E'), 'Standard E');
assert.equal(global.CodaNotation.formatChordName('F#m7', 'latin'), 'Fa♯m7');
assert.equal(global.CodaNotation.formatNoteSequence('D-F#-A-C', 'latin'), 'Re-Fa♯-La-Do');

global.CodaData.midiInstruments.forEach(function (instrument, index) {
	assert.ok(global.CodaTranslations.es['data.midiInstruments.' + index] != null);
	assert.ok(global.CodaTranslations.en['data.midiInstruments.' + index] != null);
});
assert.equal(englishI18n.dataLabel('midiInstruments', 1, 'Guitarra clásica'), 'Classical guitar');

console.log('Architecture tests passed');
