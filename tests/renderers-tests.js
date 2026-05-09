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
	'js/renderers/scale-summary-renderer.js',
	'js/renderers/scale-chords-renderer.js',
	'js/renderers/extended-harmony-renderer.js',
	'js/renderers/instrument-renderer.js',
	'js/renderers/circle-of-fifths-renderer.js'
].forEach(runScript);

const data = context.window.CodaData;
const domain = context.window.CodaDomain;
const circleOfFifthsRenderer = context.window.CodaRenderers.circleOfFifths;
const extendedHarmonyRenderer = context.window.CodaRenderers.extendedHarmony;
const instrumentsRenderer = context.window.CodaRenderers.instruments;
const scaleChordsRenderer = context.window.CodaRenderers.scaleChords;
const scaleSummaryRenderer = context.window.CodaRenderers.scaleSummary;

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

const cMinorNatural = domain.buildScale({
	tonicIndex: noteIndex('C'),
	scaleDefinition: byName(data.scales, 'Menor natural'),
	notes: data.notes,
	intervals: data.intervals,
	octaveSemitones: data.constants.octaveSemitones,
	preferFlats: false
});

const cMinorNaturalChords = domain.buildScaleChords({
	scaleNotes: cMinorNatural,
	scaleDefinition: byName(data.scales, 'Menor natural'),
	chordDefinitions: data.chords,
	octaveSemitones: data.constants.octaveSemitones
});

const scaleSummaryHtml = scaleSummaryRenderer.render({
	circleOfFifths: data.circleOfFifths,
	isDegreeSuppressed: function () { return false; },
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleName: 'Mayor',
	scaleNotes: cMajor,
	selectedScaleIndex: 0,
	tonicName: 'C'
});

assert.ok(scaleSummaryHtml.indexOf('<h3>C Mayor</h3>') > -1);
assert.ok(scaleSummaryHtml.indexOf('<span id="A_m_" class="revamp estiloEnlace">Am</span>') > -1);
assert.ok(scaleSummaryHtml.indexOf('<span id="C_m" class="revamp estiloEnlace">Cm</span>') > -1);
assert.ok(scaleSummaryHtml.indexOf('<ul class="notasEscala">') > -1);
assert.ok(scaleSummaryHtml.indexOf('C<sup>I</sup>') > -1);

const circleHtml = circleOfFifthsRenderer.render({
	orderedKeys: data.circleOfFifths.slice(0, 12),
	selectedKey: 'C'
});

assert.ok(circleHtml.indexOf('<div id="circuloDesplegado">') > -1);
assert.ok(circleHtml.indexOf('class="circulo numero0" style="top: 50px; left: 130px;"') > -1);
assert.ok(circleHtml.indexOf('<p class="actual"><span id="C_" class="revamp estiloEnlace">C</span></p>') > -1);
assert.ok(circleHtml.indexOf('<span id="A_m" class="revamp estiloEnlace">Am</span>') > -1);

const guitarHtml = instrumentsRenderer.renderGuitar({
	scaleDefinition: byName(data.scales, 'Mayor'),
	strings: [
		{
			aire: 'E',
			perteneceEscala: true,
			trastes: [
				{ nombre: 'F', perteneceEscala: true },
				{ nombre: 'F#', perteneceEscala: false }
			]
		}
	],
	tuning: data.tunings[0],
	tunings: data.tunings
});

assert.ok(guitarHtml.indexOf('<select id="selectorAfinaciones">') > -1);
assert.ok(guitarHtml.indexOf('<table class="diapason">') > -1);
assert.ok(guitarHtml.indexOf('<td class="celdaNota perteneceEscala"><span>E</span></td>') > -1);
assert.ok(guitarHtml.indexOf('<td><span>2</span></td>') > -1);

const pianoKeyboard = domain.buildPianoKeyboard({
	isDegreeSuppressed: function () { return false; },
	notes: data.notes,
	octaveCount: 1,
	preferFlats: true,
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleNotes: cMajor
});

const pianoHtml = instrumentsRenderer.renderPiano({
	keyboard: pianoKeyboard,
	scaleDefinition: byName(data.scales, 'Mayor')
});

assert.ok(pianoHtml.indexOf('<table class="teclasNegras">') > -1);
assert.ok(pianoHtml.indexOf('<table class="teclasBlancas">') > -1);
assert.ok(pianoHtml.indexOf('<span>Bb</span>') > -1);
assert.ok(pianoHtml.indexOf('<td class="celdaNota  perteneceEscala"><span>C</span></td>') > -1);

const scaleChordsHtml = scaleChordsRenderer.render({
	mode: 'M',
	parallelScaleChords: cMinorNaturalChords,
	scaleChords: cMajorChords,
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleNotes: cMajor
});

assert.ok(scaleChordsHtml.indexOf('<table class="acordesEscala">') > -1);
assert.ok(scaleChordsHtml.indexOf('Cmaj7') > -1);
assert.ok(scaleChordsHtml.indexOf('class="celdaAcorde" id="G-B-D-F"') > -1);
assert.ok(scaleChordsHtml.indexOf('<td>V7</td>') > -1);
assert.ok(scaleChordsHtml.indexOf('<td class="cabecera">Función: </td>') > -1);

const dDorianDefinition = data.scales.find(function (scale) {
	return scale.modal === 'true' && scale.nombre.indexOf('rico') > -1;
});

const dDorian = domain.buildScale({
	tonicIndex: noteIndex('D'),
	scaleDefinition: byName(data.scales, 'Modo dórico'),
	notes: data.notes,
	intervals: data.intervals,
	octaveSemitones: data.constants.octaveSemitones,
	preferFlats: false
});

const dDorianChords = domain.buildScaleChords({
	scaleNotes: dDorian,
	scaleDefinition: byName(data.scales, 'Modo dórico'),
	chordDefinitions: data.chords,
	octaveSemitones: data.constants.octaveSemitones
});

const modalSummaryHtml = scaleSummaryRenderer.renderList({
	circleOfFifths: data.circleOfFifths,
	isDegreeSuppressed: function () { return false; },
	scaleDefinition: dDorianDefinition,
	scaleNotes: dDorian,
	selectedScaleIndex: 7,
	tonicName: 'D'
});

assert.ok(modalSummaryHtml.indexOf('<span class="principal">Nota principal</span>') > -1);
assert.ok(modalSummaryHtml.indexOf('<li class="principal">') > -1);
assert.ok(modalSummaryHtml.indexOf('<li class="secundaria">') > -1);

const modalChordsHtml = scaleChordsRenderer.render({
	mode: '',
	parallelScaleChords: [],
	scaleChords: dDorianChords,
	scaleDefinition: byName(data.scales, 'Modo dórico'),
	scaleNotes: dDorian
});

assert.ok(modalChordsHtml.indexOf('<span class="cadencial">') > -1);
assert.ok(modalChordsHtml.indexOf('<span class="evitar">') > -1);
assert.ok(modalChordsHtml.indexOf('Acorde cadencial') > -1);

const html = extendedHarmonyRenderer.render({
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
