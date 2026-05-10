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

assert.ok(global.CodaData);
assert.ok(global.CodaDataIndex.create);
assert.ok(global.CodaTranslations);
assert.ok(global.CodaI18n.create);
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
assert.ok(global.CodaUi.renderScaleReport);
assert.ok(global.CodaUi.attachInstrumentEvents);
assert.ok(global.CodaUi.scheduleDashboardWorkspaceHeight);
assert.ok(global.CodaUi.scheduleInstrumentScale);
assert.ok(global.CodaUi.scheduleSidebarPanelViewport);
assert.ok(global.CodaScaleReportController.initialize);
assert.ok(global.CodaPlayback.create);
assert.ok(global.CodaBootstrap.start);
assert.ok(manifestScripts.indexOf('js/domain/progression-domain.js') > -1);
assert.ok(manifestScripts.indexOf('js/application/progression-application.js') > -1);
assert.ok(manifestScripts.indexOf('js/i18n/translations.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/data-index-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/i18n/i18n-service.js') > -1);
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
	initialNotation: 'latin',
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
	ui: global.CodaUi
});

assert.equal(startResult.controller.initialized, true);
assert.ok(startResult.chordPlayback.playChordFromCellId);
assert.ok(startResult.instrumentPlayback.playMidiNote);
assert.equal(loadCalled, false);
assert.equal(playbackOptions.notes, global.CodaData.notes);
assert.equal(global.CodaData.indexes.notes.indexByName['F#'], 6);
assert.equal(global.CodaData.indexes.chords.byName.Dominante.abreviatura, '7');
assert.equal(playbackOptions.channel, global.CodaData.midi.channel);
assert.equal(playbackOptions.instrument, 'acoustic_grand_piano');
assert.equal(controllerOptions.application, global.CodaApplication);
assert.equal(controllerOptions.chordPlayback, startResult.chordPlayback);
assert.equal(controllerOptions.domain, global.CodaDomain);
assert.equal(controllerOptions.i18n, i18n);
assert.equal(controllerOptions.initialNotation, 'latin');
assert.equal(controllerOptions.instrumentPlayback, startResult.instrumentPlayback);
assert.equal(controllerOptions.notation, global.CodaNotation);
assert.equal(controllerOptions.preferences, preferences);
assert.equal(controllerOptions.renderers, global.CodaRenderers);
assert.equal(controllerOptions.ui, global.CodaUi);

let midiLoadOptions = null;
let playedChord = null;
let stoppedChord = null;
const lazyPlayback = global.CodaPlayback.create({
	channel: 0,
	initialMidiNote: 60,
	midi: {
		loadPlugin: function (options) {
			midiLoadOptions = options;
		},
		setVolume: function () {},
		chordOn: function (channel, chord) {
			playedChord = chord;
		},
		chordOff: function (channel, chord) {
			stoppedChord = chord;
		}
	},
	notes: global.CodaData.notes
});

lazyPlayback.playChordFromNames(['C', 'E', 'G']);
assert.ok(midiLoadOptions);
assert.equal(playedChord, null);
midiLoadOptions.onsuccess();
assert.deepEqual(playedChord, [60, 64, 67]);
assert.deepEqual(stoppedChord, [60, 64, 67]);

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

console.log('Architecture tests passed');
