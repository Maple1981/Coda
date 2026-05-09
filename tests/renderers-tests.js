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
	'js/domain/music-domain.js',
	'js/renderers/extended-harmony-renderer.js'
].forEach(runScript);

const data = context.window.CodaData;
const domain = context.window.CodaDomain;
const renderer = context.window.CodaRenderers.extendedHarmony;

function byName(collection, name) {
	return collection.find(function (item) {
		return item.nombre === name;
	});
}

function noteIndex(name) {
	return data.notes.findIndex(function (note) {
		return note.nombre === name || note.enarmonica === name;
	});
}

const cMajor = domain.buildScale({
	tonicIndex: noteIndex('C'),
	scaleDefinition: byName(data.scales, 'Mayor'),
	notes: data.notes,
	intervals: data.intervals,
	octaveSemitones: data.constants.octaveSemitones,
	preferFlats: false
});

const cMajorChords = domain.buildScaleChords({
	scaleNotes: cMajor,
	scaleDefinition: byName(data.scales, 'Mayor'),
	chordDefinitions: data.chords,
	octaveSemitones: data.constants.octaveSemitones
});

const html = renderer.render({
	data: data,
	domain: domain,
	mode: 'M',
	preferFlats: false,
	scaleChords: cMajorChords,
	scaleName: 'Mayor',
	scaleNotes: cMajor,
	tonicName: 'C'
});

assert.ok(html.indexOf('<div id="acordeonArmoniaExtendida">') > -1);
assert.ok(html.indexOf('Dominantes secundarios (D)') > -1);
assert.ok(html.indexOf('D7 (V-V)') > -1);
assert.ok(html.indexOf('D-F#-A-C') > -1);
assert.ok(html.indexOf('class="celdaAcorde" id="D-F#-A-C"') > -1);

console.log('Renderer tests passed');
