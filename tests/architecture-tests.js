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

[
	'js/data.js',
	'js/domain/music-utils.js',
	'js/domain/scale-domain.js',
	'js/domain/chord-domain.js',
	'js/domain/extended-harmony-domain.js',
	'js/domain/circle-of-fifths-domain.js',
	'js/domain/instrument-domain.js',
	'js/domain/music-domain.js',
	'js/application/scale-report-application.js',
	'js/renderers/scale-summary-renderer.js',
	'js/renderers/scale-chords-renderer.js',
	'js/renderers/extended-harmony-renderer.js',
	'js/renderers/instrument-renderer.js',
	'js/renderers/circle-of-fifths-renderer.js',
	'js/ui/scale-report-ui.js',
	'js/ui/scale-report-controller.js',
	'js/services/playback-service.js',
	'js/bootstrap/coda-bootstrap.js'
].forEach(runScript);

const global = context.window;

assert.ok(global.CodaData);
assert.ok(global.CodaDomain.buildScale);
assert.ok(global.CodaDomain.buildScaleReport === undefined);
assert.ok(global.CodaApplication.buildScaleReport);
assert.ok(global.CodaRenderers.scaleSummary);
assert.ok(global.CodaRenderers.scaleChords);
assert.ok(global.CodaRenderers.extendedHarmony);
assert.ok(global.CodaRenderers.instruments);
assert.ok(global.CodaRenderers.circleOfFifths);
assert.ok(global.CodaUi.renderScaleReport);
assert.ok(global.CodaScaleReportController.initialize);
assert.ok(global.CodaPlayback.create);
assert.ok(global.CodaBootstrap.start);

let controllerOptions;
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
	midi: { plugin: {} },
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
	renderers: global.CodaRenderers,
	ui: global.CodaUi
});

assert.equal(startResult.controller.initialized, true);
assert.equal(loadCalled, true);
assert.equal(playbackOptions.notes, global.CodaData.notes);
assert.equal(playbackOptions.channel, global.CodaData.midi.channel);
assert.equal(playbackOptions.instrument, 'acoustic_grand_piano');
assert.equal(controllerOptions.application, global.CodaApplication);
assert.equal(controllerOptions.domain, global.CodaDomain);
assert.equal(controllerOptions.renderers, global.CodaRenderers);
assert.equal(controllerOptions.ui, global.CodaUi);

console.log('Architecture tests passed');
